"use client";

import { useEffect, useState } from "react";

interface HealthStatus {
  status: string;
  timestamp: string;
  version: string;
  databases: Record<string, boolean>;
  cache: {
    connected: boolean;
    keys: number;
  };
  auth: {
    jwtConfigured: boolean;
  };
}

export default function ApiStatusWidget() {
  const [status, setStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:30089";

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/health`);
      if (!response.ok) throw new Error("Health check failed");
      const data = await response.json();
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Refresh every 30s
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading && !status) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          API Status
        </h2>
        <button
          onClick={fetchStatus}
          disabled={loading}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <svg
            className={`w-4 h-4 text-slate-600 dark:text-slate-300 ${loading ? "animate-spin" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {error ? (
        <div className="text-sm text-red-600 dark:text-red-400">
          Error: {error}
        </div>
      ) : status ? (
        <div className="space-y-3">
          {/* Overall Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-400">Status:</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                status.status === "ok"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
              }`}
            >
              {status.status.toUpperCase()}
            </span>
          </div>

          {/* Version */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-400">Version:</span>
            <span className="text-xs font-mono text-slate-900 dark:text-white">
              {status.version}
            </span>
          </div>

          {/* Databases */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 block">
              Databases:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(status.databases).map(([name, healthy]) => (
                <div
                  key={name}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-slate-600 dark:text-slate-400 capitalize">
                    {name}:
                  </span>
                  <span
                    className={
                      healthy
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }
                  >
                    {healthy ? "✓" : "✗"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Cache */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400">Cache:</span>
              <span
                className={
                  status.cache.connected
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }
              >
                {status.cache.connected ? "Connected" : "Disconnected"}
              </span>
            </div>
            {status.cache.connected && (
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-slate-600 dark:text-slate-400">Keys:</span>
                <span className="text-slate-900 dark:text-white">{status.cache.keys}</span>
              </div>
            )}
          </div>

          {/* Auth */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400">Auth (JWT):</span>
              <span
                className={
                  status.auth.jwtConfigured
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }
              >
                {status.auth.jwtConfigured ? "Configured" : "Not Configured"}
              </span>
            </div>
          </div>

          {/* Last Updated */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
            Last updated: {new Date(status.timestamp).toLocaleTimeString()}
          </div>
        </div>
      ) : null}
    </div>
  );
}
