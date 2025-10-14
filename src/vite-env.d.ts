/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_KAKAO_JS_KEY: "1911dddedbb5f270980947917af7df7f";
  readonly VITE_API_BASE_URL: "http://localhost:8080";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
