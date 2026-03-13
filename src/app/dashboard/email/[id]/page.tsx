import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getFullEmail } from "@/app/actions/gmail";
import Link from "next/link";
import { ArrowLeft, User, Calendar } from "lucide-react";

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnTo?: string }>;
};

export default async function EmailPage({ params, searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  const { id } = await params;
  const sp = await searchParams;
  const returnTo = sp.returnTo || "/dashboard";
  const email = await getFullEmail(id);

  if (!email) notFound();

  return (
    <div className="min-h-screen bg-[#050506] text-white selection:bg-indigo-500/30">
      <div className="fixed inset-0 bg-gradient-to-b from-indigo-950/5 via-transparent to-transparent pointer-events-none -z-10" />

      <nav className="sticky top-0 z-50 backdrop-blur-2xl bg-[#080809]/80 border-b border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href={returnTo}
            prefetch={false}
            className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
            Back
          </Link>
          <div className="text-xl font-bold tracking-tight text-white truncate flex-1">
            {email.subject}
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-6 space-y-2 text-sm">
          <div className="flex items-center gap-2 text-zinc-400">
            <User size={14} className="text-zinc-500 shrink-0" />
            <span className="truncate">{email.from}</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-400">
            <Calendar size={14} className="text-zinc-500 shrink-0" />
            <span>{formatDate(email.date)}</span>
          </div>
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 p-6 text-zinc-300 text-sm leading-relaxed">
          {email.bodyHtml ? (
            <div
              className="prose prose-invert prose-sm max-w-none [&_a]:text-indigo-400 [&_a]:underline [&_img]:max-w-full [&_img]:h-auto [&_p]:mb-3 [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4"
              dangerouslySetInnerHTML={{ __html: email.bodyHtml }}
            />
          ) : (
            <pre className="whitespace-pre-wrap font-sans text-zinc-300 break-words">
              {email.bodyText}
            </pre>
          )}
        </div>
      </main>
    </div>
  );
}
