import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SplitBill Pro",
  description: "Modern Enterprise Bill Splitting Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={cn(
          inter.className,
          "bg-slate-950 text-slate-100 antialiased subtle-scrollbar"
        )}
        suppressHydrationWarning
      >
        <div className="flex min-h-screen" suppressHydrationWarning>
          <Sidebar />
          <main className="relative flex-1 min-w-0 overflow-y-auto">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-[15%] top-[10%] h-[280px] w-[280px] rounded-full bg-indigo-500/20 blur-[140px]" />
              <div className="absolute right-[8%] top-[35%] h-[220px] w-[220px] rounded-full bg-purple-600/20 blur-[140px]" />
              <div className="absolute bottom-[10%] left-1/2 h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-pink-500/15 blur-[160px]" />
            </div>
            <div className="relative w-full space-y-10 px-4 pb-12 pt-12 sm:px-6 lg:px-10 xl:px-16">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
