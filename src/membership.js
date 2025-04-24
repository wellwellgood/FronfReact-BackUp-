import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./membership.module.css";

export default function Membership() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    password: "",
    confirmPassword: "",
    phone1: "",
    phone2: "",
    phone3: "",
  });
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");

  const validateForm = () => {
    const newErrors = {};
    const { username, name, password, confirmPassword, phone1, phone2, phone3 } = formData;
    const fullPhone = `${phone1}-${phone2}-${phone3}`;

    if (!username.trim()) newErrors.username = "아이디를 입력해주세요.";
    else if (!/^[a-zA-Z0-9]{5,15}$/.test(username))
      newErrors.username = "아이디는 5~15자의 영문자 또는 숫자만 가능합니다.";

    if (!name.trim()) newErrors.name = "이름을 입력해주세요.";

    if (!password) newErrors.password = "비밀번호를 입력해주세요.";
    else if (password.length < 8) newErrors.password = "비밀번호는 최소 8자 이상이어야 합니다.";
    else if (!/[A-Z]/.test(password)) newErrors.password = "대문자가 포함되어야 합니다.";
    else if (!/[0-9]/.test(password)) newErrors.password = "숫자가 포함되어야 합니다.";
    else if (!/[^A-Za-z0-9]/.test(password)) newErrors.password = "특수문자가 포함되어야 합니다.";

    if (password !== confirmPassword) newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";

    if (!phone1 || !phone2 || !phone3) {
      newErrors.phone = "휴대폰 번호를 모두 입력해주세요.";
    } else if (!/^01[0-9]-\d{3,4}-\d{4}$/.test(fullPhone)) {
      newErrors.phone = "휴대폰 번호 형식이 올바르지 않습니다.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
      await axios.post("http://localhost:4000/api/send-code", { phone1, phone2, phone3 });
      alert("✅ 인증번호가 발송되었습니다.");
    } catch (err) {
      alert("❌ 인증번호 전송에 실패했습니다.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const userData = {
          username: formData.username,
          name: formData.name,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          phone1: formData.phone1,
          phone2: formData.phone2,
          phone3: formData.phone3,
        };
        await axios.post("http://localhost:4000/api/register", userData);
        alert("✅ 회원가입이 완료되었습니다!");
        navigate("/");
      } catch (err) {
        setErrorMessage(
          err.response?.data?.message || "회원가입 중 오류가 발생했습니다."
        );
      }
    }
  };

//   const pool = require('../src/test/src/DB');

// app.post('/api/register', async (req, res) => {
//   const conn = await pool.getConnection();
//   const { username, name, password, phone1, phone2, phone3 } = req.body;
//   await conn.query(
//     'INSERT INTO users (username, name, password, phone1, phone2, phone3) VALUES (?, ?, ?, ?, ?, ?)',
//     [username, name, password, phone1, phone2, phone3]
//   );
//   conn.release();
//   res.send('회원가입 완료!');
// });

  return (
    <div className={styles.findID}>
      <Link to="/">
        <div className={styles.img}></div>
      </Link>
      <div className={styles.IDform}>
        <form className={styles.IDarea} onSubmit={handleSubmit}>
          <h1>회원가입</h1>

          <input
            className={styles.name}
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="이름"
          />
          {errors.name && <p className={styles.error}>{errors.name}</p>}

          <input
            className={styles.name}
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="아이디"
          />
          {errors.username && <p className={styles.error}>{errors.username}</p>}

          <input
            className={styles.verifyCode}
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="비밀번호"
          />
          <h9 styles="color: red;">비밀번호는 대소문자 및 특수문자 포함, 8자이상 입니다.</h9>
          {errors.password && <p className={styles.error}>{errors.password}</p>}

          <input
            className={styles.verifyCode}
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="비밀번호 확인"
          />
          {errors.confirmPassword && <p className={styles.error}>{errors.confirmPassword}</p>}

          <div className={styles.phoneGroup}>
            <select name="phone1" value={formData.phone1} onChange={handleChange}>
              <option value="">선택</option>
              <option value="010">010</option>
              <option value="011">011</option>
            </select>
            <span>-</span>
            <input
              type="tel"
              name="phone2"
              value={formData.phone2}
              onChange={handleChange}
            />
            <span>-</span>
            <input
              type="tel"
              name="phone3"
              value={formData.phone3}
              onChange={handleChange}
            />
          </div>
          {errors.phone && <p className={styles.error}>{errors.phone}</p>}

          {errorMessage && <p className={styles.error}>{errorMessage}</p>}

          <button type="button" onClick={handleSendCode}>인증번호 보내기</button>
        </form>
      </div>
    </div>
  );
}
