import React, { useState, useEffect } from "react";
import { initializeFirebase, getFirebaseAuth } from "./firebase";
import { signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";
import { doc, setDoc, getFirestore } from "firebase/firestore";
import axios from "axios";
import styles from "./membership.module.css";

const Membership = () => {
  // State management
  const [auth, setAuth] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    password: "",
    confirmPassword: "",
    phone1: "",
    phone2: "",
    phone3: "",
  });
  const [verificationCode, setVerificationCode] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [verifySuccess, setVerifySuccess] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [initializationStatus, setInitializationStatus] = useState("pending"); // 'pending', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState("");
  const [recaptchaVerifier, setRecaptchaVerifier] = useState(null);
  
  // Initialize Firebase on component mount
  useEffect(() => {
    let isMounted = true;
    
    const initialize = async () => {
      try {
        const { auth: authInstance } = await initializeFirebase();
        if (!isMounted) return;
        
        // Create a new invisible reCAPTCHA verifier
        const verifier = new RecaptchaVerifier(authInstance, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {
            console.log("✅ reCAPTCHA verified");
          },
          'expired-callback': () => {
            console.log("⚠️ reCAPTCHA expired");
            // If needed, create a new verifier here
          }
        });
        
        setAuth(authInstance);
        setRecaptchaVerifier(verifier);
        setInitializationStatus("success");
        console.log("✅ Firebase initialization successful");
      } catch (error) {
        console.error("❌ Firebase initialization failed:", error);
        if (!isMounted) return;
        setErrorMessage(`초기화 실패: ${error.message || "알 수 없는 오류"}`);
        setInitializationStatus("error");
      }
    };
  
    initialize();
  
    return () => {
      isMounted = false;
      // Clean up the reCAPTCHA verifier if it exists
      if (recaptchaVerifier) {
        try {
          recaptchaVerifier.clear();
          console.log("✅ reCAPTCHA verifier cleared");
        } catch (error) {
          console.warn("⚠️ reCAPTCHA cleanup error:", error);
        }
      }
    };
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Format phone number for Firebase Auth
  const formatPhoneNumber = () => {
    const { phone1, phone2, phone3 } = formData;
    
    // Format to international format starting with +82
    const formattedPhone = phone1.startsWith("0") 
      ? `+82${phone1.slice(1)}${phone2}${phone3}` 
      : `+82${phone1}${phone2}${phone3}`;
    
    console.log("📱 Formatted phone number:", formattedPhone);
    return formattedPhone;
  };

  // Retry initialization if it failed
  const handleRetryInitialization = async () => {
    setInitializationStatus("pending");
    setErrorMessage("");
    
    try {
      const { auth: authInstance } = await initializeFirebase();
      setAuth(authInstance);
      setInitializationStatus("success");
    } catch (error) {
      console.error("❌ Re-initialization failed:", error);
      setErrorMessage(`재초기화 실패: ${error.message || "알 수 없는 오류"}`);
      setInitializationStatus("error");
    }
  };

  // Send verification code
  const handleSendCode = async () => {
    if (initializationStatus !== "success") {
      alert("인증 시스템이 준비되지 않았습니다. 다시 시도해주세요.");
      return;
    }
  
    if (!auth) {
      alert("Firebase 인증 정보가 누락되었습니다.");
      return;
    }
  
    if (!recaptchaVerifier) {
      alert("reCAPTCHA가 준비되지 않았습니다.");
      return;
    }
  
    setIsLoading(true);
  
    try {
      const phoneNumber = formatPhoneNumber();
      if (!/^\+82\d{9,10}$/.test(phoneNumber)) {
        throw new Error("올바른 휴대폰 번호를 입력해주세요");
      }
  
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      setConfirmation(confirmationResult);
      alert("✅ 인증번호가 전송되었습니다");
    } catch (error) {
      console.error("❌ Failed to send verification code:", error);
      alert("❌ 인증번호 전송 실패: " + (error.message || "알 수 없는 오류"));
    } finally {
      setIsLoading(false);
    }
  };

  // Verify the code entered by user
  const handleVerifyCode = async () => {
    if (!confirmation) {
      alert("인증번호 요청을 먼저 해주세요.");
      return;
    }
    
    if (!verificationCode.trim()) {
      alert("인증번호를 입력해주세요.");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Confirm the verification code
      const result = await confirmation.confirm(verificationCode);
      
      // Process successful verification
      if (result?.user) {
        setFirebaseUser(result.user);
        setVerifySuccess(true);
        alert("✅ 휴대폰 인증에 성공했습니다.");
      } else {
        throw new Error("사용자 정보를 받지 못했습니다");
      }
    } catch (error) {
      console.error("❌ Verification failed:", error);
      
      // Format error message based on error code
      let errorMessage = "인증번호가 올바르지 않습니다";
      
      if (error.code === 'auth/code-expired') {
        errorMessage = "인증번호가 만료되었습니다. 새로운 인증번호를 요청해주세요.";
      } else if (error.code === 'auth/invalid-verification-code') {
        errorMessage = "잘못된 인증번호입니다. 다시 확인해주세요.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`❌ ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!verifySuccess || !firebaseUser) {
      alert("❌ 휴대폰 인증을 먼저 완료해주세요.");
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      alert("❌ 비밀번호가 일치하지 않습니다.");
      return;
    }
    
    if (formData.password.length < 6) {
      alert("❌ 비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    // Format phone number with hyphens
    const fullPhone = `${formData.phone1}-${formData.phone2}-${formData.phone3}`;
    setIsLoading(true);

    try {
      // Register user with API
      const mariaRes = await axios.post("/api/auth/register", {
        username: formData.username,
        name: formData.name,
        password: formData.password,
        phone: fullPhone,
        firebase_uid: firebaseUser.uid,
      });

      // Handle successful API registration
      if (mariaRes.data?.message === "회원가입 성공") {
        try {
          // Get Firestore instance
          const db = await getFirestore();
          
          // Store user data in Firestore
          await setDoc(doc(db, "users", firebaseUser.uid), {
            uid: firebaseUser.uid,
            username: formData.username,
            name: formData.name,
            phone: fullPhone,
            createdAt: new Date(),
          });

          alert("🎉 회원가입이 성공적으로 완료되었습니다!");
          window.location.href = "/";
        } catch (firestoreError) {
          console.error("❌ Firestore data storage failed:", firestoreError);
          alert("⚠️ 회원가입은 완료되었으나 일부 정보 저장에 실패했습니다. 관리자에게 문의하세요.");
          window.location.href = "/";
        }
      } else {
        alert(`❌ 회원가입 실패: ${mariaRes.data?.message || "알 수 없는 오류"}`);
      }
    } catch (error) {
      console.error("❌ Registration error:", error);
      
      // Handle API error response
      if (error.response?.data?.message) {
        alert(`❌ 서버 오류: ${error.response.data.message}`);
      } else {
        alert(`❌ 회원가입 처리 중 오류가 발생했습니다: ${error.message || "알 수 없는 오류"}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Render initialization status message
  const renderInitializationStatus = () => {
    switch (initializationStatus) {
      case "pending":
        return <p className={styles.statusMessage}>⏳ 인증 시스템 초기화 중...</p>;
      case "success":
        return <p className={styles.statusMessage} style={{ color: "green" }}>✅ 인증 시스템 준비 완료</p>;
      case "error":
        return (
          <div className={styles.errorContainer}>
            <p className={styles.statusMessage} style={{ color: "red" }}>
              ❌ 초기화 실패: {errorMessage}
            </p>
            <button 
              type="button" 
              className={styles.retryButton}
              onClick={handleRetryInitialization}
            >
              다시 시도
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.findID}>
      <div className={styles.img}></div>

      {renderInitializationStatus()}

      <form className={styles.IDform} onSubmit={handleSubmit}>
        <div className={styles.IDarea}>
          <h1>회원가입</h1>
          <input 
            type="text" 
            name="username" 
            value={formData.username} 
            onChange={handleChange} 
            placeholder="아이디" 
            className={styles.name} 
            required 
            disabled={isLoading}
          />
          <input 
            type="text" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            placeholder="이름" 
            className={styles.name} 
            required 
            disabled={isLoading}
          />
          <input 
            type="password" 
            name="password" 
            value={formData.password} 
            onChange={handleChange} 
            placeholder="비밀번호 (6자 이상)" 
            className={styles.name} 
            required 
            disabled={isLoading}
            minLength={6}
          />
          <input 
            type="password" 
            name="confirmPassword" 
            value={formData.confirmPassword} 
            onChange={handleChange} 
            placeholder="비밀번호 확인" 
            className={styles.name} 
            required 
            disabled={isLoading}
          />

          <div className={styles.phoneGroup}>
            <input 
              type="text" 
              name="phone1" 
              value={formData.phone1} 
              onChange={handleChange} 
              maxLength="3" 
              placeholder="010" 
              required 
              disabled={isLoading || verifySuccess}
            />
            <span>-</span>
            <input 
              type="text" 
              name="phone2" 
              value={formData.phone2} 
              onChange={handleChange} 
              maxLength="4" 
              placeholder="1234" 
              required 
              disabled={isLoading || verifySuccess}
            />
            <span>-</span>
            <input 
              type="text" 
              name="phone3" 
              value={formData.phone3} 
              onChange={handleChange} 
              maxLength="4" 
              placeholder="5678" 
              required 
              disabled={isLoading || verifySuccess}
            />
          </div>

          <button
            type="button"
            className={styles.verifysend}
            onClick={handleSendCode}
            disabled={
              isLoading || 
              initializationStatus !== "success" || 
              !formData.phone1 || 
              !formData.phone2 || 
              !formData.phone3 ||
              verifySuccess
            }
          >
            {isLoading ? "처리중..." : "인증번호 전송"}
          </button>

          <input 
            type="text" 
            value={verificationCode} 
            onChange={(e) => setVerificationCode(e.target.value)} 
            placeholder="인증번호 입력" 
            className={styles.verifyInput} 
            disabled={isLoading || !confirmation || verifySuccess}
          />
          
          <button 
            type="button" 
            className={styles.verifycheck} 
            onClick={handleVerifyCode}
            disabled={
              isLoading || 
              !confirmation || 
              verifySuccess || 
              !verificationCode.trim()
            }
          >
            {isLoading ? "인증중..." : "인증번호 확인"}
          </button>
          
          <button 
            type="submit" 
            className={styles.submitBtn}
            disabled={
              isLoading || 
              !verifySuccess || 
              !formData.username || 
              !formData.name || 
              !formData.password || 
              formData.password !== formData.confirmPassword
            }
          >
            {isLoading ? "처리중..." : "가입하기"}
          </button>
          
          {verifySuccess && (
            <p className={styles.successMessage} style={{ color: "green", marginTop: "10px" }}>
              ✅ 휴대폰 인증이 완료되었습니다.
            </p>
          )}
        </div>
      </form>

      {/* reCAPTCHA container - Empty div for reCAPTCHA to render into */}
      <div id="recaptcha-container"></div>
    </div>
  );
};

export default Membership;
