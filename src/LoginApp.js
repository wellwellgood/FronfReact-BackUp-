import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./test/src/test/css/App.module.css"; // 모듈 CSS import

// ✅ 로그인 페이지
function LoginPage() {
  const navigate = useNavigate();
  const [ID, setId] = useState("");
  const [PW, setPw] = useState("");
  const [PWvalid, setPWvalid] = useState(false);
  const [notAllow, setNotAllow] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");


  const goToid = () => navigate("/id");
  const goToPassword = () => navigate("/password");
  const goToMembership = () => navigate("/membership");

  useEffect(() => {
    console.log("✅ sessionStorage userId:", sessionStorage.getItem("userId"));
  }, []);

  const HandleID = (e) => {
    const value = e.target.value;
    setId(value);
    const regex = /^[A-Za-z0-9]+$/;
    setNotAllow(!regex.test(value));
  };

  const HandlePW = (e) => {
    const value = e.target.value;
    setPw(value);
    const regex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,20}$/;
    setPWvalid(regex.test(value));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      loginButton();
    }
  };
  

  const loginButton = async () => {
    try {
      const response = await axios.post("http://localhost:4000/api/login", {
        username: ID,
        password: PW,
      });
  
      // ✅ 여기서 콘솔 찍기 (제일 먼저!)
      console.log("🧾 서버 응답 전체:", response.data);
  
      const token = response.data.token;
      const username = response.data.username;
      const name = response.data.name;
      const id = response.data.id;
  
      console.log("✅ 저장할 정보:", { token, username, name, id });
  
      sessionStorage.setItem("userToken", token || "");
      sessionStorage.setItem("username", username || "");
      sessionStorage.setItem("name", name || "");
      sessionStorage.setItem("userId", id || "");
  
      alert("로그인 성공!");
  
      setTimeout(() => {
        navigate("/main");
      }, 100);
  
    } catch (err) {
      console.error("❌ 로그인 실패:", err);
      alert("로그인 실패");
    }
  };
  

  return (
    <div className={styles.App}>
      <header className={styles["App-header"]}>
        <div className={styles.login}>
          <div className={styles.loginform}>
            <div className={styles.logo}></div>
            <h1 className={styles.text}>LOGIN</h1>
            <div className={styles.loginbox}>
              <input
                className={styles.id}
                type="text"
                placeholder="ID"
                value={ID}
                onChange={HandleID}
              />
              <input
                className={styles.pw}
                type="password"
                placeholder="Password"
                value={PW}
                onChange={HandlePW}
                onKeyDown={handleKeyDown}
              />
            </div>
            {errorMessage && (
              <p className={styles["error-message"]}>{errorMessage}</p>
            )}
            <button
              className={styles.linkpage}
              onClick={loginButton}
              disabled={!PWvalid || notAllow}
            >
              <h2>Login</h2>
            </button>
            <div className={styles.findbox}>
              <button className={styles.findbtn} onClick={goToid}>
                아이디 찾기
              </button>
              <button className={styles.findbtn} onClick={goToPassword}>
                비밀번호 찾기
              </button>
              <button className={styles.findbtn} onClick={goToMembership}>
                회원가입
              </button>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

export default LoginPage;
