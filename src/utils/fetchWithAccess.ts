// AccessToken 만료 시 Refresh
export async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    console.error("❌ RefreshToken이 없습니다.");
    throw new Error("RefreshToken이 없습니다.");
  }

  console.log("🔄 토큰 갱신 요청 중...");

  const res = await fetch(`${import.meta.env.VITE_BACKEND_API_BASE_URL}/jwt/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
    credentials: "include",
  });

  if (!res.ok) {
    console.error("❌ 토큰 갱신 실패:", res.status, res.statusText);
    throw new Error(`AccessToken 갱신 실패: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("refreshToken", data.refreshToken);
  console.log("✅ 토큰 갱신 성공");
  return data.accessToken;
}

// AccessToken과 함께 fetch (FormData 안전 처리 포함)
export async function fetchWithAccess(url: string, options: RequestInit = {}): Promise<Response> {
  let accessToken = localStorage.getItem("accessToken");

  const headers = new Headers(options.headers || {});
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  const isFormData = options.body instanceof FormData;

  if (isFormData) {
    headers.delete("Content-Type");
  } else if (options.body && typeof options.body !== "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
    options = { ...options, body: JSON.stringify(options.body) };
  }

  console.log(
    "🔐 API 요청:",
    options.method || "GET",
    url,
    accessToken ? "(토큰 있음)" : "(토큰 없음)",
  );
  let res = await fetch(url, { ...options, headers, credentials: "include" });
  console.log("📡 API 응답:", res.status, url);

  if (res.status === 401) {
    console.warn("⚠️ 토큰 만료, 갱신 시도 중...");
    try {
      accessToken = await refreshAccessToken();
      headers.set("Authorization", `Bearer ${accessToken}`);
      res = await fetch(url, { ...options, headers, credentials: "include" });
      console.log("📡 재요청 응답:", res.status, url);
    } catch (err) {
      console.error("❌ 토큰 갱신 실패:", err);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
      throw err;
    }
  }

  if (!res.ok) {
    console.error("❌ HTTP 오류:", res.status, res.statusText);
    throw new Error(`HTTP 오류 : ${res.status} ${res.statusText}`);
  }

  return res;
}
