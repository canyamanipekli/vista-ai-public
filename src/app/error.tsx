"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#080809] text-white p-8 flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold text-red-400 mb-4">Something went wrong</h1>
      <pre className="bg-black/50 p-4 rounded text-sm text-red-300 max-w-2xl overflow-auto mb-6">
        {error.message}
      </pre>
      <button
        onClick={reset}
        className="px-6 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-500"
      >
        Try again
      </button>
    </div>
  );
}
