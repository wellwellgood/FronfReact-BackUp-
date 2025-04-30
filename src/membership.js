// ✅ Firebase 인증 연동된 membership.js
import React, { useState } from "react";
import { auth } from "./firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import axios from "axios";
import styles from "./membership.module.css";

const Membership = () => {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendCode = async () => {
    const { phone1, phone2, phone3 } = formData;
    const fullPhone = `+82${phone1}${phone2}${phone3}`;

    if (!/^\+821[0-9]{8,9}$/.test(fullPhone)) {
      alert("올바른 휴대폰 번호를 입력해주세요.");
      return;
    }

    try {
      window.recaptchaVerifier = new RecaptchaVerifier("recaptcha-container", {
        size: "invisible",
      }, auth);

      const confirmationResult = await signInWithPhoneNumber(auth, fullPhone, window.recaptchaVerifier);
      setConfirmation(confirmationResult);
      alert("✅ 인증번호가 전송되었습니다.");
    } catch (error) {
      console.error("❌ 인증번호 전송 실패:", error);
      alert("❌ 인증번호 전송 실패");
    }
  };

  const handleVerifyCode = async () => {
    if (!confirmation) return alert("인증번호 요청이 먼저 필요합니다.");
    try {
      await confirmation.confirm(verificationCode);
      setVerifySuccess(true);
      alert("✅ 인증 성공");
    } catch (error) {
      console.error("❌ 인증 실패:", error);
      alert("❌ 인증번호가 올바르지 않습니다.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!verifySuccess) return alert("❌ 인증번호를 먼저 확인해주세요.");
    if (formData.password !== formData.confirmPassword)
      return alert("❌ 비밀번호가 일치하지 않습니다.");

    try {
      const response = await axios.post("/api/auth/register", formData);
      if (response.data.message === "회원가입 성공") {
        alert("🎉 회원가입 완료!");
        window.location.href = "/";
      } else {
        alert(`❌ 회원가입 실패: ${response.data.message}`);
      }
    } catch (error) {
      console.error("❌ 회원가입 실패:", error);
      alert("❌ 서버 오류로 회원가입 실패");
    }
  };

  return (
    <div className={styles.findID}>
      <div className={styles.img}>
      <link to="/"></link>
      </div>
      <form className={styles.IDform} onSubmit={handleSubmit}>
        <div className={styles.IDarea}>
          <h1>회원가입</h1>

          <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="아이디" className={styles.name} required />
          <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="이름" className={styles.name} required />
          <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="비밀번호" className={styles.name} required />
          <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="비밀번호 확인" className={styles.name} required />

          <div className={styles.phoneGroup}>
            <input type="text" name="phone1" value={formData.phone1} onChange={handleChange} maxLength="3" placeholder="010" required />
            <span>-</span>
            <input type="text" name="phone2" value={formData.phone2} onChange={handleChange} maxLength="4" placeholder="1234" required />
            <span>-</span>
            <input type="text" name="phone3" value={formData.phone3} onChange={handleChange} maxLength="4" placeholder="5678" required />
          </div>

          <button type="button" className={styles.verifysend} onClick={handleSendCode}>인증번호 전송</button>

          <input type="text" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} placeholder="인증번호 입력" className={styles.verifyInput} />

          <button type="button" className={styles.verifycheck} onClick={handleVerifyCode}>인증번호 확인</button>

          <button type="submit" className={styles.submitBtn}>가입하기</button>
        </div>
      </form>
      {/* invisible reCAPTCHA 위치 */}
      <div id="recaptcha-container"></div>
    </div>
  );
};

export default Membership;
