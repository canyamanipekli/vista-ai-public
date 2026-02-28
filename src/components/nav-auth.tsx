"use client";

import { signIn, useSession } from "next-auth/react";
import Link from "next/link";

export function NavAuth() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="h-9 w-28 rounded-full bg-white/5 animate-pulse" />
    );
  }

  if (session) {
    return (
      <Link
        href="/dashboard"
        className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-semibold hover:bg-white/10 transition-all"
      >
        Go to Dashboard
      </Link>
    );
  }

  return (
    <button
      onClick={() => signIn("google")}
      className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-semibold hover:bg-white/10 transition-all"
    >
      Dashboard
    </button>
  );
}
