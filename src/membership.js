import React, { useState, useEffect } from "react";
import { initializeFirebase } from "./firebase";
import { signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";
import { doc, setDoc, getFirestore } from "firebase/firestore";
import axios from "axios";
import styles from "./membership.module.css";

const Membership = () => {
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
  const [initializationStatus, setInitializationStatus] = useState("pending");
  const [errorMessage, setErrorMessage] = useState("");
  const [recaptchaVerifier, setRecaptchaVerifier] = useState(null);
  const BASE_URL = "https://react-server-wmqa.onrender.com";

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        const { auth: authInstance } = await initializeFirebase();
        if (!isMounted || !authInstance) throw new Error("authInstance is null");

        const recaptchaElement = document.getElementById("recaptcha-container");
        if (!recaptchaElement) throw new Error("reCAPTCHA 컨테이너가 없습니다");

        const verifier = new RecaptchaVerifier(authInstance, "recaptcha-container", {
          size: "invisible",
          callback: () => console.log("✅ reCAPTCHA verified"),
          "expired-callback": () => console.log("⚠️ reCAPTCHA expired"),
        });

        setAuth(authInstance);
        setRecaptchaVerifier(verifier);
        setInitializationStatus("success");
        console.log("✅ Firebase initialization successful");
      } catch (error) {
        console.error("❌ Firebase initialization failed:", error);
        if (!isMounted) return;
        setErrorMessage(error.message || "알 수 없는 오류");
        setInitializationStatus("error");
      }
    };

    const timer = setTimeout(initialize, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (recaptchaVerifier) {
        try {
          recaptchaVerifier.clear();
          console.log("✅ reCAPTCHA cleared");
        } catch (error) {
          console.warn("⚠️ reCAPTCHA cleanup error:", error);
        }
      }
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const formatPhoneNumber = () => {
    const { phone1, phone2, phone3 } = formData;
    return phone1.startsWith("0")
      ? `+82${phone1.slice(1)}${phone2}${phone3}`
      : `+82${phone1}${phone2}${phone3}`;
  };

  const handleSendCode = async () => {
    if (initializationStatus !== "success" || !auth || !recaptchaVerifier) {
      alert("인증 시스템이 준비되지 않았습니다.");
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
      console.error("❌ 인증번호 전송 실패:", error);
      alert("❌ " + (error.message || "인증번호 전송 중 오류"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!confirmation || !verificationCode.trim()) {
      alert("인증번호 입력 후 확인해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await confirmation.confirm(verificationCode);
      if (result?.user) {
        setFirebaseUser(result.user);
        setVerifySuccess(true);
        alert("✅ 휴대폰 인증 완료!");
      } else {
        throw new Error("사용자 정보를 불러올 수 없습니다");
      }
    } catch (error) {
      console.error("❌ 인증 실패:", error);
      alert("❌ " + (error.message || "인증 실패"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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

    const fullPhone = `${formData.phone1}-${formData.phone2}-${formData.phone3}`;
    setIsLoading(true);

    try {
      const mariaRes = await axios.post('${BASE_URL}/api/auth/register', {
        username: formData.username,
        name: formData.name,
        password: formData.password,
        phone: fullPhone,
        firebase_uid: firebaseUser.uid,
      });

      if (mariaRes.data?.message === "회원가입 성공") {
        const db = await getFirestore();
        await setDoc(doc(db, "users", firebaseUser.uid), {
          uid: firebaseUser.uid,
          username: formData.username,
          name: formData.name,
          phone: fullPhone,
          createdAt: new Date(),
        });

        alert("🎉 회원가입 완료!");
        window.location.href = "/";
      } else {
        throw new Error(mariaRes.data?.message || "회원가입 실패");
      }
    } catch (error) {
      console.error("❌ 회원가입 에러:", error);
      alert("❌ " + (error.message || "회원가입 처리 중 오류 발생"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.findID}>
      <form className={styles.IDform} onSubmit={handleSubmit}>
        <div className={styles.IDarea}>
          <h1>회원가입</h1>
          <input name="username" placeholder="아이디" value={formData.username} onChange={handleChange} disabled={isLoading} required />
          <input name="name" placeholder="이름" value={formData.name} onChange={handleChange} disabled={isLoading} required />
          <input name="password" type="password" placeholder="비밀번호 (6자 이상)" value={formData.password} onChange={handleChange} disabled={isLoading} minLength={6} required />
          <input name="confirmPassword" type="password" placeholder="비밀번호 확인" value={formData.confirmPassword} onChange={handleChange} disabled={isLoading} required />

          <div className={styles.phoneGroup}>
            <input name="phone1" maxLength="3" placeholder="010" value={formData.phone1} onChange={handleChange} disabled={isLoading || verifySuccess} required />
            <span>-</span>
            <input name="phone2" maxLength="4" placeholder="1234" value={formData.phone2} onChange={handleChange} disabled={isLoading || verifySuccess} required />
            <span>-</span>
            <input name="phone3" maxLength="4" placeholder="5678" value={formData.phone3} onChange={handleChange} disabled={isLoading || verifySuccess} required />
          </div>

          <button type="button" onClick={handleSendCode} disabled={isLoading || verifySuccess}>인증번호 전송</button>

          <input placeholder="인증번호 입력" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} disabled={isLoading || !confirmation || verifySuccess} />
          <button type="button" onClick={handleVerifyCode} disabled={isLoading || !confirmation || verifySuccess}>인증번호 확인</button>

          <button type="submit" disabled={isLoading || !verifySuccess}>가입하기</button>
          {verifySuccess && <p className={styles.successMessage}>✅ 휴대폰 인증이 완료되었습니다.</p>}
        </div>
      </form>

      <div id="recaptcha-container"></div>
    </div>
  );
};

export default Membership;
