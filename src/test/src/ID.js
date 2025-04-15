import React, { useState, useEffect } from "react";
import axios from "axios";

export default function ID() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [serverCode, setServerCode] = useState("");
  const [timer, setTimer] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [foundID, setFoundID] = useState("");

  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdown);
    }
  }, [timer]);

  const handleSendCode = async () => {
    if (!phoneNumber) return alert("전화번호를 입력해주세요.");
    try {
      const res = await axios.post("/api/send-code", { phone: phoneNumber });
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

  const handleFindID = async () => {
    if (!isVerified) return alert("전화번호 인증이 필요합니다.");
    try {
      const res = await axios.post("/api/find-id", { phone: phoneNumber });
      setFoundID(res.data.userId);
    } catch (err) {
      console.error(err);
      alert("아이디 찾기에 실패했습니다.");
    }
  };

  return (
    <div className={styles.findID}>
      <div className={styles.IDform}>
        <div className={styles.IDarea}>
          <h1>아이디 찾기</h1>
          <input
            className={styles.number}
            type="text"
            placeholder="전화번호 입력"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
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

          <button className={styles.findBtn} onClick={handleFindID}>아이디 찾기</button>

          {foundID && (
            <div className={styles.result}>
              당신의 아이디는 <span>{foundID}</span> 입니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}