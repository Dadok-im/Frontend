// AccessToken 만료시 Refreshing
export async function refreshAccessToken(): Promise<string> {
    // 로컬 스토리지로 부터 RefreshToken 가져옴
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
        console.error("❌ RefreshToken이 없습니다.");
        throw new Error("RefreshToken이 없습니다.");
    }

    console.log("🔄 토큰 갱신 요청 중...");
    
    const response = await fetch(`${import.meta.env.VITE_BACKEND_API_BASE_URL}/jwt/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
        console.error("❌ 토큰 갱신 실패:", response.status, response.statusText);
        throw new Error(`AccessToken 갱신 실패: ${response.status} ${response.statusText}`);
    }

    // 성공 새 Token 저장
    const data = await response.json();
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    
    console.log("✅ 토큰 갱신 성공");

    return data.accessToken;
}

// AccessToken과 함께 fetch
export async function fetchWithAccess(url: string, options: RequestInit = {}): Promise<Response> {
    // 로컬 스토리지로 부터 AccessToken 가져옴
    let accessToken = localStorage.getItem("accessToken");

    // 옵션에 Header 없는 경우 추가 + AccessToken 부착
    if (!options.headers) options.headers = {};
    (options.headers as Record<string, string>)["Authorization"] = `Bearer ${accessToken}`;
    
    console.log("🔐 API 요청:", options.method || 'GET', url, accessToken ? "(토큰 있음)" : "(토큰 없음)");
    
    // 요청 진행
    let response = await fetch(url, options);
    
    console.log("📡 API 응답:", response.status, url);

    // AccessToken 만료로 401 뜨면, Refresh로 재발급
    if (response.status === 401) {
        console.warn("⚠️ 토큰 만료, 갱신 시도 중...");
        try {
            accessToken = await refreshAccessToken();
            (options.headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
            console.log("✅ 새 토큰으로 요청 재시도");
            // 재요청
            response = await fetch(url, options);
            console.log("📡 재요청 응답:", response.status, url);
        } catch (err) {
            console.error("❌ 토큰 갱신 실패:", err);
            // Refreshing이 실패했기 때문에 로컬스토리지 삭제 후, 로그인 페이지로
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            window.location.href = '/login';
            throw err;
        }
    }

    if (!response.ok) {
        console.error("❌ HTTP 오류:", response.status, response.statusText);
        throw new Error(`HTTP 오류 : ${response.status} ${response.statusText}`);
    }

    return response;
}
