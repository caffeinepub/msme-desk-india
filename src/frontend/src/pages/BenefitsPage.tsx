import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import {
  Award,
  Building,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { GovernmentScheme } from "../backend.d";
import { useActor } from "../hooks/useActor";

const questionnaireSteps = [
  {
    key: "industry",
    label: "Industry Type",
    options: [
      "Manufacturing",
      "Trading",
      "Services",
      "Agriculture",
      "Technology",
      "Other",
    ],
  },
  {
    key: "annualTurnover",
    label: "Annual Turnover",
    options: [
      "Under ₹5 Lakhs",
      "₹5L – ₹50L",
      "₹50L – ₹2Crore",
      "₹2Cr – ₹10Crore",
      "Above ₹10 Crore",
    ],
  },
  {
    key: "businessAge",
    label: "Business Age",
    options: ["Less than 1 year", "1 – 3 years", "3 – 5 years", "5+ years"],
  },
  {
    key: "startupRegistration",
    label: "Are you registered as a Startup?",
    options: ["Yes", "No"],
  },
  {
    key: "exportActivity",
    label: "Do you engage in export activities?",
    options: ["Yes", "No"],
  },
  {
    key: "loanRequirements",
    label: "Loan Requirement",
    options: [
      "No Loan Required",
      "Under ₹10 Lakhs",
      "₹10L – ₹50L",
      "₹50L – ₹2Crore",
      "Above ₹2 Crore",
    ],
  },
];

const DEFAULT_SCHEMES: GovernmentScheme[] = [
  {
    id: "startup-india",
    name: "Startup India",
    description:
      "Government initiative to build a strong ecosystem for nurturing innovation and startups in India",
    ministryName: "Ministry of Commerce and Industry",
    eligibilityCriteria:
      "Startup registered with DPIIT, annual turnover < ₹100 crore",
    benefits:
      "Tax exemptions for 3 years, fast-track patent examination, fund of funds support, self-certification compliance",
    documentChecklist: [
      "DPIIT Recognition Certificate",
      "Business Plan",
      "Financial Statements",
      "PAN Card",
      "GST Registration",
    ],
    applicationLink: "https://www.startupindia.gov.in",
    isActive: true,
  },
  {
    id: "mudra-loan",
    name: "PM Mudra Loan (PMMY)",
    description:
      "Micro Units Development and Refinance Agency loans for non-farm micro enterprises",
    ministryName: "Ministry of Finance",
    eligibilityCriteria:
      "Non-farm income generating micro/small enterprises, loan up to ₹10 lakh",
    benefits:
      "Collateral-free loans: Shishu (up to ₹50K), Kishore (₹50K-₹5L), Tarun (₹5L-₹10L)",
    documentChecklist: [
      "Aadhaar Card",
      "PAN Card",
      "Business Proof",
      "Bank Statement (6 months)",
      "Quotation for equipment",
    ],
    applicationLink: "https://www.mudra.org.in",
    isActive: true,
  },
  {
    id: "cgtmse",
    name: "CGTMSE Credit Guarantee Scheme",
    description:
      "Credit guarantee for MSMEs to help them secure collateral-free loans from banks",
    ministryName: "Ministry of MSME",
    eligibilityCriteria:
      "MSME units with Udyam registration, new/existing enterprises",
    benefits:
      "Guarantee cover up to 85% of loan amount, collateral-free working capital and term loans",
    documentChecklist: [
      "Udyam Certificate",
      "Business Plan",
      "Financial Statements",
      "Bank Loan Application",
      "KYC Documents",
    ],
    applicationLink: "https://www.cgtmse.in",
    isActive: true,
  },
  {
    id: "pmegp",
    name: "PMEGP (PM Employment Generation Programme)",
    description:
      "Credit-linked subsidy scheme for generating employment through micro enterprises",
    ministryName: "Ministry of MSME (KVIC)",
    eligibilityCriteria:
      "Any individual above 18 years, VIII class pass for manufacturing > ₹10L; SHG, Charitable trusts",
    benefits:
      "15-35% subsidy on project cost, loan amount: manufacturing up to ₹50L, service up to ₹20L",
    documentChecklist: [
      "Aadhaar Card",
      "Education Certificate",
      "Project Report",
      "Caste Certificate",
      "EDP Training Certificate",
    ],
    applicationLink: "https://www.kviconline.gov.in/pmegpeportal",
    isActive: true,
  },
  {
    id: "msme-subsidy",
    name: "MSME Subsidy — Technology Upgradation",
    description:
      "Financial support for MSMEs to upgrade technology and reduce energy consumption",
    ministryName: "Ministry of MSME",
    eligibilityCriteria: "Registered MSMEs with Udyam registration",
    benefits:
      "15% subsidy on capital investment for technology upgradation, up to ₹15 lakh per unit",
    documentChecklist: [
      "Udyam Certificate",
      "GST Registration",
      "Quotation from suppliers",
      "Bank loan sanction letter",
      "Audited financials",
    ],
    applicationLink: "https://msme.gov.in",
    isActive: true,
  },
  {
    id: "export-incentive",
    name: "Export Promotion & Incentives",
    description:
      "Various export promotion schemes including RoDTEP, MEIS, and Export Credit",
    ministryName: "Ministry of Commerce (DGFT)",
    eligibilityCriteria: "Exporters with IEC code, MSME or large enterprises",
    benefits:
      "Duty drawback, RoDTEP credits, ECGC export credit insurance, TIES scheme support",
    documentChecklist: [
      "IEC Certificate",
      "GST Registration",
      "Shipping Bills",
      "Bank Realization Certificate",
      "Export invoices",
    ],
    applicationLink: "https://www.dgft.gov.in",
    isActive: true,
  },
];

interface SchemeCardProps {
  scheme: GovernmentScheme;
  index: number;
}

function SchemeCard({ scheme, index }: SchemeCardProps) {
  const [expanded, setExpanded] = useState(false);

  const handleDownload = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    const checklist = scheme.documentChecklist
      .map((d, i) => `<li>${i + 1}. ${d}</li>`)
      .join("");
    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>${scheme.name} — Scheme Summary</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; color: #1a1a2e; }
    h1 { color: #E87722; border-bottom: 3px solid #E87722; padding-bottom: 10px; }
    h2 { color: #1a1a2e; font-size: 16px; margin-top: 20px; }
    .ministry { color: #666; font-size: 14px; margin-top: 5px; }
    ul { padding-left: 20px; line-height: 2; }
    .section { background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 15px 0; }
    @media print { body { margin: 20px; } }
  </style>
</head>
<body>
  <h1>${scheme.name}</h1>
  <p class="ministry">Ministry: ${scheme.ministryName}</p>
  <div class="section"><h2>Description</h2><p>${scheme.description}</p></div>
  <div class="section"><h2>Benefits</h2><p>${scheme.benefits}</p></div>
  <div class="section"><h2>Eligibility Criteria</h2><p>${scheme.eligibilityCriteria}</p></div>
  <div class="section"><h2>Required Documents</h2><ul>${checklist}</ul></div>
  <div class="section"><h2>Apply Online</h2><p><a href="${scheme.applicationLink}">${scheme.applicationLink}</a></p></div>
  <script>window.onload = function() { window.print(); setTimeout(function(){window.close();},1500); }</script>
</body>
</html>`);
    win.document.close();
  };

  return (
    <Card data-ocid={`benefits.scheme_card.${index}`} className="shadow-card">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-display font-bold text-foreground text-sm">
                {scheme.name}
              </h3>
              <Badge className="bg-success/10 text-success border-success/20 text-xs">
                Eligible
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Building className="h-3 w-3" /> {scheme.ministryName}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="gap-1 text-xs h-8"
              data-ocid="benefits.download_button"
            >
              <Download className="h-3.5 w-3.5" /> Save
            </Button>
            {scheme.applicationLink && (
              <Button
                size="sm"
                onClick={() => window.open(scheme.applicationLink, "_blank")}
                className="gap-1 text-xs h-8 bg-primary hover:bg-primary/90"
              >
                Apply <ExternalLink className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
          {scheme.description}
        </p>

        <div className="bg-success/5 border border-success/20 rounded-lg p-3 mb-3">
          <p className="text-xs font-semibold text-success mb-1 flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" /> Benefits
          </p>
          <p className="text-xs text-foreground/80">{scheme.benefits}</p>
        </div>

        {expanded && (
          <div className="space-y-3 animate-fade-in">
            <div className="bg-secondary/50 rounded-lg p-3">
              <p className="text-xs font-semibold text-foreground mb-1">
                Eligibility Criteria
              </p>
              <p className="text-xs text-muted-foreground">
                {scheme.eligibilityCriteria}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" /> Required Documents
              </p>
              <ul className="space-y-1">
                {scheme.documentChecklist.map((doc) => (
                  <li
                    key={doc}
                    className="flex items-center gap-2 text-xs text-muted-foreground"
                  >
                    <CheckCircle className="h-3 w-3 text-success shrink-0" />{" "}
                    {doc}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-primary font-medium flex items-center gap-1 mt-2 hover:underline"
        >
          {expanded ? "Show less" : "View checklist & details"}
          <ChevronRight
            className={cn(
              "h-3 w-3 transition-transform",
              expanded && "rotate-90",
            )}
          />
        </button>
      </CardContent>
    </Card>
  );
}

export default function BenefitsPage() {
  const { actor, isFetching } = useActor();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [eligibleIds, setEligibleIds] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  const { data: allSchemes, isLoading: schemesLoading } = useQuery<
    GovernmentScheme[]
  >({
    queryKey: ["schemes"],
    queryFn: async () => {
      if (!actor) return DEFAULT_SCHEMES;
      try {
        const schemes = await actor.getAllSchemes();
        return schemes.length > 0 ? schemes : DEFAULT_SCHEMES;
      } catch {
        return DEFAULT_SCHEMES;
      }
    },
    enabled: !!actor && !isFetching,
    placeholderData: DEFAULT_SCHEMES,
  });

  const currentQ = questionnaireSteps[currentStep];
  const progress = (currentStep / questionnaireSteps.length) * 100;
  const allAnswered = questionnaireSteps.every((q) => answers[q.key]);

  const handleAnswer = (key: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [key]: val }));
  };

  const handleNext = () => {
    if (currentStep < questionnaireSteps.length - 1)
      setCurrentStep((s) => s + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    setIsChecking(true);
    try {
      let ids: string[] = [];
      if (actor) {
        const result = await actor.checkSchemeEligibility(
          JSON.stringify(answers),
        );
        ids = result;
      }
      // If no specific IDs returned, show all active schemes as potentially eligible
      if (!ids.length) {
        ids = (allSchemes ?? DEFAULT_SCHEMES)
          .filter((s) => s.isActive)
          .map((s) => s.id);
      }
      setEligibleIds(ids);
      setSubmitted(true);
      toast.success("Eligibility check complete!");
    } catch {
      // Fallback — show all schemes
      const ids = (allSchemes ?? DEFAULT_SCHEMES)
        .filter((s) => s.isActive)
        .map((s) => s.id);
      setEligibleIds(ids);
      setSubmitted(true);
    } finally {
      setIsChecking(false);
    }
  };

  const eligibleSchemes = (allSchemes ?? DEFAULT_SCHEMES).filter(
    (s) =>
      s.isActive && (eligibleIds.includes(s.id) || eligibleIds.length === 0),
  );

  const handleReset = () => {
    setAnswers({});
    setCurrentStep(0);
    setSubmitted(false);
    setEligibleIds([]);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <Award className="h-6 w-6 text-primary" /> MSME Government Benefits
          Finder
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Answer a few questions to discover government schemes you&apos;re
          eligible for
        </p>
      </div>

      {!submitted ? (
        <Card className="shadow-card max-w-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="font-display text-base">
                Question {currentStep + 1} of {questionnaireSteps.length}
              </CardTitle>
              <span className="text-xs text-muted-foreground">
                {Math.round(progress)}% complete
              </span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </CardHeader>

          <CardContent
            data-ocid="benefits.questionnaire_form"
            className="space-y-6"
          >
            {/* All questions shown, current highlighted */}
            <div className="space-y-4">
              {questionnaireSteps.map((q, idx) => (
                <div
                  key={q.key}
                  className={cn(
                    "p-4 rounded-xl border transition-all",
                    idx === currentStep
                      ? "border-primary/40 bg-primary/5"
                      : idx < currentStep
                        ? "border-success/20 bg-success/5 opacity-80"
                        : "border-border opacity-50 pointer-events-none",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5",
                        idx < currentStep
                          ? "bg-success text-success-foreground"
                          : idx === currentStep
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      {idx < currentStep ? (
                        <CheckCircle className="h-3.5 w-3.5" />
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label className="text-sm font-semibold text-foreground">
                        {q.label}
                      </Label>
                      {idx <= currentStep && (
                        <Select
                          value={answers[q.key] ?? ""}
                          onValueChange={(v) => {
                            handleAnswer(q.key, v);
                            if (
                              idx === currentStep &&
                              currentStep < questionnaireSteps.length - 1
                            ) {
                              setTimeout(
                                () => setCurrentStep((s) => s + 1),
                                300,
                              );
                            }
                          }}
                        >
                          <SelectTrigger
                            className={cn(
                              idx === currentStep ? "border-primary" : "",
                            )}
                          >
                            <SelectValue
                              placeholder={`Select ${q.label.toLowerCase()}`}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {q.options.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {answers[q.key] && idx < currentStep && (
                        <p className="text-xs text-success font-medium">
                          {answers[q.key]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
              {currentStep < questionnaireSteps.length - 1 ? (
                <Button
                  onClick={handleNext}
                  disabled={!answers[currentQ.key]}
                  className="gap-2 bg-primary hover:bg-primary/90"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!allAnswered || isChecking}
                  className="gap-2 bg-primary hover:bg-primary/90 shadow-saffron"
                  data-ocid="benefits.submit_button"
                >
                  {isChecking ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Award className="h-4 w-4" />
                  )}
                  Check Eligibility
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">
                {eligibleSchemes.length} Schemes Found for You
              </h2>
              <p className="text-sm text-muted-foreground">
                Based on your business profile
              </p>
            </div>
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <RefreshCw className="h-4 w-4" /> Retake Quiz
            </Button>
          </div>

          {/* Answers summary */}
          <Card className="shadow-card">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Your Responses
              </p>
              <div className="flex flex-wrap gap-2">
                {questionnaireSteps.map((q) =>
                  answers[q.key] ? (
                    <div
                      key={q.key}
                      className="flex items-center gap-1.5 bg-secondary rounded-lg px-3 py-1.5"
                    >
                      <span className="text-xs text-muted-foreground">
                        {q.label}:
                      </span>
                      <span className="text-xs font-semibold text-foreground">
                        {answers[q.key]}
                      </span>
                    </div>
                  ) : null,
                )}
              </div>
            </CardContent>
          </Card>

          {schemesLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          ) : eligibleSchemes.length === 0 ? (
            <div className="text-center py-12">
              <Award className="h-12 w-12 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-muted-foreground">
                No specific schemes matched. Try adjusting your answers.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {eligibleSchemes.map((scheme, idx) => (
                <SchemeCard key={scheme.id} scheme={scheme} index={idx + 1} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
