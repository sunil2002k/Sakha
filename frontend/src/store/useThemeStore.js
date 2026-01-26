import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("innovateU-theme") || "coffee",
  setTheme: (theme) => {
    localStorage.setItem("innovateU-theme", theme);
    set({ theme });
  },
}));