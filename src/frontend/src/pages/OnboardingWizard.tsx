import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Building2,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  Landmark,
  Loader2,
  SkipForward,
  UserCheck,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { BusinessProfile } from "../backend.d";
import { emptyProfile, useProfile } from "../hooks/useProfile";

const steps = [
  {
    id: 1,
    title: "Basic Info",
    icon: Building2,
    desc: "Business name and contact details",
  },
  {
    id: 2,
    title: "Registration",
    icon: FileText,
    desc: "GSTIN, PAN and registration numbers",
  },
  {
    id: 3,
    title: "Bank Details",
    icon: Landmark,
    desc: "Your business bank account info",
  },
  {
    id: 4,
    title: "Signatory",
    icon: UserCheck,
    desc: "Authorized signatory details",
  },
];

interface OnboardingWizardProps {
  onComplete: () => void;
}

export default function OnboardingWizard({
  onComplete,
}: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<BusinessProfile>(emptyProfile());
  const { saveProfile, isSaving } = useProfile();

  const progress = ((step - 1) / (steps.length - 1)) * 100;

  const update = (
    field: keyof BusinessProfile,
    value: string | boolean | bigint,
  ) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < steps.length) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSave = async (complete: boolean) => {
    try {
      const now = BigInt(Date.now()) * BigInt(1_000_000);
      const profileToSave: BusinessProfile = {
        ...profile,
        profileComplete: complete,
        createdAt: now,
        updatedAt: now,
      };
      await saveProfile(profileToSave);
      toast.success(
        complete
          ? "Profile completed successfully!"
          : "Profile saved. You can complete it later.",
      );
      onComplete();
    } catch {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img
              src="/assets/generated/msme-logo-transparent.dim_120x120.png"
              alt="MSME Desk India"
              className="w-10 h-10 rounded-xl"
            />
            <h1 className="font-display text-2xl font-bold text-foreground">
              MSME Desk India
            </h1>
          </div>
          <h2 className="font-display text-xl font-semibold text-foreground">
            Set up your Business Profile
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            This information will be auto-filled in all your documents
          </p>
        </div>

        {/* Steps indicator */}
        <div className="bg-card rounded-2xl border border-border shadow-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              const isDone = step > s.id;
              const isCurrent = step === s.id;
              return (
                <div key={s.id} className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all",
                      isDone
                        ? "bg-success text-success-foreground"
                        : isCurrent
                          ? "bg-primary text-primary-foreground shadow-saffron"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {isDone ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <div className="hidden sm:block">
                    <p
                      className={cn(
                        "text-xs font-semibold",
                        isCurrent ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {s.title}
                    </p>
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={cn(
                        "hidden sm:block w-8 h-0.5 mx-2",
                        isDone ? "bg-success" : "bg-border",
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <Progress value={progress} className="h-1.5" />
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Step {step} of {steps.length} — {steps[step - 1].desc}
          </p>
        </div>

        {/* Step Content */}
        <div className="bg-card rounded-2xl border border-border shadow-card p-6 animate-fade-in">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" /> Basic Information
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    placeholder="e.g. Sharma Exports Pvt Ltd"
                    value={profile.businessName}
                    onChange={(e) => update("businessName", e.target.value)}
                    data-ocid="profile.businessname_input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Business Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="info@yourbusiness.com"
                    value={profile.email}
                    onChange={(e) => update("email", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    placeholder="+91 98765 43210"
                    value={profile.phone}
                    onChange={(e) => update("phone", e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="address">Business Address *</Label>
                  <Textarea
                    id="address"
                    placeholder="Shop/Office No., Street, City, State, PIN Code"
                    value={profile.address}
                    onChange={(e) => update("address", e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Registration
                Details
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="gstin">GSTIN</Label>
                  <Input
                    id="gstin"
                    placeholder="22AAAAA0000A1Z5"
                    value={profile.gstin}
                    onChange={(e) =>
                      update("gstin", e.target.value.toUpperCase())
                    }
                    data-ocid="profile.gstin_input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pan">PAN Number</Label>
                  <Input
                    id="pan"
                    placeholder="AAAAA0000A"
                    value={profile.pan}
                    onChange={(e) =>
                      update("pan", e.target.value.toUpperCase())
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="iecCode">IEC Code</Label>
                  <Input
                    id="iecCode"
                    placeholder="0987654321"
                    value={profile.iecCode}
                    onChange={(e) => update("iecCode", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Import Export Code (for exporters)
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="udyamNumber">MSME/Udyam Number</Label>
                  <Input
                    id="udyamNumber"
                    placeholder="UDYAM-XX-00-0000000"
                    value={profile.udyamNumber}
                    onChange={(e) =>
                      update("udyamNumber", e.target.value.toUpperCase())
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                <Landmark className="h-5 w-5 text-primary" /> Bank Details
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    placeholder="State Bank of India"
                    value={profile.bankName}
                    onChange={(e) => update("bankName", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    placeholder="0123456789"
                    value={profile.accountNumber}
                    onChange={(e) => update("accountNumber", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ifscCode">IFSC Code</Label>
                  <Input
                    id="ifscCode"
                    placeholder="SBIN0001234"
                    value={profile.ifscCode}
                    onChange={(e) =>
                      update("ifscCode", e.target.value.toUpperCase())
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="branchName">Branch Name</Label>
                  <Input
                    id="branchName"
                    placeholder="Mumbai Main Branch"
                    value={profile.branchName}
                    onChange={(e) => update("branchName", e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" /> Authorized
                Signatory
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="authorizedSignatory">Signatory Name *</Label>
                  <Input
                    id="authorizedSignatory"
                    placeholder="Rajesh Kumar Sharma"
                    value={profile.authorizedSignatory}
                    onChange={(e) =>
                      update("authorizedSignatory", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signatoryDesignation">Designation *</Label>
                  <Input
                    id="signatoryDesignation"
                    placeholder="Managing Director / Proprietor"
                    value={profile.signatoryDesignation}
                    onChange={(e) =>
                      update("signatoryDesignation", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="bg-secondary/50 rounded-xl p-4">
                <p className="text-sm text-muted-foreground">
                  ✅ Profile ready! Click "Complete Setup" to save your profile
                  and start using MSME Desk India.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={() => handleSave(false)}
                className="text-muted-foreground gap-2"
                disabled={isSaving}
              >
                <SkipForward className="h-4 w-4" /> Complete Later
              </Button>
            </div>

            {step < steps.length ? (
              <Button
                onClick={handleNext}
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={() => handleSave(true)}
                disabled={isSaving}
                className="gap-2 bg-primary hover:bg-primary/90 shadow-saffron"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                Complete Setup
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
