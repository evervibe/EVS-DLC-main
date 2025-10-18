"use client";

import { useEffect, useState } from "react";

interface MetricsData {
  timestamp: string;
  version: string;
  databases: Record<string, DatabaseMetrics>;
  cache: {
    connected: boolean;
    keyCount: number;
  };
  system: {
    uptime: number;
    memory: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
    };
    nodeVersion: string;
    platform: string;
    arch: string;
  };
}

interface DatabaseMetrics {
  status: string;
  active?: number;
  idle?: number;
  total?: number;
  connectionLimit?: number;
  error?: string;
}

export default function MetricsWidget() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:30089";

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/health/metrics`);
      if (!response.ok) throw new Error("Metrics fetch failed");
      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Refresh every 30s
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (loading && !metrics) {
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
          System Metrics
        </h2>
        <button
          onClick={fetchMetrics}
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
        <div className="text-sm text-red-600 dark:text-red-400">Error: {error}</div>
      ) : metrics ? (
        <div className="space-y-4">
          {/* System Info */}
          <div>
            <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
              System
            </h3>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Uptime:</span>
                <span className="text-slate-900 dark:text-white">
                  {formatUptime(metrics.system.uptime)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Node:</span>
                <span className="text-slate-900 dark:text-white font-mono">
                  {metrics.system.nodeVersion}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Platform:</span>
                <span className="text-slate-900 dark:text-white">
                  {metrics.system.platform} ({metrics.system.arch})
                </span>
              </div>
            </div>
          </div>

          {/* Memory */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
            <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
              Memory Usage
            </h3>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Heap Used:</span>
                <span className="text-slate-900 dark:text-white">
                  {formatBytes(metrics.system.memory.heapUsed)} /{" "}
                  {formatBytes(metrics.system.memory.heapTotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">RSS:</span>
                <span className="text-slate-900 dark:text-white">
                  {formatBytes(metrics.system.memory.rss)}
                </span>
              </div>
            </div>
          </div>

          {/* Database Connections */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
            <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
              Database Pools
            </h3>
            <div className="space-y-2">
              {Object.entries(metrics.databases).map(([name, info]: [string, DatabaseMetrics]) => (
                <div key={name} className="text-xs">
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-600 dark:text-slate-400 capitalize">
                      {name}:
                    </span>
                    <span
                      className={`font-medium ${
                        info.status === "healthy"
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {info.status}
                    </span>
                  </div>
                  {info.status === "healthy" && (
                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>Active: {info.active}</span>
                      <span>Idle: {info.idle}</span>
                      <span>Total: {info.total}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Last Updated */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
            Last updated: {new Date(metrics.timestamp).toLocaleTimeString()}
          </div>
        </div>
      ) : null}
    </div>
  );
}
