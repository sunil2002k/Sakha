import React from "react";
import { PaletteIcon } from "lucide-react";
import { useThemeStore } from "../store/useThemeStore";
import { THEMES } from "../constants";

const ThemeSelector = () => {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="relative dropdown dropdown-end">
      {/* small icon trigger so navbar height doesn't grow */}
      <button
        tabIndex={0}
        aria-label="Select theme"
        className="p-1 rounded-full text-white hover:text-purple-300 transition-colors"
      >
        <PaletteIcon className="w-5 h-5" />
      </button>

      {/* popup: absolute, small card; appears below trigger */}
      <div
        tabIndex={0}
        className=" z-[9999] dropdown-content absolute right-0 mt-2 w-44 p-2 overflow-y-auto shadow-2xl bg-slate-900/95 backdrop-blur rounded-lg border border-base-content/10 group-focus:block"
        // note: parent should toggle visibility (we rely on explicit show via wrapper if needed)
      >
        <div className="space-y-1">
          {THEMES.map((themeOption) => (
            <button
              key={themeOption.name}
              onClick={() => setTheme(themeOption.name)}
              className={`w-full flex items-center gap-3 z-[9999] px-3 py-2 rounded-md text-sm transition-colors ${
                theme === themeOption.name
                  ? "bg-purple-600/10 text-purple-300"
                  : "hover:bg-white/5"
              }`}
            >
              <PaletteIcon className="w-4 h-4" />
              <span className="truncate">{themeOption.label}</span>
              <div className="ml-auto flex gap-1">
                {themeOption.colors.map((c, i) => (
                  <span
                    key={i}
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;
