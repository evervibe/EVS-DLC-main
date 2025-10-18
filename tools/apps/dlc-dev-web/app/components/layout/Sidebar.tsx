"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: "📊" },
    { name: "API Docs", href: "/api-docs", icon: "📚", external: true },
    { name: "Health", href: "/health", icon: "❤️", external: true },
  ];

  const toolsNavigation = [
    { name: "Strings", href: "/tools/strings", icon: "🔤" },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700
          transform transition-transform duration-200 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <Link href="/" className="block">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                DLC Dev Stack
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                v1.2.2-alpha
              </p>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              if (item.external) {
                return (
                  <a
                    key={item.name}
                    href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:30089"}${item.href}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg
                      text-slate-700 dark:text-slate-300
                      hover:bg-slate-100 dark:hover:bg-slate-700 
                      transition-colors"
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.name}</span>
                    <span className="ml-auto text-xs">↗</span>
                  </a>
                );
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg
                    transition-colors
                    ${
                      isActive(item.href)
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }
                  `}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {/* Tools Section */}
            <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="px-4 mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                Tools
              </div>
              {toolsNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg
                    transition-colors
                    ${
                      isActive(item.href)
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }
                  `}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <p>Built with ❤️ by</p>
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                EverVibe Studios
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
