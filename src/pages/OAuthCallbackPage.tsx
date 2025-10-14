import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ROUTES } from "../constants";

const OAuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // URL에서 토큰 정보를 확인
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');
        const error = searchParams.get('error');

        if (error) {
          console.error('OAuth 에러:', error);
          navigate(ROUTES.LOGIN);
          return;
        }

        if (accessToken && refreshToken) {
          // 토큰을 localStorage에 저장
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", refreshToken);
          
          // 사용자 페이지로 리디렉션
          navigate(ROUTES.USER);
        } else {
          // 토큰이 없으면 로그인 페이지로
          navigate(ROUTES.LOGIN);
        }
      } catch (error) {
        console.error('OAuth 콜백 처리 중 오류:', error);
        navigate(ROUTES.LOGIN);
      }
    };

    handleOAuthCallback();
  }, [navigate, searchParams]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontSize: '1.2rem'
    }}>
      로그인 처리 중...
    </div>
  );
};

export default OAuthCallbackPage;
