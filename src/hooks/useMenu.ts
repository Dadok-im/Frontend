import { useState } from "react";

export const useMenu = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return {
    menuOpen,
    setMenuOpen,
    toggleMenu,
    closeMenu,
  };
};
