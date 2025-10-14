import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAccess } from "../utils";
import { useAuth } from "../contexts/AuthContext";
import { ROUTES } from "../constants";
import "./UserPage.css";

// .env로 부터 백엔드 URL 받아오기
const BACKEND_API_BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

interface UserInfo {
  username: string;
  nickname: string;
  email: string;
}

const UserPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // 정보
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [error, setError] = useState('');
  const [logoutMsg, setLogoutMsg] = useState('');

  // 페이지 방문시 유저 정보 요청
  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const res = await fetchWithAccess(`${BACKEND_API_BASE_URL}/api/user/me`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error("유저 정보 불러오기 실패");

        const data = await res.json();
        setUserInfo(data);
        
      } catch (err) {
        setError("유저 정보를 불러오지 못했습니다.");
      }
    };

    getUserInfo();
  }, []);

  // 로그아웃 함수
  const handleLogout = async () => {
    try {
        const res = await fetch(`${BACKEND_API_BASE_URL}/logout`, {
            method: "POST",
            credentials: "include",  // 쿠키 포함
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken: localStorage.getItem("refreshToken") }), // refreshToken을 Body에 포함
        });
        
        if(!res.ok) throw new Error("로그아웃 실패");

        // 서버가 200 OK 응답을 보내면 로그아웃 성공 처리
        setLogoutMsg("로그아웃 되었습니다.");
        setUserInfo(null);  // 사용자 정보 초기화
        
        // AuthContext에서 로그아웃 처리
        logout();

        navigate(ROUTES.HOME); // 메인 페이지로 이동
    
    } catch (err) {
        setLogoutMsg("로그아웃 중 오류가 발생했습니다.");
        console.error(err);  // 에러 로그 출력
    }
  };

  return (
    <div className="user-page">
      <div className="user-info-card">
        <h1>내 정보</h1>
        {error && <p className="error-message">{error}</p>}
        {userInfo ? (
          <>
            <div className="user-info">
              <p><strong>아이디:</strong> {userInfo.username}</p>
              <p><strong>닉네임:</strong> {userInfo.nickname}</p>
              <p><strong>이메일:</strong> {userInfo.email}</p>
            </div>
            <button className="logout-btn" onClick={handleLogout}>로그아웃</button>
          </>
        ) : (
          <p>로그인이 필요합니다.</p>
        )}
        {logoutMsg && <p className="logout-message">{logoutMsg}</p>}
      </div>
    </div>
  );
};

export default UserPage;
