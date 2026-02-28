import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRecentEmails, type EmailPreview } from "@/app/actions/gmail";
import Link from "next/link";
import { ArrowLeft, Mail, User, Calendar } from "lucide-react";

function formatDate(dateStr: string) {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) {
      return date.toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffDays === 1) {
      return "Dün";
    } else if (diffDays < 7) {
      return date.toLocaleDateString("tr-TR", { weekday: "short" });
    } else {
      return date.toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "short",
      });
    }
  } catch {
    return dateStr;
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  let emails: EmailPreview[] = [];
  let error: string | null = null;

  try {
    emails = await getRecentEmails();
  } catch (e) {
    error = e instanceof Error ? e.message : "E-postalar yüklenemedi";
  }

  return (
    <div className="min-h-screen bg-[#050506] text-white selection:bg-indigo-500/30">
      {/* Subtle gradient background */}
      <div className="fixed inset-0 bg-gradient-to-b from-indigo-950/5 via-transparent to-transparent pointer-events-none -z-10" />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-2xl bg-[#080809]/80 border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
            Ana Sayfa
          </Link>
          <div className="text-xl font-bold tracking-tight text-white">
            VISTA
            <span className="text-indigo-500 italic ml-0.5">AI</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold">
              {(session.user?.email?.[0] ?? "U").toUpperCase()}
            </div>
            <span className="text-sm text-zinc-400 max-w-[120px] truncate">
              {session.user?.email}
            </span>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            Gelen Kutusu
          </h1>
          <p className="text-zinc-500 text-sm font-medium">
            Son 20 e-posta
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="space-y-1">
          {emails.length === 0 && !error && (
            <div className="py-24 text-center">
              <Mail className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-500 font-medium">Henüz e-posta yok</p>
            </div>
          )}

          {emails.map((email, index) => (
            <div
              key={email.id}
              className="group flex items-start gap-4 p-5 rounded-2xl hover:bg-white/[0.03] transition-all duration-200 border border-transparent hover:border-white/[0.06]"
              style={{
                animationDelay: `${index * 30}ms`,
              }}
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                <Mail size={18} />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate group-hover:text-indigo-400 transition-colors">
                  {email.subject}
                </h3>
                <div className="flex flex-wrap items-center gap-4 mt-1.5 text-sm text-zinc-500">
                  <span className="flex items-center gap-1.5 truncate">
                    <User size={14} className="flex-shrink-0 text-zinc-600" />
                    {email.from}
                  </span>
                  <span className="flex items-center gap-1.5 flex-shrink-0">
                    <Calendar size={14} className="text-zinc-600" />
                    {formatDate(email.date)}
                  </span>
                </div>
              </div>

              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
