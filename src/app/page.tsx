import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary flex items-center justify-center text-primary-foreground text-xs font-black">
            SB
          </div>
          <span className="text-sm font-semibold tracking-tight">SplitBill Pro</span>
        </div>
        <nav className="flex items-center gap-6">
          <Link
            href="/auth/login"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/auth/register"
            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all"
          >
            Get started
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="mb-6 opacity-0 animate-slide-up">
          <span className="font-mono text-xs text-primary uppercase tracking-[0.3em]">
            — Split smarter —
          </span>
        </div>

        <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-black tracking-tighter leading-none mb-8 opacity-0 animate-slide-up animation-delay-100">
          SPLIT
          <br />
          <span className="text-primary">FAIRLY.</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-lg mb-12 leading-relaxed opacity-0 animate-slide-up animation-delay-200">
          Track shared expenses, split bills item-by-item, and settle debts —
          without spreadsheets or drama.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 opacity-0 animate-slide-up animation-delay-300">
          <Link
            href="/auth/register"
            className="px-8 py-4 bg-primary text-primary-foreground font-bold text-sm hover:brightness-110 active:scale-[0.98] transition-all"
          >
            Start for free →
          </Link>
          <Link
            href="/auth/login"
            className="px-8 py-4 border border-border text-foreground font-medium text-sm hover:border-foreground transition-colors"
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-t border-border opacity-0 animate-slide-up animation-delay-400">
        <div className="grid grid-cols-3 divide-x divide-border">
          {[
            { stat: "∞", label: "Bills tracked" },
            { stat: "100%", label: "Precision splits" },
            { stat: "0₫", label: "Cost forever" },
          ].map(({ stat, label }) => (
            <div
              key={label}
              className="flex flex-col items-center justify-center py-10 px-4 text-center"
            >
              <span className="text-3xl md:text-4xl font-black text-primary font-mono">
                {stat}
              </span>
              <span className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
          {[
            {
              icon: "🧾",
              title: "Item-by-item Splitting",
              desc: "Add individual items to a bill. Assign each item to specific people — equal, manual, or percentage mode.",
            },
            {
              icon: "👥",
              title: "People & Groups",
              desc: "Save your frequent contacts with their bank details and QR codes. Organize into groups for repeat bills.",
            },
            {
              icon: "📊",
              title: "Settlement Dashboard",
              desc: "See exactly who owes what at a glance. Mark payments as settled and track your financial history.",
            },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="p-8 md:p-12">
              <div className="text-3xl mb-4">{icon}</div>
              <h3 className="text-base font-bold mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border px-6 py-20 flex flex-col items-center text-center">
        <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4">
          Ready to settle up?
        </h2>
        <p className="text-muted-foreground text-sm mb-8">
          Free forever. No credit card required.
        </p>
        <Link
          href="/auth/register"
          className="px-10 py-4 bg-primary text-primary-foreground font-bold text-sm hover:brightness-110 active:scale-[0.98] transition-all"
        >
          Create your account →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary flex items-center justify-center text-primary-foreground text-[10px] font-black">
            SB
          </div>
          <span className="text-xs text-muted-foreground">SplitBill Pro</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Built with precision.
        </p>
      </footer>
    </div>
  );
}
