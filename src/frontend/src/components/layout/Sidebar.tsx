import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import {
  Award,
  Calculator,
  ChevronRight,
  FileText,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  UserCircle,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { AppRoute } from "../../App";
import { useActor } from "../../hooks/useActor";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";

interface SidebarProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  onClose?: () => void;
}

const navItems: {
  route: AppRoute;
  label: string;
  icon: React.FC<{ className?: string }>;
  ocid: string;
}[] = [
  {
    route: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    ocid: "nav.dashboard_link",
  },
  {
    route: "documents",
    label: "Documents",
    icon: FileText,
    ocid: "nav.documents_link",
  },
  {
    route: "benefits",
    label: "Benefits Finder",
    icon: Award,
    ocid: "nav.benefits_link",
  },
  {
    route: "tools",
    label: "Financial Tools",
    icon: Calculator,
    ocid: "nav.tools_link",
  },
  { route: "crm", label: "CRM", icon: Users, ocid: "nav.crm_link" },
  {
    route: "profile",
    label: "Profile",
    icon: UserCircle,
    ocid: "nav.profile_link",
  },
];

export default function Sidebar({
  currentRoute,
  onNavigate,
  onClose,
}: SidebarProps) {
  const { clear, identity } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const [isAdmin, setIsAdmin] = useState(false);

  const principalStr = identity?.getPrincipal().toString() ?? "";
  const shortPrincipal = principalStr
    ? `${principalStr.slice(0, 5)}...${principalStr.slice(-3)}`
    : "";

  const { data: adminStatus } = useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });

  useEffect(() => {
    if (adminStatus !== undefined) setIsAdmin(adminStatus);
  }, [adminStatus]);

  return (
    <div className="w-64 h-full bg-sidebar flex flex-col shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-16 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shrink-0 shadow-saffron">
            <img
              src="/assets/generated/msme-logo-transparent.dim_120x120.png"
              alt="Logo"
              className="w-7 h-7 rounded object-contain"
            />
          </div>
          <div>
            <div className="font-display font-bold text-sm text-sidebar-foreground leading-tight">
              MSME Desk
            </div>
            <div className="text-xs text-sidebar-foreground/50 leading-tight">
              India
            </div>
          </div>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-7 w-7 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentRoute === item.route;
          return (
            <button
              type="button"
              key={item.route}
              data-ocid={item.ocid}
              onClick={() => onNavigate(item.route)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  isActive ? "text-primary-foreground" : "",
                )}
              />
              <span className="flex-1 text-left">{item.label}</span>
              {isActive && <ChevronRight className="h-3.5 w-3.5 opacity-70" />}
            </button>
          );
        })}

        {isAdmin && (
          <button
            type="button"
            data-ocid="nav.admin_link"
            onClick={() => onNavigate("admin")}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
              currentRoute === "admin"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
            )}
          >
            <ShieldCheck className={cn("h-4 w-4 shrink-0")} />
            <span className="flex-1 text-left">Admin</span>
            {currentRoute === "admin" && (
              <ChevronRight className="h-3.5 w-3.5 opacity-70" />
            )}
          </button>
        )}
      </nav>

      <Separator className="bg-sidebar-border" />

      {/* User & Logout */}
      <div className="px-3 py-4 space-y-3">
        <div className="flex items-center gap-3 px-2">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
              {shortPrincipal.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-sidebar-foreground truncate">
              {shortPrincipal}
            </p>
            <p className="text-xs text-sidebar-foreground/40">
              Internet Identity
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          data-ocid="auth.logout_button"
          onClick={clear}
          className="w-full justify-start gap-3 px-3 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          size="sm"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
