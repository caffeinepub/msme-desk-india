import { Button } from "@/components/ui/button";
import {
  Award,
  Calculator,
  CheckCircle,
  FileText,
  Loader2,
  Users,
} from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const highlights = [
  "Auto-fill business profile in all documents",
  "18+ templates: invoices, contracts, export docs",
  "Government scheme eligibility checker",
  "Secure — powered by Internet Computer blockchain",
];

const stats = [
  { value: "18+", label: "Document Templates" },
  { value: "7+", label: "Gov Schemes" },
  { value: "4", label: "Financial Tools" },
  { value: "100%", label: "Secure & Free" },
];

const modules = [
  { icon: FileText, label: "Documents", desc: "Trade, Export & Agreements" },
  { icon: Award, label: "Benefits", desc: "Mudra, PMEGP, CGTMSE & more" },
  { icon: Users, label: "CRM", desc: "Customers, Orders, Payments" },
  { icon: Calculator, label: "Tools", desc: "GST, EMI, FOB/CIF calc" },
];

export default function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Atmospheric background */}
      <div className="absolute inset-0 bg-[oklch(0.13_0.03_250)]" />
      {/* Radial glow — saffron */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 20% 50%, oklch(0.65 0.18 44 / 0.12) 0%, transparent 70%), radial-gradient(ellipse 50% 80% at 80% 30%, oklch(0.55 0.15 250 / 0.15) 0%, transparent 60%)",
        }}
      />
      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.9 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(0.9 0 0) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Main layout */}
      <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-[1fr_420px] gap-12 items-center">
        {/* ── Left: Brand & Value Prop ── */}
        <div className="space-y-10 animate-fade-in">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary shadow-saffron flex items-center justify-center shrink-0">
              <img
                src="/assets/generated/msme-logo-transparent.dim_120x120.png"
                alt="MSME Desk India"
                className="w-8 h-8 rounded-lg object-contain"
              />
            </div>
            <div>
              <p className="font-display font-bold text-white text-lg leading-tight">
                MSME Desk India
              </p>
              <p className="text-xs text-white/40 leading-tight tracking-wide uppercase">
                Business Operations Platform
              </p>
            </div>
          </div>

          {/* Hero headline */}
          <div className="space-y-4">
            <h1 className="font-display text-4xl lg:text-5xl font-bold leading-[1.1] tracking-tight">
              <span className="text-white">Run your MSME</span>
              <br />
              <span
                style={{
                  background:
                    "linear-gradient(90deg, oklch(0.75 0.18 44) 0%, oklch(0.82 0.16 70) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                smarter, faster.
              </span>
            </h1>
            <p className="text-white/55 text-base leading-relaxed max-w-md">
              Generate professional documents, discover government schemes, and
              manage your business operations — all in one place designed for
              Indian entrepreneurs.
            </p>
          </div>

          {/* Highlights */}
          <div className="space-y-3">
            {highlights.map((h) => (
              <div key={h} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle className="h-3 w-3 text-primary" />
                </div>
                <span className="text-sm text-white/70 leading-relaxed">
                  {h}
                </span>
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-4 pt-2">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-display font-bold text-xl text-primary">
                  {s.value}
                </p>
                <p className="text-xs text-white/40 mt-0.5 leading-tight">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* Module icons row */}
          <div className="flex items-center gap-3 flex-wrap">
            {modules.map((m) => {
              const Icon = m.icon;
              return (
                <div
                  key={m.label}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-white/5"
                >
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs text-white/60 font-medium">
                    {m.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right: Login Card ── */}
        <div
          data-ocid="auth.login_button"
          className="animate-fade-in"
          style={{ animationDelay: "0.15s" }}
        >
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "oklch(0.98 0.003 95)",
              boxShadow:
                "0 0 0 1px oklch(0.9 0.008 95), 0 32px 64px oklch(0.1 0.02 250 / 0.4)",
            }}
          >
            {/* Top accent bar — saffron */}
            <div className="h-1 bg-gradient-to-r from-primary via-[oklch(0.72_0.18_55)] to-primary/40" />

            <div className="p-8 space-y-7">
              {/* Card header */}
              <div className="space-y-1">
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Welcome back
                </h2>
                <p className="text-sm text-muted-foreground">
                  Sign in to your MSME Desk India account
                </p>
              </div>

              {/* CTA */}
              <div className="space-y-3">
                <Button
                  size="lg"
                  className="w-full gap-3 font-semibold h-12 text-base"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.62 0.18 44) 0%, oklch(0.58 0.2 38) 100%)",
                    boxShadow: "0 4px 20px oklch(0.65 0.18 44 / 0.35)",
                    color: "white",
                  }}
                  onClick={login}
                  disabled={isLoggingIn}
                  data-ocid="auth.login_button"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    <>
                      <svg
                        viewBox="0 0 24 24"
                        className="h-5 w-5 fill-current"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                      </svg>
                      Sign in with Internet Identity
                    </>
                  )}
                </Button>

                {/* Security note */}
                <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/60 border border-border/50">
                  <div className="w-7 h-7 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                    <svg
                      className="h-3.5 w-3.5 text-success"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      aria-hidden="true"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    No passwords. Cryptographically secured by your device.
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">
                  Designed for
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Industry tags */}
              <div className="flex flex-wrap gap-2">
                {[
                  "🏭 Manufacturing",
                  "🛒 Trading",
                  "🔧 Services",
                  "🚢 Export",
                  "🏪 Retail",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium border border-border/50"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center z-10">
        <p className="text-xs text-white/30">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary/70 hover:text-primary transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
