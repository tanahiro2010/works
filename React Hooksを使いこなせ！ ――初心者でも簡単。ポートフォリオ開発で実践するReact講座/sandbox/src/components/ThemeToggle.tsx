import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

export function ThemeToggle() {
  // TODO: [useContext] ThemeContext.tsx の TODO を実装したら、
  // ここで theme が "light" / "dark" で切り替わるようになる。
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="shrink-0 whitespace-nowrap rounded-full border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-600 dark:text-slate-300 dark:hover:text-white"
      aria-label="テーマ切り替え"
    >
      {theme === "light" ? "🌙 ダーク" : "☀️ ライト"}
    </button>
  );
}
