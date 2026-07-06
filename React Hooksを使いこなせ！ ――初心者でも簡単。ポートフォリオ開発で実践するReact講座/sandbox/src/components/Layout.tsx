import { useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";

const navItems = [
  { to: "/", label: "Home", end: true },
  { to: "/projects", label: "Projects", end: false },
  { to: "/contact", label: "Contact", end: false },
];

// ページ遷移のたびにスクロール位置を先頭へ戻す（React Router はデフォルトでは戻さない）
function useScrollToTopOnNavigate() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
}

export function Layout() {
  useScrollToTopOnNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-100">
      <header className="border-b border-slate-200 dark:border-slate-700">
        <nav className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <span className="shrink-0 text-lg font-bold tracking-tight">taro.dev</span>
          <div className="flex items-center gap-3 sm:gap-6">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `text-sm font-medium transition ${
                    isActive
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <ThemeToggle />
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-400 dark:border-slate-700">
        © 2026 taro.dev — Built while learning React Hooks
      </footer>
    </div>
  );
}
