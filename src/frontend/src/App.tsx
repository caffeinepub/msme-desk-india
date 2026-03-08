import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import AppLayout from "./components/layout/AppLayout";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useProfile } from "./hooks/useProfile";
import AdminPage from "./pages/AdminPage";
import BenefitsPage from "./pages/BenefitsPage";
import CRMPage from "./pages/CRMPage";
import DashboardPage from "./pages/DashboardPage";
import DocumentsPage from "./pages/DocumentsPage";
import FinancialToolsPage from "./pages/FinancialToolsPage";
import LoginPage from "./pages/LoginPage";
import OnboardingWizard from "./pages/OnboardingWizard";
import ProfilePage from "./pages/ProfilePage";

export type AppRoute =
  | "dashboard"
  | "documents"
  | "benefits"
  | "tools"
  | "crm"
  | "profile"
  | "admin";

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const [currentRoute, setCurrentRoute] = useState<AppRoute>("dashboard");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { profile, isLoading: profileLoading } = useProfile();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  useEffect(() => {
    if (isAuthenticated && !profileLoading && profile !== null) {
      if (!profile.profileComplete) {
        setShowOnboarding(true);
      } else {
        setShowOnboarding(false);
      }
    }
  }, [isAuthenticated, profile, profileLoading]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary animate-pulse" />
          <p className="text-muted-foreground font-sans text-sm">
            Loading MSME Desk India...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <LoginPage />
        <Toaster />
      </>
    );
  }

  if (showOnboarding && !profileLoading) {
    return (
      <>
        <OnboardingWizard onComplete={() => setShowOnboarding(false)} />
        <Toaster />
      </>
    );
  }

  const renderPage = () => {
    switch (currentRoute) {
      case "dashboard":
        return <DashboardPage onNavigate={setCurrentRoute} />;
      case "documents":
        return <DocumentsPage />;
      case "benefits":
        return <BenefitsPage />;
      case "tools":
        return <FinancialToolsPage />;
      case "crm":
        return <CRMPage />;
      case "profile":
        return <ProfilePage />;
      case "admin":
        return <AdminPage />;
      default:
        return <DashboardPage onNavigate={setCurrentRoute} />;
    }
  };

  return (
    <>
      <AppLayout currentRoute={currentRoute} onNavigate={setCurrentRoute}>
        {renderPage()}
      </AppLayout>
      <Toaster />
    </>
  );
}
