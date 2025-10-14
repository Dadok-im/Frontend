import { useState, useEffect } from "react";

export const useTheme = () => {
  const [darkMode, setDarkMode] = useState(() => {
    // localStorage에서 테마 설정 불러오기
    const savedTheme = localStorage.getItem("darkMode");
    return savedTheme !== null ? JSON.parse(savedTheme) : true;
  });

  useEffect(() => {
    // 테마 변경 시 localStorage에 저장
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return {
    darkMode,
    setDarkMode,
    toggleTheme,
  };
};
