import React, { useState } from "react";
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
  const [sentCode, setSentCode] = useState("");
  const [verifySuccess, setVerifySuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendCode = async () => {
    const { phone1, phone2, phone3 } = formData;
    const fullPhone = `${phone1}-${phone2}-${phone3}`;

    if (!phone1 || !phone2 || !phone3) {
      alert("휴대폰 번호를 모두 입력해주세요.");
      return;
    }

    if (!/^01[0-9]-\d{3,4}-\d{4}$/.test(fullPhone)) {
      alert("휴대폰 번호 형식이 올바르지 않습니다.");
      return;
    }

    try {
      const response = await axios.post("/api/send-code", { phoneNumber: fullPhone });
      if (response.data.success) {
        setSentCode(response.data.code);
        alert("✅ 인증번호가 전송되었습니다.");
      } else {
        alert("❌ 인증번호 전송 실패");
      }
    } catch (error) {
      console.error("❌ 인증번호 전송 에러:", error);
      alert("❌ 서버 오류로 인증번호 전송 실패");
    }
  };

  const handleVerifyCode = () => {
    if (verificationCode === sentCode) {
      setVerifySuccess(true);
      alert("✅ 인증 성공");
    } else {
      setVerifySuccess(false);
      alert("❌ 인증번호가 일치하지 않습니다.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!verifySuccess) {
      alert("❌ 인증번호를 먼저 확인해주세요.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("❌ 비밀번호가 일치하지 않습니다.");
      return;
    }

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
      <div className={styles.img}></div>
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
          />

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="이름"
            className={styles.name}
            required
          />

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="비밀번호"
            className={styles.name}
            required
          />

          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="비밀번호 확인"
            className={styles.name}
            required
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
            />
          </div>

          <button type="button" className={styles.verifysend} onClick={handleSendCode}>
            인증번호 전송
          </button>

          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="인증번호 입력"
            className={styles.verifyInput}
          />

          <button type="button" className={styles.verifycheck} onClick={handleVerifyCode}>
            인증번호 확인
          </button>

          <button type="submit" className={styles.submitBtn}>
            가입하기
          </button>
        </div>
      </form>
    </div>
  );
};

export default Membership;
