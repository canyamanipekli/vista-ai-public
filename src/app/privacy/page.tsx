import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#080809] text-white p-8 max-w-2xl mx-auto">
      <Link href="/" className="text-indigo-400 hover:text-indigo-300 text-sm mb-8 block">
        ← Back to Home
      </Link>
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-zinc-400 text-sm mb-4">Last updated: 2026</p>
      <div className="space-y-4 text-zinc-300 leading-relaxed">
        <p>
          VISTA AI uses your Gmail data only to display your emails within the app. 
          We read email metadata (subject, sender, date) to show your inbox. 
          Your data is not stored on our servers.
        </p>
        <p>
          We use Google OAuth for secure authentication. Google handles your credentials. 
          We only receive an access token to read your emails with your permission.
        </p>
        <p>
          For questions, contact us at your email.
        </p>
      </div>
    </div>
  );
}
