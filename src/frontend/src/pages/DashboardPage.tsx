import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Award,
  Calculator,
  ChevronRight,
  CreditCard,
  FileText,
  Package,
  Plus,
  UserCircle,
  Users,
} from "lucide-react";
import type { AppRoute } from "../App";
import { Category } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useDocumentRecords } from "../hooks/useDocuments";
import { useProfile } from "../hooks/useProfile";

interface DashboardPageProps {
  onNavigate: (route: AppRoute) => void;
}

const categoryColors: Record<string, string> = {
  [Category.trade]: "bg-chart-1/10 text-chart-1 border-chart-1/20",
  [Category.export_]: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  [Category.agreement]: "bg-chart-3/10 text-chart-3 border-chart-3/20",
};

const categoryLabels: Record<string, string> = {
  [Category.trade]: "Trade",
  [Category.export_]: "Export",
  [Category.agreement]: "Agreement",
};

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { actor, isFetching } = useActor();
  const { profile, isLoading: profileLoading } = useProfile();
  const { data: docRecords, isLoading: docsLoading } = useDocumentRecords(0, 5);

  const { data: contacts } = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getContacts();
    },
    enabled: !!actor && !isFetching,
  });

  const { data: schemes } = useQuery({
    queryKey: ["schemes"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSchemes();
    },
    enabled: !!actor && !isFetching,
  });

  const { data: orders } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOrders();
    },
    enabled: !!actor && !isFetching,
  });

  const openOrders =
    orders?.filter(
      (o) => o.status !== "completed" && o.status !== "cancelled",
    ) ?? [];

  // Colored left-border accent per stat card
  const stats = [
    {
      label: "Total Documents",
      value: docRecords?.length ?? 0,
      icon: FileText,
      iconColor: "text-[oklch(0.65_0.18_44)]",
      iconBg: "bg-[oklch(0.65_0.18_44/0.1)]",
      barColor: "bg-[oklch(0.65_0.18_44)]",
      sub: "Across all templates",
      ocid: "dashboard.stats_card.1",
    },
    {
      label: "Open Orders",
      value: openOrders.length,
      icon: Package,
      iconColor: "text-[oklch(0.55_0.15_250)]",
      iconBg: "bg-[oklch(0.55_0.15_250/0.1)]",
      barColor: "bg-[oklch(0.55_0.15_250)]",
      sub: "Pending or processing",
      ocid: "dashboard.stats_card.2",
    },
    {
      label: "Active Schemes",
      value: schemes?.filter((s) => s.isActive).length ?? 0,
      icon: Award,
      iconColor: "text-[oklch(0.62_0.17_145)]",
      iconBg: "bg-[oklch(0.62_0.17_145/0.1)]",
      barColor: "bg-[oklch(0.62_0.17_145)]",
      sub: "Govt benefit schemes",
      ocid: "dashboard.stats_card.3",
    },
    {
      label: "CRM Contacts",
      value: contacts?.length ?? 0,
      icon: Users,
      iconColor: "text-[oklch(0.75_0.18_80)]",
      iconBg: "bg-[oklch(0.75_0.18_80/0.1)]",
      barColor: "bg-[oklch(0.75_0.18_80)]",
      sub: "Customers & suppliers",
      ocid: "dashboard.stats_card.4",
    },
  ];

  const quickAccess = [
    {
      label: "Create Document",
      icon: Plus,
      route: "documents" as AppRoute,
      desc: "Invoice, contract, export docs",
      primary: true,
      ocid: "dashboard.quickaccess.item.1",
    },
    {
      label: "Benefits Finder",
      icon: Award,
      route: "benefits" as AppRoute,
      desc: "Find eligible gov schemes",
      primary: false,
      ocid: "dashboard.quickaccess.item.2",
    },
    {
      label: "CRM",
      icon: Users,
      route: "crm" as AppRoute,
      desc: "Contacts & orders",
      primary: false,
      ocid: "dashboard.quickaccess.item.3",
    },
    {
      label: "Financial Tools",
      icon: Calculator,
      route: "tools" as AppRoute,
      desc: "GST, EMI, margin calc",
      primary: false,
      ocid: "dashboard.quickaccess.item.4",
    },
    {
      label: "My Profile",
      icon: UserCircle,
      route: "profile" as AppRoute,
      desc: "Update business details",
      primary: false,
      ocid: "dashboard.quickaccess.item.5",
    },
    {
      label: "Payment Tracker",
      icon: CreditCard,
      route: "crm" as AppRoute,
      desc: "Track dues & payments",
      primary: false,
      ocid: "dashboard.quickaccess.item.6",
    },
  ];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            {greeting()},{" "}
            <span className="text-primary">
              {profile?.businessName || "Business Owner"}
            </span>{" "}
            👋
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <Button
          onClick={() => onNavigate("documents")}
          className="gap-2 shadow-saffron hidden sm:flex"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.62 0.18 44) 0%, oklch(0.58 0.2 38) 100%)",
            color: "white",
          }}
        >
          <Plus className="h-4 w-4" /> New Document
        </Button>
      </div>

      {/* Profile Incomplete Banner */}
      {!profileLoading && profile && !profile.profileComplete && (
        <Alert className="border-warning/30 bg-warning/10">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <AlertDescription className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-sm">
              Your business profile is incomplete. Complete it to auto-fill all
              documents.
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onNavigate("profile")}
              className="border-warning/40 text-warning-foreground hover:bg-warning/10 gap-1"
            >
              Complete Profile <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Row — with colored left-bar accent */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              data-ocid={stat.ocid}
              className="shadow-card hover:shadow-card-hover transition-shadow overflow-hidden"
            >
              {/* Left accent bar */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-1 ${stat.barColor} rounded-l`}
              />
              <CardContent className="p-4 pl-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground font-medium leading-snug">
                      {stat.label}
                    </p>
                    {docsLoading || isFetching ? (
                      <Skeleton className="h-8 w-14 mt-1.5 rounded" />
                    ) : (
                      <p className="text-3xl font-display font-bold text-foreground mt-1 leading-none">
                        {stat.value}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground/70 mt-1.5 leading-tight">
                      {stat.sub}
                    </p>
                  </div>
                  <div
                    className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center shrink-0`}
                  >
                    <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Documents */}
        <div className="lg:col-span-2">
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="font-display text-base">
                  Recent Documents
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate("documents")}
                  className="text-primary gap-1 h-8"
                >
                  View All <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {docsLoading ? (
                <div className="px-6 pb-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                  ))}
                </div>
              ) : !docRecords || docRecords.length === 0 ? (
                <div
                  data-ocid="dashboard.recent_docs.empty_state"
                  className="text-center py-12 px-6"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm font-semibold text-foreground mb-1">
                    No documents yet
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Create your first invoice, contract, or export document
                  </p>
                  <Button
                    size="sm"
                    onClick={() => onNavigate("documents")}
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.62 0.18 44) 0%, oklch(0.58 0.2 38) 100%)",
                      color: "white",
                    }}
                  >
                    Create first document
                  </Button>
                </div>
              ) : (
                <div
                  data-ocid="dashboard.recent_docs.table"
                  className="divide-y divide-border"
                >
                  {docRecords.slice(0, 5).map((doc, idx) => (
                    <div
                      key={doc.id}
                      data-ocid={`dashboard.recent_docs.row.item.${idx + 1}`}
                      className="flex items-center gap-4 px-6 py-3.5 hover:bg-muted/30 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {doc.templateName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(
                            Number(doc.createdAt) / 1_000_000,
                          ).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs shrink-0 ${categoryColors[doc.category] ?? ""}`}
                      >
                        {categoryLabels[doc.category] ?? doc.categoryText}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Access — primary CTA is visually dominant */}
        <div>
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base">
                Quick Access
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              {/* Primary CTA — Create Document — full-width, filled saffron */}
              {quickAccess.slice(0, 1).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    type="button"
                    key={item.label}
                    data-ocid={item.ocid}
                    onClick={() => onNavigate(item.route)}
                    className="w-full flex items-center gap-3 p-3.5 rounded-xl transition-all group"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.62 0.18 44 / 0.12) 0%, oklch(0.65 0.18 44 / 0.06) 100%)",
                      border: "1px solid oklch(0.65 0.18 44 / 0.25)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "linear-gradient(135deg, oklch(0.62 0.18 44) 0%, oklch(0.58 0.2 38) 100%)";
                      (e.currentTarget as HTMLButtonElement).style.borderColor =
                        "transparent";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "linear-gradient(135deg, oklch(0.62 0.18 44 / 0.12) 0%, oklch(0.65 0.18 44 / 0.06) 100%)";
                      (e.currentTarget as HTMLButtonElement).style.borderColor =
                        "oklch(0.65 0.18 44 / 0.25)";
                    }}
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-colors">
                      <Icon className="h-4 w-4 text-primary group-hover:text-white transition-colors" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground group-hover:text-white transition-colors leading-tight">
                        {item.label}
                      </p>
                      <p className="text-xs text-muted-foreground group-hover:text-white/70 transition-colors mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-primary/50 group-hover:text-white/70 transition-colors ml-auto shrink-0" />
                  </button>
                );
              })}

              {/* Secondary items — 2-col grid */}
              <div className="grid grid-cols-2 gap-2">
                {quickAccess.slice(1).map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      type="button"
                      key={item.label}
                      data-ocid={item.ocid}
                      onClick={() => onNavigate(item.route)}
                      className="flex flex-col items-start p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all group text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center mb-2 group-hover:bg-primary/15 transition-colors">
                        <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <p className="text-xs font-semibold text-foreground leading-tight">
                        {item.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-tight">
                        {item.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
