import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Award,
  BarChart3,
  CheckCircle,
  FileText,
  Loader2,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type {
  DocumentTemplate,
  GovernmentScheme,
  UsageStats,
  UserProfileSummary,
} from "../backend.d";
import { Category } from "../backend.d";
import { useActor } from "../hooks/useActor";

export default function AdminPage() {
  const { actor, isFetching } = useActor();

  const { data: isAdmin, isLoading: checkingAdmin } = useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });

  if (checkingAdmin) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="font-display text-xl font-bold text-foreground">
          Access Denied
        </h2>
        <p className="text-muted-foreground text-sm text-center max-w-sm">
          You don&apos;t have admin privileges to access this section.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" /> Admin Dashboard
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Manage users, templates, schemes and view analytics
        </p>
      </div>

      <Tabs defaultValue="analytics">
        <TabsList className="bg-muted h-10">
          <TabsTrigger
            value="analytics"
            data-ocid="admin.analytics.tab"
            className="gap-2"
          >
            <BarChart3 className="h-3.5 w-3.5" /> Analytics
          </TabsTrigger>
          <TabsTrigger
            value="users"
            data-ocid="admin.users.tab"
            className="gap-2"
          >
            <Users className="h-3.5 w-3.5" /> Users
          </TabsTrigger>
          <TabsTrigger
            value="templates"
            data-ocid="admin.templates.tab"
            className="gap-2"
          >
            <FileText className="h-3.5 w-3.5" /> Templates
          </TabsTrigger>
          <TabsTrigger
            value="schemes"
            data-ocid="admin.schemes.tab"
            className="gap-2"
          >
            <Award className="h-3.5 w-3.5" /> Schemes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="mt-4">
          <AnalyticsTab />
        </TabsContent>
        <TabsContent value="users" className="mt-4">
          <UsersTab />
        </TabsContent>
        <TabsContent value="templates" className="mt-4">
          <TemplatesTab />
        </TabsContent>
        <TabsContent value="schemes" className="mt-4">
          <SchemesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ---- Analytics Tab ----
function AnalyticsTab() {
  const { actor, isFetching } = useActor();

  const { data: stats, isLoading } = useQuery<UsageStats>({
    queryKey: ["usageStats"],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getUsageStats();
    },
    enabled: !!actor && !isFetching,
  });

  if (isLoading) {
    return (
      <div className="grid sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  const topTemplates = stats?.topTemplates ?? [];
  const maxCount =
    topTemplates.reduce(
      (max, [, count]) => (Number(count) > max ? Number(count) : max),
      0,
    ) || 1;

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground font-medium">
              Total Active Users
            </p>
            <p className="font-display text-3xl font-bold text-foreground mt-1">
              {stats ? String(stats.totalActiveUsers) : "—"}
            </p>
            <div className="flex items-center gap-1 mt-2">
              <Users className="h-3.5 w-3.5 text-chart-2" />
              <span className="text-xs text-muted-foreground">
                Registered users
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground font-medium">
              Documents Generated
            </p>
            <p className="font-display text-3xl font-bold text-foreground mt-1">
              {stats
                ? stats.documentsPerDay.reduce(
                    (sum, [, count]) => sum + Number(count),
                    0,
                  )
                : "—"}
            </p>
            <div className="flex items-center gap-1 mt-2">
              <FileText className="h-3.5 w-3.5 text-chart-1" />
              <span className="text-xs text-muted-foreground">
                Total across all users
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Templates */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base">
            Top Document Templates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {topTemplates.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No data yet
            </p>
          ) : (
            topTemplates.map(([name, count]) => (
              <div key={name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground truncate">
                    {name}
                  </span>
                  <span className="text-muted-foreground shrink-0 ml-2">
                    {String(count)} uses
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${(Number(count) / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Documents per day */}
      {stats && stats.documentsPerDay.length > 0 && (
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base">
              Documents Per Day
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1 h-32">
              {stats.documentsPerDay.slice(-14).map(([day, count]) => {
                const maxDay = Math.max(
                  ...stats.documentsPerDay.map(([, c]) => Number(c)),
                  1,
                );
                const heightPct = (Number(count) / maxDay) * 100;
                return (
                  <div
                    key={String(day)}
                    className="flex-1 flex flex-col items-center gap-1 group"
                  >
                    <div
                      className="w-full bg-primary/70 rounded-t group-hover:bg-primary transition-colors"
                      style={{ height: `${heightPct}%`, minHeight: "4px" }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {String(count)}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ---- Users Tab ----
function UsersTab() {
  const { actor, isFetching } = useActor();

  const { data: users, isLoading } = useQuery<UserProfileSummary[]>({
    queryKey: ["adminUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAllUsers();
    },
    enabled: !!actor && !isFetching,
  });

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-base">
          All Users ({users?.length ?? 0})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : !users || users.length === 0 ? (
          <div className="text-center py-10">
            <Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Principal ID</TableHead>
                  <TableHead>Business Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Profile Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u, idx) => {
                  const principalStr = u.principal.toString();
                  const shortId = `${principalStr.slice(0, 10)}...${principalStr.slice(-5)}`;
                  return (
                    <TableRow
                      key={principalStr}
                      data-ocid={`admin.user.item.${idx + 1}`}
                      className="hover:bg-muted/30"
                    >
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {shortId}
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {u.businessName || "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {u.email || "—"}
                      </TableCell>
                      <TableCell>
                        {u.profileComplete ? (
                          <Badge className="bg-success/10 text-success border-success/20 gap-1 text-xs">
                            <CheckCircle className="h-3 w-3" /> Complete
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="gap-1 border-warning/40 text-xs"
                          >
                            <AlertTriangle className="h-3 w-3" /> Incomplete
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---- Templates Tab ----
function TemplatesTab() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DocumentTemplate | null>(null);
  const [form, setForm] = useState<Partial<DocumentTemplate>>({});
  const [deleting, setDeleting] = useState<string | null>(null);

  const { data: templates, isLoading } = useQuery<DocumentTemplate[]>({
    queryKey: ["templates"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTemplates();
    },
    enabled: !!actor && !isFetching,
  });

  const createMutation = useMutation({
    mutationFn: async (t: DocumentTemplate) => {
      if (!actor) throw new Error();
      await actor.createTemplate(t);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["templates"] });
      toast.success("Template created");
    },
    onError: () => toast.error("Failed to create template"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      template,
    }: { id: string; template: DocumentTemplate }) => {
      if (!actor) throw new Error();
      await actor.updateTemplate(id, template);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["templates"] });
      toast.success("Template updated");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error();
      await actor.deleteTemplate(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["templates"] });
      toast.success("Deleted");
      setDeleting(null);
    },
  });

  const openAdd = () => {
    setEditing(null);
    setForm({
      name: "",
      category: Category.trade,
      description: "",
      fields: "[]",
      isActive: true,
    });
    setOpen(true);
  };

  const openEdit = (t: DocumentTemplate) => {
    setEditing(t);
    setForm({ ...t });
    setOpen(true);
  };

  const handleSave = async () => {
    const now = BigInt(Date.now()) * BigInt(1_000_000);
    const template: DocumentTemplate = {
      id: editing?.id ?? crypto.randomUUID(),
      name: form.name ?? "",
      category: form.category ?? Category.trade,
      description: form.description ?? "",
      fields: form.fields ?? "[]",
      isActive: form.isActive ?? true,
      createdAt: editing?.createdAt ?? now,
      updatedAt: now,
    };
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, template });
    } else {
      await createMutation.mutateAsync(template);
    }
    setOpen(false);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const categoryLabels: Record<string, string> = {
    [Category.trade]: "Trade",
    [Category.export_]: "Export",
    [Category.agreement]: "Agreement",
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={openAdd}
          className="gap-2 bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Add Template
        </Button>
      </div>
      <Card className="shadow-card">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(templates ?? []).map((t, idx) => (
                    <TableRow
                      key={t.id}
                      data-ocid={`admin.template.item.${idx + 1}`}
                      className="hover:bg-muted/30"
                    >
                      <TableCell className="font-medium text-sm">
                        {t.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {categoryLabels[t.category] ?? t.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                        {t.description}
                      </TableCell>
                      <TableCell>
                        {t.isActive ? (
                          <Badge className="bg-success/10 text-success border-success/20 text-xs">
                            Active
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-xs text-muted-foreground"
                          >
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => openEdit(t)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => setDeleting(t.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editing ? "Edit" : "Add"} Template
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Template Name *</Label>
              <Input
                value={form.name ?? ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Proforma Invoice"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={form.category ?? Category.trade}
                onValueChange={(v) =>
                  setForm({ ...form, category: v as Category })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Category.trade}>Trade</SelectItem>
                  <SelectItem value={Category.export_}>Export</SelectItem>
                  <SelectItem value={Category.agreement}>Agreement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={form.description ?? ""}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={2}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Fields JSON</Label>
              <Textarea
                value={form.fields ?? "[]"}
                onChange={(e) => setForm({ ...form, fields: e.target.value })}
                rows={6}
                className="font-mono text-xs"
                placeholder='[{"key":"buyerName","label":"Buyer Name","type":"text","required":true}]'
              />
              <p className="text-xs text-muted-foreground">
                JSON array of field definitions with key, label, type
                (text/textarea/number/date/select), required, options (for
                select)
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="isActive"
                checked={form.isActive ?? true}
                onCheckedChange={(v) => setForm({ ...form, isActive: v })}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isPending || !form.name}
              className="bg-primary hover:bg-primary/90"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}{" "}
              {editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Delete Template?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will remove the template from all users.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleting && deleteMutation.mutate(deleting)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}{" "}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---- Schemes Tab ----
function SchemesTab() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<GovernmentScheme | null>(null);
  const [form, setForm] = useState<
    Partial<GovernmentScheme & { checklistInput: string }>
  >({});
  const [deleting, setDeleting] = useState<string | null>(null);

  const { data: schemes, isLoading } = useQuery<GovernmentScheme[]>({
    queryKey: ["schemes"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSchemes();
    },
    enabled: !!actor && !isFetching,
  });

  const createMutation = useMutation({
    mutationFn: async (s: GovernmentScheme) => {
      if (!actor) throw new Error();
      await actor.createGovernmentScheme(s);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["schemes"] });
      toast.success("Scheme created");
    },
    onError: () => toast.error("Failed to create scheme"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      scheme,
    }: { id: string; scheme: GovernmentScheme }) => {
      if (!actor) throw new Error();
      await actor.updateGovernmentScheme(id, scheme);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["schemes"] });
      toast.success("Scheme updated");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error();
      await actor.deleteGovernmentScheme(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["schemes"] });
      toast.success("Deleted");
      setDeleting(null);
    },
  });

  const openAdd = () => {
    setEditing(null);
    setForm({
      name: "",
      description: "",
      ministryName: "",
      eligibilityCriteria: "",
      benefits: "",
      documentChecklist: [],
      checklistInput: "",
      applicationLink: "",
      isActive: true,
    });
    setOpen(true);
  };

  const openEdit = (s: GovernmentScheme) => {
    setEditing(s);
    setForm({ ...s, checklistInput: s.documentChecklist.join("\n") });
    setOpen(true);
  };

  const handleSave = async () => {
    const scheme: GovernmentScheme = {
      id: editing?.id ?? crypto.randomUUID(),
      name: form.name ?? "",
      description: form.description ?? "",
      ministryName: form.ministryName ?? "",
      eligibilityCriteria: form.eligibilityCriteria ?? "",
      benefits: form.benefits ?? "",
      documentChecklist: (form.checklistInput ?? "")
        .split("\n")
        .filter(Boolean),
      applicationLink: form.applicationLink ?? "",
      isActive: form.isActive ?? true,
    };
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, scheme });
    } else {
      await createMutation.mutateAsync(scheme);
    }
    setOpen(false);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={openAdd}
          className="gap-2 bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Add Scheme
        </Button>
      </div>
      <Card className="shadow-card">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Scheme Name</TableHead>
                    <TableHead>Ministry</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(schemes ?? []).map((s, idx) => (
                    <TableRow
                      key={s.id}
                      data-ocid={`admin.scheme.item.${idx + 1}`}
                      className="hover:bg-muted/30"
                    >
                      <TableCell className="font-medium text-sm">
                        {s.name}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[180px] truncate">
                        {s.ministryName}
                      </TableCell>
                      <TableCell>
                        {s.isActive ? (
                          <Badge className="bg-success/10 text-success border-success/20 text-xs">
                            Active
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-xs text-muted-foreground"
                          >
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {s.documentChecklist.length} docs
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => openEdit(s)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => setDeleting(s.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editing ? "Edit" : "Add"} Government Scheme
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Scheme Name *</Label>
              <Input
                value={form.name ?? ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. PM Mudra Loan"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Ministry</Label>
              <Input
                value={form.ministryName ?? ""}
                onChange={(e) =>
                  setForm({ ...form, ministryName: e.target.value })
                }
                placeholder="Ministry of Finance"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={form.description ?? ""}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={2}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Benefits</Label>
              <Textarea
                value={form.benefits ?? ""}
                onChange={(e) => setForm({ ...form, benefits: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Eligibility Criteria</Label>
              <Textarea
                value={form.eligibilityCriteria ?? ""}
                onChange={(e) =>
                  setForm({ ...form, eligibilityCriteria: e.target.value })
                }
                rows={2}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Document Checklist (one per line)</Label>
              <Textarea
                value={form.checklistInput ?? ""}
                onChange={(e) =>
                  setForm({ ...form, checklistInput: e.target.value })
                }
                rows={4}
                placeholder="Aadhaar Card&#10;PAN Card&#10;Business Proof"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Application Link</Label>
              <Input
                type="url"
                value={form.applicationLink ?? ""}
                onChange={(e) =>
                  setForm({ ...form, applicationLink: e.target.value })
                }
                placeholder="https://..."
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="schemeActive"
                checked={form.isActive ?? true}
                onCheckedChange={(v) => setForm({ ...form, isActive: v })}
              />
              <Label htmlFor="schemeActive">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isPending || !form.name}
              className="bg-primary hover:bg-primary/90"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}{" "}
              {editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Delete Scheme?</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleting && deleteMutation.mutate(deleting)}
              disabled={deleteMutation.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
