import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Download,
  FileDown,
  FileText,
  Globe,
  Handshake,
  Loader2,
  Package,
  Save,
  Search,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { DocumentRecord, DocumentTemplate } from "../backend.d";
import { Category } from "../backend.d";
import {
  useCreateDocumentRecord,
  useDocumentRecords,
  useTemplates,
} from "../hooks/useDocuments";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useProfile } from "../hooks/useProfile";
import {
  generateDocumentContent,
  printDocument,
} from "../utils/print/printDocument";

type FieldDef = {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "date" | "select";
  required?: boolean;
  options?: string[];
};

const categoryInfo = {
  [Category.trade]: {
    label: "Trade",
    icon: Package,
    color: "bg-chart-1/10 text-chart-1 border-chart-1/20",
    barColor: "oklch(0.65 0.18 44)", // saffron
    textColor: "text-chart-1",
  },
  [Category.export_]: {
    label: "Export",
    icon: Globe,
    color: "bg-chart-2/10 text-chart-2 border-chart-2/20",
    barColor: "oklch(0.55 0.15 250)", // blue
    textColor: "text-chart-2",
  },
  [Category.agreement]: {
    label: "Agreement",
    icon: Handshake,
    color: "bg-chart-3/10 text-chart-3 border-chart-3/20",
    barColor: "oklch(0.62 0.17 145)", // green
    textColor: "text-chart-3",
  },
};

function parseFields(fieldsJson: string): FieldDef[] {
  try {
    const parsed = JSON.parse(fieldsJson);
    if (Array.isArray(parsed)) return parsed as FieldDef[];
  } catch {
    // ignore
  }
  return [
    { key: "buyerName", label: "Buyer Name", type: "text", required: true },
    { key: "address", label: "Address", type: "textarea", required: false },
    {
      key: "description",
      label: "Description",
      type: "textarea",
      required: false,
    },
    { key: "amount", label: "Amount", type: "number", required: false },
    { key: "notes", label: "Notes", type: "textarea", required: false },
  ];
}

interface DocumentFormProps {
  template: DocumentTemplate;
  onClose: () => void;
  profile: ReturnType<typeof useProfile>["profile"];
}

function DocumentForm({ template, onClose, profile }: DocumentFormProps) {
  const identity = useInternetIdentity();
  const fields = parseFields(template.fields);
  const createRecord = useCreateDocumentRecord();
  const catInfo = categoryInfo[template.category];

  // Pre-fill from profile
  const initialValues: Record<string, string> = {};
  for (const f of fields) {
    if (
      f.key === "sellerName" ||
      f.key === "principalName" ||
      f.key === "facilityProviderName"
    ) {
      initialValues[f.key] = profile?.businessName ?? "";
    } else if (
      f.key === "sellerAddress" ||
      f.key === "facilityProviderAddress"
    ) {
      initialValues[f.key] = profile?.address ?? "";
    }
  }

  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [isSaving, setIsSaving] = useState(false);

  const update = (key: string, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleDownload = () => {
    const content = generateDocumentContent(values, template.name);
    printDocument({
      title: template.name,
      businessName: profile?.businessName ?? "Your Business",
      address: profile?.address,
      phone: profile?.phone,
      email: profile?.email,
      gstin: profile?.gstin,
      authorizedSignatory: profile?.authorizedSignatory,
      signatoryDesignation: profile?.signatoryDesignation,
      content,
    });
    toast.success("Document opened for printing/download");
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const principal = identity.identity?.getPrincipal();
      if (!principal) throw new Error("Not authenticated");
      const now = BigInt(Date.now()) * BigInt(1_000_000);
      const record: DocumentRecord = {
        id: crypto.randomUUID(),
        templateId: template.id,
        templateName: template.name,
        category: template.category,
        categoryText: catInfo?.label ?? template.category,
        userId: principal,
        fieldValues: JSON.stringify(values),
        createdAt: now,
      };
      await createRecord.mutateAsync(record);
      toast.success("Document saved to history");
      onClose();
    } catch {
      toast.error("Failed to save document");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header — category color accent top bar */}
      <div
        className="h-1 w-full shrink-0"
        style={{ background: catInfo?.barColor ?? "oklch(0.65 0.18 44)" }}
      />
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${catInfo?.color ?? ""}`}
          >
            {catInfo && <catInfo.icon className="h-4 w-4" />}
          </div>
          <div>
            <h2 className="font-display font-bold text-foreground leading-tight">
              {template.name}
            </h2>
            <p className="text-xs text-muted-foreground">
              {catInfo?.label} Document
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-5 space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {template.description}
          </p>

          {/* Auto-filled notice */}
          {profile?.businessName && (
            <div className="flex items-center gap-2 bg-success/8 border border-success/20 rounded-lg px-3.5 py-2.5">
              <div className="w-5 h-5 rounded-full bg-success/15 flex items-center justify-center shrink-0">
                <svg
                  className="h-3 w-3 text-success"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="text-xs text-success font-medium">
                Company fields pre-filled from your business profile
              </p>
            </div>
          )}

          <div className="space-y-3.5">
            {fields.map((field) => (
              <div key={field.key} className="space-y-1.5">
                <Label htmlFor={field.key} className="text-sm font-medium">
                  {field.label}
                  {field.required && (
                    <span className="text-destructive ml-1">*</span>
                  )}
                </Label>
                {field.type === "textarea" ? (
                  <Textarea
                    id={field.key}
                    value={values[field.key] ?? ""}
                    onChange={(e) => update(field.key, e.target.value)}
                    rows={3}
                    className="resize-none text-sm"
                    data-ocid="docs.form.input"
                  />
                ) : field.type === "select" ? (
                  <Select
                    value={values[field.key] ?? ""}
                    onValueChange={(v) => update(field.key, v)}
                  >
                    <SelectTrigger
                      className="text-sm"
                      data-ocid="docs.form.select"
                    >
                      <SelectValue placeholder={`Select ${field.label}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {(field.options ?? []).map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={field.key}
                    type={field.type}
                    value={values[field.key] ?? ""}
                    onChange={(e) => update(field.key, e.target.value)}
                    className="text-sm"
                    data-ocid="docs.form.input"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>

      {/* Actions */}
      <div className="flex items-center gap-3 p-4 border-t border-border shrink-0 bg-muted/30">
        <Button
          variant="outline"
          onClick={handleDownload}
          className="gap-2 flex-1"
          data-ocid="docs.form.download_button"
        >
          <Download className="h-4 w-4" /> Download PDF
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="gap-2 flex-1 shadow-saffron"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.62 0.18 44) 0%, oklch(0.58 0.2 38) 100%)",
            color: "white",
          }}
          data-ocid="docs.form.submit_button"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save to History
        </Button>
      </div>
    </div>
  );
}

export default function DocumentsPage() {
  const { data: templates, isLoading } = useTemplates();
  const { data: docRecords, isLoading: historyLoading } = useDocumentRecords(
    0,
    20,
  );
  const { profile } = useProfile();
  const [selectedTemplate, setSelectedTemplate] =
    useState<DocumentTemplate | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | Category>("all");

  const filtered = useMemo(() => {
    if (!templates) return [];
    return templates.filter((t) => {
      const matchesCategory = activeTab === "all" || t.category === activeTab;
      const matchesSearch =
        !search ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch && t.isActive;
    });
  }, [templates, activeTab, search]);

  // Count per category for filter labels
  const counts = useMemo(() => {
    if (!templates) return { all: 0, trade: 0, export: 0, agreement: 0 };
    const active = templates.filter((t) => t.isActive);
    return {
      all: active.length,
      trade: active.filter((t) => t.category === Category.trade).length,
      export: active.filter((t) => t.category === Category.export_).length,
      agreement: active.filter((t) => t.category === Category.agreement).length,
    };
  }, [templates]);

  const filterOptions = [
    { key: "all" as const, label: "All Templates", count: counts.all },
    { key: Category.trade, label: "Trade", count: counts.trade },
    { key: Category.export_, label: "Export", count: counts.export },
    { key: Category.agreement, label: "Agreement", count: counts.agreement },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Document Generator
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Professional documents with your company details auto-filled
          </p>
        </div>
      </div>

      <Tabs defaultValue="templates" className="space-y-5">
        <TabsList className="bg-muted h-10">
          <TabsTrigger value="templates" className="gap-2">
            <FileText className="h-4 w-4" /> Templates
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <FileDown className="h-4 w-4" /> My Documents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-5 mt-0">
          {/* Search + category filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10"
                data-ocid="docs.search_input"
              />
            </div>
            {/* Category filter pills */}
            <div className="flex gap-1.5 flex-wrap">
              {filterOptions.map((opt) => {
                const isActive = activeTab === opt.key;
                const catInfo =
                  opt.key !== "all" ? categoryInfo[opt.key] : null;
                return (
                  <button
                    type="button"
                    key={opt.key}
                    data-ocid="docs.category.tab"
                    onClick={() => setActiveTab(opt.key)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border h-10",
                      isActive
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-card text-foreground border-border hover:border-primary/40 hover:bg-primary/5",
                    )}
                  >
                    {catInfo && (
                      <catInfo.icon
                        className={cn(
                          "h-3.5 w-3.5",
                          isActive
                            ? "text-primary-foreground"
                            : catInfo.textColor,
                        )}
                      />
                    )}
                    {opt.label}
                    <span
                      className={cn(
                        "text-xs px-1.5 py-0.5 rounded-full font-semibold",
                        isActive
                          ? "bg-white/20 text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {opt.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Template Grid */}
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-40 rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-25" />
              <p className="font-medium">No templates found</p>
              <p className="text-sm mt-1 opacity-70">
                Try a different search or category
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((template, idx) => {
                const catInfo = categoryInfo[template.category];
                const Icon = catInfo?.icon ?? FileText;
                return (
                  <Card
                    key={template.id}
                    data-ocid={`docs.template.item.${idx + 1}`}
                    className="cursor-pointer group hover:shadow-md transition-all duration-200 overflow-hidden border-border hover:border-primary/25"
                    onClick={() => setSelectedTemplate(template)}
                    style={{
                      borderLeft: catInfo
                        ? `3px solid ${catInfo.barColor}`
                        : undefined,
                    }}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${catInfo?.color ?? ""}`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-xs ${catInfo?.color ?? ""}`}
                        >
                          {catInfo?.label ?? template.category}
                        </Badge>
                      </div>
                      <h3 className="font-display font-semibold text-sm text-foreground mb-1.5 leading-snug">
                        {template.name}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {template.description}
                      </p>
                      {/* Always-visible CTA — 60% opacity at rest, 100% on hover */}
                      <div
                        className="flex items-center gap-1 mt-3.5 text-xs font-semibold opacity-60 group-hover:opacity-100 transition-opacity"
                        style={{
                          color: catInfo?.barColor ?? "oklch(0.65 0.18 44)",
                        }}
                      >
                        Create document
                        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-0">
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base">
                Document History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {historyLoading ? (
                <div className="p-6 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : !docRecords || docRecords.length === 0 ? (
                <div
                  data-ocid="docs.history.empty_state"
                  className="text-center py-12"
                >
                  <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
                    <FileDown className="h-5 w-5 text-muted-foreground/60" />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    No saved documents yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Documents you generate and save will appear here
                  </p>
                </div>
              ) : (
                <div
                  data-ocid="docs.history.table"
                  className="divide-y divide-border"
                >
                  {docRecords.map((doc, idx) => {
                    const catInfo = categoryInfo[doc.category];
                    return (
                      <div
                        key={doc.id}
                        data-ocid={`docs.history.item.${idx + 1}`}
                        className="flex items-center gap-4 px-6 py-3.5 hover:bg-muted/30 transition-colors"
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${catInfo?.color ?? "bg-muted"}`}
                        >
                          <FileText className="h-4 w-4" />
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
                          className={`text-xs ${catInfo?.color ?? ""}`}
                        >
                          {catInfo?.label ?? doc.categoryText}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const values = JSON.parse(
                              doc.fieldValues || "{}",
                            ) as Record<string, string>;
                            const content = generateDocumentContent(
                              values,
                              doc.templateName,
                            );
                            printDocument({
                              title: doc.templateName,
                              businessName:
                                profile?.businessName ?? "Your Business",
                              address: profile?.address,
                              phone: profile?.phone,
                              email: profile?.email,
                              gstin: profile?.gstin,
                              authorizedSignatory: profile?.authorizedSignatory,
                              signatoryDesignation:
                                profile?.signatoryDesignation,
                              content,
                            });
                          }}
                          className="gap-1 text-primary hover:text-primary shrink-0"
                        >
                          <Download className="h-3.5 w-3.5" /> PDF
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Document Form Dialog */}
      <Dialog
        open={!!selectedTemplate}
        onOpenChange={(open) => !open && setSelectedTemplate(null)}
      >
        <DialogContent className="max-w-2xl h-[90vh] p-0 flex flex-col gap-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>
              {selectedTemplate?.name ?? "Document Form"}
            </DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <DocumentForm
              template={selectedTemplate}
              profile={profile}
              onClose={() => setSelectedTemplate(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
