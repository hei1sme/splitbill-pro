import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SplitBill Pro — Split fairly. Settle fast.",
  description:
    "Track shared expenses, split bills precisely, and settle debts without the drama.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html
      lang="en"
      className="dark"
      style={{ colorScheme: "dark" }}
      suppressHydrationWarning
    >
      <body
        className={cn(
          inter.variable,
          spaceGrotesk.variable,
          "font-sans bg-background text-foreground antialiased subtle-scrollbar"
        )}
        suppressHydrationWarning
      >
        <div className="flex min-h-screen" suppressHydrationWarning>
          {user && <Sidebar user={user} />}
          <main className={cn("min-w-0 overflow-y-auto", user ? "flex-1" : "w-full")}>
            {user ? (
              <div className="w-full space-y-10 px-4 pb-12 pt-12 sm:px-6 lg:px-10 xl:px-16">
                {children}
              </div>
            ) : (
              children
            )}
          </main>
        </div>
      </body>
    </html>
  );
}
