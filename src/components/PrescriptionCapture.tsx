import React, { useRef, useState } from "react";
import { extractMedsFromText } from "../utils/extractMeds";
import { ocrPrescription } from "../services/ocr";
import { useMedication, todayISO } from "../contexts/MedicationContext";
import { API_BASE_URL, API_ENDPOINTS } from "../constants";
import { fetchWithAccess } from "../utils";

const COMMON_PSYCH_MEDS: string[] = [
  "산도스설트랄린정",
  "졸로푸트정",
  "렉사프로정",
  "심발타캡슐",
  "웰부트린XR정",
  "리보트릴정",
  "인데놀정",
  "클로나제팜정",
  "아빌리파이정",
  "라믹탈정",
  "쿠에티아핀정",
];

const PrescriptionCapture: React.FC = () => {
  const { addMeds, addMed, getMeds, removeMed, updateMed } = useMedication();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manual, setManual] = useState("");
  const [preset, setPreset] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const today = todayISO();
  const medsToday = getMeds(today);

  const triggerFileInput = () => fileInputRef.current?.click();

  async function saveMedsToServer(names: string[], source: "ocr" | "manual", date: string) {
    if (!names.length) return;
    try {
      await fetchWithAccess(`${API_BASE_URL}${API_ENDPOINTS.MEDICATIONS}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ names, source, date }),
      });
    } catch (err) {
      console.error("💊 약 정보 저장 중 오류:", err);
      setError("서버에 약 정보를 저장하는 중 오류가 발생했습니다.");
    }
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setError(null);
    setBusy(true);
    try {
      const { text } = await ocrPrescription(f);
      const names = extractMedsFromText(text);

      if (!names.length) {
        setError("텍스트 인식은 됐지만 약 이름을 찾지 못했어요. 수동 입력을 이용해보세요.");
      } else {
        addMeds(names, today, "ocr");
        await saveMedsToServer(names, "ocr", today);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "처리 중 오류가 발생했습니다");
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function onAddManual() {
    const name = (manual || preset).trim();
    if (!name) return;

    setError(null);
    addMed(name, today, "manual");
    await saveMedsToServer([name], "manual", today);

    setManual("");
    setPreset("");
  }

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setPreset(value);
    if (value) {
      setManual(value);
    }
  };

  const handleRemoveMed = (medId: string) => {
    removeMed(today, medId);
  };

  const handleUpdateMed = (medId: string) => {
    const current = medsToday.find((m) => m.id === medId);
    if (!current) return;
    const newName = prompt("새 약 이름을 입력해주세요", current.name);
    if (!newName || newName.trim() === "" || newName === current.name) return;
    updateMed(today, medId, newName.trim());
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-dashed border-[rgba(163,184,198,0.5)] bg-[rgba(245,247,250,0.08)] p-6 text-center shadow-inner">
        <div className="mx-auto flex max-w-lg flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(245,247,250,0.12)] text-2xl">📄</div>
          <div>
            <p className="text-lg font-semibold text-[#F5F7FA]">처방전 이미지 업로드</p>
            <p className="mt-1 text-sm text-[#F5F7FA]/75">jpg, png 등 이미지를 선택하면 OCR로 자동 분석합니다.</p>
          </div>
          <button
            type="button"
            onClick={triggerFileInput}
            className="rounded-full border border-[#A3B8C6] bg-[#F5F7FA]/10 px-6 py-2 text-sm font-semibold text-[#F5F7FA] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#F5F7FA]/20"
            disabled={busy}
          >
            {busy ? "인식 중..." : "이미지 선택하기"}
          </button>
          <p className="text-xs text-[#F5F7FA]/60">고화질 사진일수록 정확도가 높아요.</p>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onUpload} />
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-400/40 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="rounded-2xl border border-[rgba(163,184,198,0.35)] bg-[rgba(245,247,250,0.08)] p-4 shadow-inner">
          <p className="text-sm font-semibold text-[#D1FADF]">수동 입력</p>
          <div className="mt-3 flex flex-col gap-3 md:flex-row">
            <input
              type="text"
              placeholder="약 이름 직접 입력 (예: 인데놀정10mg)"
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onAddManual()}
              className="flex-1 rounded-2xl border border-[rgba(163,184,198,0.45)] bg-transparent px-4 py-3 text-sm text-[#F5F7FA] placeholder:text-[#F5F7FA]/50 focus:border-[#F5F7FA] focus:outline-none focus:ring-2 focus:ring-[#A3B8C6]/40"
            />
            <select
              className="rounded-2xl border border-[rgba(163,184,198,0.35)] bg-[rgba(245,247,250,0.1)] px-4 py-3 text-sm text-[#F5F7FA] focus:border-[#F5F7FA] focus:outline-none"
              value={preset}
              onChange={handlePresetChange}
            >
              <option value="">대표 약 선택</option>
              {COMMON_PSYCH_MEDS.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={onAddManual}
            className="mt-3 w-full rounded-2xl bg-gradient-to-r from-[#F8B400] to-[#F5F7FA] px-4 py-3 text-sm font-semibold text-[#4A5D73] shadow-lg transition hover:-translate-y-0.5 hover:shadow-2xl disabled:cursor-not-allowed disabled:bg-white/30 disabled:text-white/70"
            disabled={!manual.trim()}
          >
            오늘 복약에 추가
          </button>
        </div>

        <div className="rounded-2xl border border-[rgba(163,184,198,0.35)] bg-[rgba(245,247,250,0.08)] p-4 text-sm text-[#F5F7FA]/80 shadow-inner">
          <p className="font-semibold text-[#F5F7FA]">입력 팁</p>
          <ul className="mt-3 list-disc space-y-2 pl-4">
            <li>성분명이 아닌 제품명으로 입력하면 중복을 줄일 수 있어요.</li>
            <li>시간대(예: 아침, 점심)를 함께 기록하면 더 정확한 기록이 됩니다.</li>
            <li>대표 약 목록을 활용하면 자주 복용하는 약을 빠르게 추가할 수 있어요.</li>
          </ul>
        </div>
      </div>

      <div className="rounded-3xl border border-[rgba(163,184,198,0.4)] bg-[rgba(245,247,250,0.05)] p-5 shadow-inner">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D1FADF]">오늘 추가된 약</p>
            <p className="text-sm text-[#F5F7FA]/75">이 페이지에서 입력한 정보는 기기에 임시 저장됩니다.</p>
          </div>
          <span className="rounded-full bg-[rgba(245,247,250,0.1)] px-3 py-1 text-xs font-semibold text-[#F5F7FA]">
            {medsToday.length}개 등록됨
          </span>
        </div>

        {medsToday.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-[rgba(163,184,198,0.35)] px-4 py-8 text-center text-sm text-[#F5F7FA]/70">
            아직 추가된 약이 없습니다. OCR 업로드 또는 수동 입력으로 기록을 시작하세요!
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {medsToday.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between rounded-2xl border border-[rgba(163,184,198,0.35)] bg-[rgba(245,247,250,0.12)] px-4 py-3 text-sm text-[#F5F7FA]"
              >
                <div>
                  <p className="font-semibold">{m.name}</p>
                  <p className="text-xs text-[#F5F7FA]/70">{m.source === "ocr" ? "OCR 인식" : "직접 입력"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="rounded-full border border-[#F5F7FA]/30 px-3 py-1 text-xs font-semibold text-[#F5F7FA] transition hover:-translate-y-0.5 hover:bg-[rgba(245,247,250,0.15)]"
                    onClick={() => handleUpdateMed(m.id)}
                  >
                    수정
                  </button>
                  <button
                    className="rounded-full border border-rose-300/50 px-3 py-1 text-xs font-semibold text-rose-100 transition hover:-translate-y-0.5 hover:bg-rose-400/20"
                    onClick={() => handleRemoveMed(m.id)}
                  >
                    삭제
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PrescriptionCapture;
