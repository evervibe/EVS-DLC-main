"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [apiStatus, setApiStatus] = useState<"checking" | "connected" | "error">("checking");
  const [apiUrl] = useState(process.env.NEXT_PUBLIC_API_URL || "http://localhost:30089");

  useEffect(() => {
    // Check if user is logged in (simple check)
    const token = localStorage.getItem("auth_token");
    if (!token) {
      // Uncomment to enforce authentication
      // router.push("/login");
    }

    // Check API health
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    try {
      const response = await fetch(`${apiUrl}/health`);
      if (response.ok) {
        setApiStatus("connected");
      } else {
        setApiStatus("error");
      }
    } catch (error) {
      setApiStatus("error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              DLC Dev Dashboard
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              v1.0.0-alpha
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* API Status Card */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              API Status
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Status:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  apiStatus === "connected" 
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : apiStatus === "error"
                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                }`}>
                  {apiStatus === "connected" ? "Connected" : apiStatus === "error" ? "Error" : "Checking..."}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">URL:</span>
                <span className="text-xs font-mono text-slate-900 dark:text-white">{apiUrl}</span>
              </div>
              <button
                onClick={checkApiHealth}
                className="w-full mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
              >
                Refresh Status
              </button>
            </div>
          </div>

          {/* Stack Info Card */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Technology Stack
            </h2>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Next.js 15 (App Router)
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                React 19
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                TypeScript 5
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Tailwind CSS 4
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                NestJS 10 API
              </li>
            </ul>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            <div className="space-y-2">
              <a
                href={`${apiUrl}/api-docs`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white text-sm rounded-lg transition-colors text-center"
              >
                API Documentation
              </a>
              <a
                href={`${apiUrl}/health`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white text-sm rounded-lg transition-colors text-center"
              >
                Health Check
              </a>
              <Link
                href="/"
                className="block w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white text-sm rounded-lg transition-colors text-center"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="mt-8 bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Welcome to DLC Dev Stack v1.0.0-alpha
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            This is the administration dashboard for the DLC Development Stack. 
            The stack includes a NestJS backend API with MySQL 8 database support 
            and this Next.js 15 frontend.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Backend API</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                NestJS 10 with Fastify adapter, TypeORM, and MySQL 8 integration.
                Supports multiple database connections for different modules.
              </p>
            </div>
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Frontend</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Modern Next.js 15 with React 19, App Router, and Tailwind CSS 4.
                Fully type-safe with TypeScript 5.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
