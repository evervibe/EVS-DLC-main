"use client";

import DashboardLayout from "../components/layout/DashboardLayout";
import ApiStatusWidget from "../components/widgets/ApiStatusWidget";
import MetricsWidget from "../components/widgets/MetricsWidget";

export default function DashboardPage() {
  return (
    <DashboardLayout title="Dashboard">
      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* API Status Widget */}
        <ApiStatusWidget />

        {/* System Metrics Widget */}
        <MetricsWidget />

        {/* Quick Info Card */}
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
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              MySQL 8 Database
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
              Redis 7 Cache
            </li>
          </ul>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="mt-6 bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Welcome to DLC Dev Stack v1.2.0-alpha
        </h2>
        <p className="text-slate-600 dark:text-slate-300 mb-4">
          This is the production-ready administration dashboard for the DLC Development Stack.
          The stack includes a NestJS backend API with MySQL 8 database support,
          JWT authentication, comprehensive security, CI/CD pipeline, and this Next.js 15 frontend.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
              🔐 Authentication
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Secure JWT-based authentication with @nestjs/passport. 
              Login, token generation, and protected routes ready to use.
            </p>
          </div>
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
              📊 Real-time Metrics
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Monitor API health, database connections, cache status, and system metrics
              in real-time with auto-refreshing widgets.
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6">
          <div className="text-3xl mb-2">⚡</div>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
            High Performance
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Built with Fastify for maximum throughput and minimal overhead.
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-6">
          <div className="text-3xl mb-2">🔒</div>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
            Secure by Default
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Rate limiting, Helmet headers, and JWT authentication out of the box.
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-6">
          <div className="text-3xl mb-2">📦</div>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
            Production Ready
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Docker support, health checks, and comprehensive documentation.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
