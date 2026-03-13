"use client";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <html>
      <body className="bg-[#080809] text-white p-8">
        <h1 className="text-2xl font-bold text-red-400 mb-4">Error</h1>
        <pre className="bg-black/50 p-4 rounded text-sm text-red-300 overflow-auto">
          {error.message}
        </pre>
      </body>
    </html>
  );
}
