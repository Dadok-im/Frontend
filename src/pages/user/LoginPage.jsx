import { useState } from "react";
import { useNavigate } from "react-router-dom";  // useNavigate 추가
import "../../styles/user/LoginPage.css";

const BACKEND_API_BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();  // useNavigate 훅을 사용하여 navigate 기능 추가

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (username === "" || password === "") {
      setError("아이디와 비밀번호를 입력하세요.");
      return;
    }

    try {
      const res = await fetch(`${BACKEND_API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) throw new Error("로그인 실패");

      const data = await res.json();
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      // 로그인 후 /user 페이지로 리디렉션
      navigate("/user");

    } catch (err) {
      setError("아이디 또는 비밀번호가 틀렸습니다.");
    }
  };

  const handleSocialLogin = (provider) => {
    window.location.href = `${BACKEND_API_BASE_URL}/oauth2/authorization/${provider}`;
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>로그인</h2>

        <form onSubmit={handleLogin}>
          <label>아이디</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label>비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="login-btn">
            로그인
          </button>
        </form>

        {/* Naver 소셜 로그인 */}
        <button
          className="naver-login-btn"
          onClick={() => handleSocialLogin("naver")}
        >
          NAVER로 로그인
        </button>

        <p className="signup-text">
          아직 계정이 없으신가요? <a href="/join">회원가입</a>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
