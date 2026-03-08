import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  Building2,
  CheckCircle,
  FileText,
  Landmark,
  Loader2,
  Save,
  UserCheck,
  UserCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { BusinessProfile } from "../backend.d";
import { emptyProfile, useProfile } from "../hooks/useProfile";

export default function ProfilePage() {
  const { profile, isLoading, saveProfile, isSaving } = useProfile();
  const [form, setForm] = useState<BusinessProfile>(emptyProfile());

  useEffect(() => {
    if (profile) setForm(profile);
  }, [profile]);

  const update = (
    field: keyof BusinessProfile,
    value: string | boolean | bigint,
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const now = BigInt(Date.now()) * BigInt(1_000_000);
      await saveProfile({
        ...form,
        profileComplete: true,
        updatedAt: now,
        createdAt: form.createdAt || now,
      });
      toast.success("Business profile saved successfully!");
    } catch {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <UserCircle className="h-6 w-6 text-primary" /> Business Profile
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            This information is auto-filled in all your documents
          </p>
        </div>
        <div className="flex items-center gap-2">
          {profile?.profileComplete ? (
            <Badge className="bg-success/10 text-success border-success/20 gap-1">
              <CheckCircle className="h-3.5 w-3.5" /> Profile Complete
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="gap-1 border-warning/40 text-warning-foreground"
            >
              <AlertTriangle className="h-3.5 w-3.5" /> Incomplete
            </Badge>
          )}
        </div>
      </div>

      {!profile?.profileComplete && (
        <Alert className="border-warning/30 bg-warning/10">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <AlertDescription className="text-sm">
            Complete your business profile to auto-fill all document fields.
          </AlertDescription>
        </Alert>
      )}

      {/* Basic Info */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" /> Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="businessName">Business Name</Label>
            <Input
              id="businessName"
              value={form.businessName}
              onChange={(e) => update("businessName", e.target.value)}
              placeholder="Your Business Name"
              data-ocid="profile.businessname_input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Business Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="info@yourbusiness.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+91 98765 43210"
            />
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="address">Business Address</Label>
            <Textarea
              id="address"
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              placeholder="Shop/Office No., Street, City, State, PIN Code"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Registration Details */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> Registration Details
          </CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="gstin">GSTIN</Label>
            <Input
              id="gstin"
              value={form.gstin}
              onChange={(e) => update("gstin", e.target.value.toUpperCase())}
              placeholder="22AAAAA0000A1Z5"
              data-ocid="profile.gstin_input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pan">PAN Number</Label>
            <Input
              id="pan"
              value={form.pan}
              onChange={(e) => update("pan", e.target.value.toUpperCase())}
              placeholder="AAAAA0000A"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="iecCode">IEC Code</Label>
            <Input
              id="iecCode"
              value={form.iecCode}
              onChange={(e) => update("iecCode", e.target.value)}
              placeholder="0987654321"
            />
            <p className="text-xs text-muted-foreground">
              Import Export Code (for exporters)
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="udyamNumber">MSME/Udyam Registration Number</Label>
            <Input
              id="udyamNumber"
              value={form.udyamNumber}
              onChange={(e) =>
                update("udyamNumber", e.target.value.toUpperCase())
              }
              placeholder="UDYAM-XX-00-0000000"
            />
          </div>
        </CardContent>
      </Card>

      {/* Bank Details */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base flex items-center gap-2">
            <Landmark className="h-5 w-5 text-primary" /> Bank Details
          </CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="bankName">Bank Name</Label>
            <Input
              id="bankName"
              value={form.bankName}
              onChange={(e) => update("bankName", e.target.value)}
              placeholder="State Bank of India"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              value={form.accountNumber}
              onChange={(e) => update("accountNumber", e.target.value)}
              placeholder="0123456789"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ifscCode">IFSC Code</Label>
            <Input
              id="ifscCode"
              value={form.ifscCode}
              onChange={(e) => update("ifscCode", e.target.value.toUpperCase())}
              placeholder="SBIN0001234"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="branchName">Branch Name</Label>
            <Input
              id="branchName"
              value={form.branchName}
              onChange={(e) => update("branchName", e.target.value)}
              placeholder="Mumbai Main Branch"
            />
          </div>
        </CardContent>
      </Card>

      {/* Signatory */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" /> Authorized Signatory
          </CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="authorizedSignatory">Signatory Name</Label>
            <Input
              id="authorizedSignatory"
              value={form.authorizedSignatory}
              onChange={(e) => update("authorizedSignatory", e.target.value)}
              placeholder="Rajesh Kumar Sharma"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="signatoryDesignation">Designation</Label>
            <Input
              id="signatoryDesignation"
              value={form.signatoryDesignation}
              onChange={(e) => update("signatoryDesignation", e.target.value)}
              placeholder="Managing Director / Proprietor"
            />
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Save Button */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Last updated:{" "}
          {profile?.updatedAt && profile.updatedAt !== BigInt(0)
            ? new Date(Number(profile.updatedAt) / 1_000_000).toLocaleString(
                "en-IN",
              )
            : "Never"}
        </p>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="gap-2 bg-primary hover:bg-primary/90 shadow-saffron"
          data-ocid="profile.save_button"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Profile
        </Button>
      </div>
    </div>
  );
}
