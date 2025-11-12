import { API_BASE_URL, API_ENDPOINTS } from "../constants";
import { fetchWithAccess } from "../utils";

export async function ocrPrescription(file: File): Promise<{ text: string }> {
  const fd = new FormData();
  fd.append("file", file);
  console.log("🧪 FormData keys:", Array.from(fd.keys()));

  try {
    const echo = await fetchWithAccess(`${API_BASE_URL}${API_ENDPOINTS.OCR_ECHO}`, {
      method: "POST",
      body: fd,
    });
    const echoJson = await echo.json();
    console.log("🧪 echo ->", echoJson);
    if (!echo.ok || !echoJson.received) {
      throw new Error("서버가 파일을 받지 못했습니다.");
    }
  } catch (err) {
    console.warn("🧪 echo endpoint를 확인할 수 없어 건너뜁니다.", err);
  }

  const res = await fetchWithAccess(`${API_BASE_URL}${API_ENDPOINTS.OCR}`, {
    method: "POST",
    body: fd,
  });
  const json = await res.json();
  return { text: String(json?.text || "") };
}
