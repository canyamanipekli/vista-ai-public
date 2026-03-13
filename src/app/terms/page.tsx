import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#080809] text-white p-8 max-w-2xl mx-auto">
      <Link href="/" className="text-indigo-400 hover:text-indigo-300 text-sm mb-8 block">
        ← Back to Home
      </Link>
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="text-zinc-400 text-sm mb-4">Last updated: 2026</p>
      <div className="space-y-4 text-zinc-300 leading-relaxed">
        <p>
          By using VISTA AI, you agree to connect your Gmail account and grant read-only 
          access to your inbox for the purpose of displaying your emails in the app.
        </p>
        <p>
          The service is provided &quot;as is.&quot; Use at your own risk. 
          You can revoke access anytime in your Google Account settings.
        </p>
      </div>
    </div>
  );
}
