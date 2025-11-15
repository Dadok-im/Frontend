/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_KAKAO_JS_KEY: "1911dddedbb5f270980947917af7df7f";
  // readonly VITE_API_BASE_URL: "http://localhost:8080";
  // readonly VITE_BACKEND_API_BASE_URL: "http://localhost:8080";
  readonly VITE_API_BASE_URL: "https://dadokim.o-r.kr";
  readonly VITE_BACKEND_API_BASE_URL: "https://dadokim.o-r.kr";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
