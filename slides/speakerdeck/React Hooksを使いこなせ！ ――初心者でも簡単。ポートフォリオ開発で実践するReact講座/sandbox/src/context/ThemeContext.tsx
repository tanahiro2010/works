import { createContext, type ReactNode } from "react";

export type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

// TODO: [createContext] このデフォルト値が「Providerの外側」で使われたときの値になる。
// スライドの createContext パートを見て、意味を確認してから ThemeToggle.tsx を触ろう。
export const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  toggleTheme: () => {
    console.warn("ThemeProvider の中に置かれていません");
  },
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  // TODO: [useState] 今は theme が "light" 固定になっている。
  // useState<Theme>("light") で状態化して、下の value にも渡そう。
  const theme: Theme = "light";

  // TODO: [useEffect] theme が変わるたびに <html> 要素の class を
  // "dark" に付け外しして、Tailwind の dark: 系クラスと連動させよう。
  // 例: document.documentElement.classList.toggle("dark", theme === "dark")

  function toggleTheme() {
    // TODO: setTheme を使って "light" <-> "dark" を切り替える
    console.log("TODO: toggleTheme を実装しよう");
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
