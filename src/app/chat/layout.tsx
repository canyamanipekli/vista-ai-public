import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VISTA Aura — AI Financial Guardian",
  description: "Your AI financial guardian. Ask about spending, subscriptions, and one-click cancellations.",
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
