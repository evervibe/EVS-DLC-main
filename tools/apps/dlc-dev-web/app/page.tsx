import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            DLC Dev Stack
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            v1.0.0-alpha
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              Welcome
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              This is the DLC Development Stack Admin Portal. 
              Access the dashboard to manage your application.
            </p>
            <div className="space-y-3">
              <Link
                href="/login"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg text-center transition-colors"
              >
                Login
              </Link>
              <Link
                href="/dashboard"
                className="block w-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-900 dark:text-white font-medium py-3 px-4 rounded-lg text-center transition-colors"
              >
                View Dashboard
              </Link>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
              Stack Info
            </h3>
            <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-2">
              <li>• Next.js 15 with App Router</li>
              <li>• React 19</li>
              <li>• TypeScript 5</li>
              <li>• Tailwind CSS 4</li>
              <li>• API: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:30089'}</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Built with ❤️ by EverVibe Studios
        </div>
      </div>
    </div>
  );
}
