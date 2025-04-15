import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "../src/test/src/css/password.module.css";

export default function Password() {
  const [userId, setUserId] = useState("");
  const [phone, setPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [serverCode, setServerCode] = useState("");
  const [timer, setTimer] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [result, setResult] = useState("");

  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdown);
    }
  }, [timer]);

  const handleSendCode = async () => {
    if (!phone) return alert("전화번호를 입력해주세요.");
    try {
      const res = await axios.post("/api/send-code", { phone });
      setServerCode(res.data.code);
      setTimer(180);
      alert("인증번호가 발송되었습니다.");
    } catch (err) {
      console.error(err);
      alert("인증번호 발송 실패");
    }
  };

  const handleVerify = () => {
    if (verificationCode === serverCode) {
      setIsVerified(true);
      alert("인증 성공");
    } else {
      alert("인증 실패");
    }
  };

  const handleResetPassword = async () => {
    if (!isVerified) return alert("전화번호 인증이 필요합니다.");
    try {
      const res = await axios.post("/api/reset-password", { userId, phone });
      setResult(res.data.message);
    } catch (err) {
      console.error(err);
      alert("비밀번호 재설정 요청 실패");
    }
  };

  return (
    <div className={styles.findID}>
      <div className={styles.IDform}>
        <div className={styles.IDarea}>
          <h1>비밀번호 찾기</h1>
          <input
            className={styles.name}
            type="text"
            placeholder="아이디 입력"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <input
            className={styles.number}
            type="text"
            placeholder="전화번호 입력"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button className={styles.sendBtn} onClick={handleSendCode}>인증번호 받기</button>
          {timer > 0 && <p>남은 시간: {timer}s</p>}

          <input
            className={styles.verifyCode}
            type="text"
            placeholder="인증번호 입력"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
          />
          <button className={styles.verifyBtn} onClick={handleVerify}>인증 확인</button>

          <button className={styles.findBtn} onClick={handleResetPassword}>임시 비밀번호 받기</button>

          {result && <div className={styles.result}>{result}</div>}
        </div>
      </div>
    </div>
  );
}