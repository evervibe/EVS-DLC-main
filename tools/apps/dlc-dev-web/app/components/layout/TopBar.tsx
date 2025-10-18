"use client";

import { useRouter } from "next/navigation";

interface TopBarProps {
  onMenuClick: () => void;
  title?: string;
}

export default function TopBar({ onMenuClick, title = "Dashboard" }: TopBarProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    router.push("/login");
  };

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Menu button + Title */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 
                hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                {title}
              </h1>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={handleLogout}
              className="px-3 sm:px-4 py-2 text-sm font-medium
                bg-slate-100 hover:bg-slate-200 
                dark:bg-slate-700 dark:hover:bg-slate-600 
                text-slate-900 dark:text-white 
                rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
