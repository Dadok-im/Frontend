// 카카오 맵 API 스크립트 로드
export const loadKakaoScript = (apiKey: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.kakao) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`;
    script.async = true;
    
    script.onload = () => {
      window.kakao.maps.load(() => {
        resolve();
      });
    };
    
    script.onerror = () => {
      reject(new Error('카카오 맵 API 로드 실패'));
    };
    
    document.head.appendChild(script);
  });
};
