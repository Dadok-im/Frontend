import React from "react";
import { getFormattedToday } from "../../utils";

interface ChatHeaderProps {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  model: string;
  setModel: (model: string) => void;
  clearMessages: () => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  menuOpen,
  setMenuOpen,
  model,
  setModel,
  clearMessages,
  darkMode,
  setDarkMode,
}) => {
  const today = getFormattedToday();

  const handleModelChange = (nextModel: string) => {
    setModel(nextModel);
    if (menuOpen) {
      setMenuOpen(false);
    }
  };

  const handleClearMessages = () => {
    clearMessages();
    if (menuOpen) {
      setMenuOpen(false);
    }
  };

  const handleToggleTheme = () => {
    setDarkMode(!darkMode);
    if (menuOpen) {
      setMenuOpen(false);
    }
  };

  const containerStyles = darkMode
    ? "bg-[#2E3642]/90 border-[rgba(74,93,115,0.6)] text-[#F5F7FA]"
    : "bg-[rgba(245,247,250,0.95)] border-[rgba(163,184,198,0.6)] text-[#1E1E1E]";

  const dropdownStyles = darkMode
    ? "bg-[#2E3642]/95 border-[rgba(74,93,115,0.5)] text-[#F5F7FA]"
    : "bg-[#F5F7FA] border-[rgba(163,184,198,0.5)] text-[#1E1E1E]";

  const inactiveModelStyles = darkMode
    ? "border-[rgba(74,93,115,0.5)] bg-[rgba(74,93,115,0.25)] text-[#F5F7FA]/85 hover:bg-[rgba(74,93,115,0.35)]"
    : "border-[rgba(163,184,198,0.6)] bg-[rgba(245,247,250,0.65)] text-[#4A5D73] hover:bg-[rgba(245,247,250,0.85)]";

  return (
    <header
      className={`relative flex items-center justify-between border-b px-4 py-3 text-xs sm:text-sm ${containerStyles}`}
    >
      <span className="font-medium">{today}</span>

      <button
        type="button"
        className="flex flex-col gap-1 rounded-md px-2 py-1 transition duration-150 hover:bg-[rgba(245,247,250,0.18)] sm:hidden"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="설정 메뉴 열기"
      >
        <span className="h-[2px] w-5 rounded bg-current"></span>
        <span className="h-[2px] w-5 rounded bg-current"></span>
        <span className="h-[2px] w-5 rounded bg-current"></span>
      </button>

      <div className="hidden items-center gap-4 sm:flex">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-[#A3B8C6] sm:text-sm">
            모델
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleModelChange("chat")}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                model === "chat" ? "bg-[#4A5D73] text-[#F5F7FA] shadow-lg" : inactiveModelStyles
              }`}
            >
              ChatGPT
            </button>
            <button
              type="button"
              onClick={() => handleModelChange("gemini")}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                model === "gemini" ? "bg-[#4A5D73] text-[#F5F7FA] shadow-lg" : inactiveModelStyles
              }`}
            >
              Gemini
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={handleClearMessages}
          className="rounded-full border border-[rgba(163,184,198,0.45)] px-3 py-1.5 text-xs font-semibold text-[#F5F7FA] transition duration-200 hover:-translate-y-0.5 hover:bg-[rgba(245,247,250,0.18)]"
        >
          대화 초기화
        </button>
        <button
          type="button"
          onClick={handleToggleTheme}
          className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition ${
            darkMode
              ? "bg-[rgba(74,93,115,0.35)] text-[#A3B8C6]"
              : "bg-[rgba(245,247,250,0.6)] text-[#4A5D73]"
          }`}
        >
          다크 모드
          <span
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${
              darkMode ? "bg-[#4A5D73]" : "bg-[#A3B8C6]"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-[#F5F7FA] transition ${
                darkMode ? "translate-x-4" : "translate-x-1"
              }`}
            />
          </span>
        </button>
      </div>

      {menuOpen && (
        <div
          className={`absolute right-4 top-12 w-60 rounded-2xl border shadow-xl sm:hidden ${dropdownStyles}`}
        >
          <div className="flex flex-col gap-4 p-4 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#A3B8C6]">
                모델 선택
              </p>
              <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => handleModelChange("chat")}
              className={`flex-1 rounded-full px-3 py-2 text-xs font-medium transition ${
                model === "chat" ? "bg-[#4A5D73] text-[#F5F7FA] shadow-lg" : inactiveModelStyles
              }`}
            >
              ChatGPT
            </button>
            <button
              type="button"
              onClick={() => handleModelChange("gemini")}
              className={`flex-1 rounded-full px-3 py-2 text-xs font-medium transition ${
                model === "gemini" ? "bg-[#4A5D73] text-[#F5F7FA] shadow-lg" : inactiveModelStyles
              }`}
            >
              Gemini
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClearMessages}
          className="rounded-full border border-[rgba(163,184,198,0.45)] px-3 py-2 text-xs font-semibold text-[#F5F7FA] transition duration-200 hover:-translate-y-0.5 hover:bg-[rgba(245,247,250,0.18)]"
        >
          대화 초기화
        </button>

        <button
          type="button"
          onClick={handleToggleTheme}
          className={`flex items-center justify-between rounded-full px-3 py-2 text-xs font-medium transition ${
            darkMode
              ? "bg-[rgba(74,93,115,0.35)] text-[#A3B8C6]"
              : "bg-[rgba(245,247,250,0.6)] text-[#4A5D73]"
          }`}
        >
              <span>다크 모드</span>
              <span
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${
                  darkMode ? "bg-[#4A5D73]" : "bg-[#A3B8C6]"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-[#F5F7FA] transition ${
                    darkMode ? "translate-x-4" : "translate-x-1"
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default ChatHeader;
