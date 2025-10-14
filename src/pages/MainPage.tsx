import React from "react";
import { Link } from "react-router-dom";
import { handleImageError } from "../utils";
import { useAuth } from "../contexts/AuthContext";
import { ROUTES } from "../constants";
import "./MainPage.css";

const MainPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="landing">
      {/* HEADER */}
      <header>
        <div className="wrap header-in">
          <Link className="brand" to={ROUTES.HOME}>다독임 - 심리 상담 서비스</Link>
          <nav className="nav">
            <Link to={ROUTES.HOME}>홈</Link>
            <Link to={ROUTES.CHAT}>AI 상담</Link>
            <Link to={ROUTES.MAP}>지도</Link>
            <Link to={ROUTES.CALENDAR}>캘린더</Link>
            {isAuthenticated ? (
              <Link to={ROUTES.USER} className="profile-link">
                👤 {user?.nickname || user?.username || '사용자'}
              </Link>
            ) : (
              <Link to={ROUTES.LOGIN}>로그인</Link>
            )}
          </nav>
        </div>
      </header>

      <main className="wrap">
        {/* HERO */}
        <section className="hero">
          <h1>
            당신의 정신 건강 여정에 오신 것을 환영합니다
            {isAuthenticated && user?.nickname && (
              <span className="welcome-nickname">, {user.nickname}님!</span>
            )}
          </h1>
          <div className="hero-visual">배너 / 소개 이미지</div>
        </section>

        {/* 서비스 카드 */}
        <section className="section">
          <h2 className="sec-title">이용 가능한 서비스</h2>

          <div className="grid cards3"> 
            {/* AI 상담 챗봇 */}
            <Link className="card" to={ROUTES.CHAT} aria-label="AI 상담 챗봇으로 이동">
              <div className="media">
                <img src="/src/assets/ai_img.png" alt="AI 상담 챗봇" loading="lazy" onError={handleImageError}/>
              </div>
              <strong>AI 상담 시작하기</strong>
              <p className="muted">간단한 고민을 챗봇에게 먼저 이야기해보세요.</p>
            </Link>

            {/* 주변 병원 검색(지도 페이지 이동) */}
            <Link className="card" to={ROUTES.MAP} aria-label="주변 병원 검색으로 이동">
              <div className="media cover">
                <img src="/src/assets/map-preview.png" alt="지도 미리보기" loading="lazy" onError={handleImageError}/>
              </div>
              <strong>주변 병원 검색</strong>
              <p className="muted">지도에서 병원을 찾고 상세 정보를 확인해요.</p>
            </Link>

            {/* 캘린더 */}
            <Link className="card" to={ROUTES.CALENDAR} aria-label="캘린더">
              <div className="media">
                <img src="/src/assets/calender.png" alt="캘린더" loading="lazy" onError={handleImageError}/>
              </div>
              <strong>캘린더</strong>
              <p className="muted">약물 캘린더 확인하기</p>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default MainPage;
