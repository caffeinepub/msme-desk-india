import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";
import type { AppRoute } from "../../App";
import Sidebar from "./Sidebar";

interface AppLayoutProps {
  children: ReactNode;
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
}

export default function AppLayout({
  children,
  currentRoute,
  onNavigate,
}: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <Sidebar currentRoute={currentRoute} onNavigate={onNavigate} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setSidebarOpen(false)}
          role="button"
          tabIndex={-1}
          aria-label="Close sidebar"
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 z-50 h-full lg:hidden transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Sidebar
          currentRoute={currentRoute}
          onNavigate={(r) => {
            onNavigate(r);
            setSidebarOpen(false);
          }}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center gap-3 px-4 h-14 border-b border-border bg-card shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="h-9 w-9"
          >
            {sidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
          <div className="flex items-center gap-2">
            <img
              src="/assets/generated/msme-logo-transparent.dim_120x120.png"
              alt="MSME Desk India"
              className="h-7 w-7 rounded"
            />
            <span className="font-display font-bold text-sm text-foreground">
              MSME Desk India
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
