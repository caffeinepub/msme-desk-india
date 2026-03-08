import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  CreditCard,
  Loader2,
  Package,
  Pencil,
  Plus,
  Ship,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Contact, Order, Payment, Shipment } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

// Status badge helper
function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase() ?? "";
  const cls =
    s === "completed" || s === "paid"
      ? "badge-completed text-xs"
      : s === "active" || s === "shipped" || s === "in_transit"
        ? "badge-active text-xs"
        : s === "overdue"
          ? "badge-overdue text-xs"
          : "badge-pending text-xs";
  return (
    <span className={`px-2 py-0.5 rounded-full font-medium capitalize ${cls}`}>
      {status}
    </span>
  );
}

function formatDate(ts: bigint): string {
  if (!ts || ts === BigInt(0)) return "—";
  const ms = Number(ts) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(n: number): string {
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// ---- Contacts Tab ----
function ContactsTab({
  contactType,
}: { contactType: "customer" | "supplier" }) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [form, setForm] = useState<Partial<Contact>>({});
  const [deleting, setDeleting] = useState<string | null>(null);

  const { data: contacts, isLoading } = useQuery<Contact[]>({
    queryKey: ["contacts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getContacts();
    },
    enabled: !!actor && !isFetching,
  });

  const filtered = contacts?.filter((c) => c.contactType === contactType) ?? [];

  const createMutation = useMutation({
    mutationFn: async (contact: Contact) => {
      if (!actor) throw new Error();
      await actor.createContact(contact);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Contact saved");
    },
    onError: () => toast.error("Failed to save contact"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, contact }: { id: string; contact: Contact }) => {
      if (!actor) throw new Error();
      await actor.updateContact(id, contact);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Contact updated");
    },
    onError: () => toast.error("Failed to update"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error();
      await actor.deleteContact(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Deleted");
      setDeleting(null);
    },
    onError: () => toast.error("Failed to delete"),
  });

  const openAdd = () => {
    setEditing(null);
    setForm({
      contactType,
      name: "",
      company: "",
      email: "",
      phone: "",
      gstin: "",
      category: "",
      notes: "",
    });
    setOpen(true);
  };

  const openEdit = (c: Contact) => {
    setEditing(c);
    setForm({ ...c });
    setOpen(true);
  };

  const handleSave = async () => {
    const principal = identity?.getPrincipal();
    if (!principal) {
      toast.error("Not authenticated");
      return;
    }
    const now = BigInt(Date.now()) * BigInt(1_000_000);
    const contact: Contact = {
      id: editing?.id ?? crypto.randomUUID(),
      contactType,
      userId: principal,
      name: form.name ?? "",
      company: form.company ?? "",
      email: form.email ?? "",
      phone: form.phone ?? "",
      gstin: form.gstin ?? "",
      category: form.category ?? "",
      notes: form.notes ?? "",
      createdAt: editing?.createdAt ?? now,
    };
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, contact });
    } else {
      await createMutation.mutateAsync(contact);
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
          data-ocid="crm.add_button"
        >
          <Plus className="h-4 w-4" /> Add{" "}
          {contactType === "customer" ? "Customer" : "Supplier"}
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
          ) : filtered.length === 0 ? (
            <div
              className="text-center py-10"
              data-ocid="crm.contacts.empty_state"
            >
              <Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No {contactType}s yet. Add one to get started.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table data-ocid="crm.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>GSTIN</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c, idx) => (
                    <TableRow
                      key={c.id}
                      data-ocid={`crm.row.item.${idx + 1}`}
                      className="hover:bg-muted/30"
                    >
                      <TableCell className="font-medium text-sm">
                        {c.name}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {c.company}
                      </TableCell>
                      <TableCell className="text-sm">{c.email}</TableCell>
                      <TableCell className="text-sm">{c.phone}</TableCell>
                      <TableCell className="text-xs font-mono">
                        {c.gstin || "—"}
                      </TableCell>
                      <TableCell>
                        {c.category ? (
                          <Badge variant="outline" className="text-xs">
                            {c.category}
                          </Badge>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => openEdit(c)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => setDeleting(c.id)}
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

      {/* Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editing ? "Edit" : "Add"}{" "}
              {contactType === "customer" ? "Customer" : "Supplier"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input
                value={form.name ?? ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Full name"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Company</Label>
              <Input
                value={form.company ?? ""}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="Company name"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email ?? ""}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input
                value={form.phone ?? ""}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 98765 43210"
              />
            </div>
            <div className="space-y-1.5">
              <Label>GSTIN</Label>
              <Input
                value={form.gstin ?? ""}
                onChange={(e) =>
                  setForm({ ...form, gstin: e.target.value.toUpperCase() })
                }
                placeholder="GSTIN number"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Input
                value={form.category ?? ""}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="e.g. Retail, Wholesale"
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Notes</Label>
              <Textarea
                value={form.notes ?? ""}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                placeholder="Additional notes..."
              />
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
              ) : null}
              {editing ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Delete Contact?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone.
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

// ---- Orders Tab ----
function OrdersTab() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);
  const [form, setForm] = useState<Partial<Order>>({});
  const [deleting, setDeleting] = useState<string | null>(null);

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOrders();
    },
    enabled: !!actor && !isFetching,
  });

  const { data: contacts } = useQuery<Contact[]>({
    queryKey: ["contacts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getContacts();
    },
    enabled: !!actor && !isFetching,
  });

  const createMutation = useMutation({
    mutationFn: async (o: Order) => {
      if (!actor) throw new Error();
      await actor.createOrder(o);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order saved");
    },
    onError: () => toast.error("Failed to save order"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, order }: { id: string; order: Order }) => {
      if (!actor) throw new Error();
      await actor.updateOrder(id, order);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order updated");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error();
      await actor.deleteOrder(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Deleted");
      setDeleting(null);
    },
  });

  const openAdd = () => {
    setEditing(null);
    setForm({
      orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
      status: "pending",
      items: "",
      totalAmount: 0,
      contactId: "",
    });
    setOpen(true);
  };

  const openEdit = (o: Order) => {
    setEditing(o);
    setForm({ ...o });
    setOpen(true);
  };

  const handleSave = async () => {
    const principal = identity?.getPrincipal();
    if (!principal) return;
    const now = BigInt(Date.now()) * BigInt(1_000_000);
    const order: Order = {
      id: editing?.id ?? crypto.randomUUID(),
      userId: principal,
      contactId: form.contactId ?? "",
      orderNumber: form.orderNumber ?? "",
      items: form.items ?? "",
      totalAmount: form.totalAmount ?? 0,
      status: form.status ?? "pending",
      orderDate: editing?.orderDate ?? now,
      deliveryDate: form.deliveryDate ?? BigInt(0),
    };
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, order });
    } else {
      await createMutation.mutateAsync(order);
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
          data-ocid="crm.add_button"
        >
          <Plus className="h-4 w-4" /> Add Order
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
          ) : !orders || orders.length === 0 ? (
            <div
              className="text-center py-10"
              data-ocid="crm.orders.empty_state"
            >
              <Package className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No orders yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table data-ocid="crm.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Order No.</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((o, idx) => {
                    const contact = contacts?.find((c) => c.id === o.contactId);
                    return (
                      <TableRow
                        key={o.id}
                        data-ocid={`crm.row.item.${idx + 1}`}
                        className="hover:bg-muted/30"
                      >
                        <TableCell className="font-mono text-xs font-semibold">
                          {o.orderNumber}
                        </TableCell>
                        <TableCell className="text-sm">
                          {contact?.name ?? (o.contactId || "—")}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[120px] truncate">
                          {o.items}
                        </TableCell>
                        <TableCell className="text-sm font-semibold">
                          ₹ {formatAmount(o.totalAmount)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={o.status} />
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(o.orderDate)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => openEdit(o)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => setDeleting(o.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editing ? "Edit" : "Add"} Order
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Order Number *</Label>
              <Input
                value={form.orderNumber ?? ""}
                onChange={(e) =>
                  setForm({ ...form, orderNumber: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Contact</Label>
              <Select
                value={form.contactId ?? ""}
                onValueChange={(v) => setForm({ ...form, contactId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select contact" />
                </SelectTrigger>
                <SelectContent>
                  {contacts?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} {c.company ? `(${c.company})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Items</Label>
              <Textarea
                value={form.items ?? ""}
                onChange={(e) => setForm({ ...form, items: e.target.value })}
                rows={2}
                placeholder="Description of items..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Total Amount (₹)</Label>
              <Input
                type="number"
                value={form.totalAmount ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    totalAmount: Number.parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.status ?? "pending"}
                onValueChange={(v) => setForm({ ...form, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "pending",
                    "confirmed",
                    "processing",
                    "shipped",
                    "completed",
                    "cancelled",
                  ].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}{" "}
              {editing ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Delete Order?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone.
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

// ---- Shipments Tab ----
function ShipmentsTab() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Shipment | null>(null);
  const [form, setForm] = useState<Partial<Shipment>>({});
  const [deleting, setDeleting] = useState<string | null>(null);

  const { data: shipments, isLoading } = useQuery<Shipment[]>({
    queryKey: ["shipments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getShipments();
    },
    enabled: !!actor && !isFetching,
  });

  const { data: orders } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOrders();
    },
    enabled: !!actor && !isFetching,
  });

  const createMutation = useMutation({
    mutationFn: async (s: Shipment) => {
      if (!actor) throw new Error();
      await actor.createShipment(s);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["shipments"] });
      toast.success("Shipment saved");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      shipment,
    }: { id: string; shipment: Shipment }) => {
      if (!actor) throw new Error();
      await actor.updateShipment(id, shipment);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["shipments"] });
      toast.success("Updated");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error();
      await actor.deleteShipment(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["shipments"] });
      toast.success("Deleted");
      setDeleting(null);
    },
  });

  const openAdd = () => {
    setEditing(null);
    setForm({
      carrier: "",
      trackingNumber: "",
      origin: "",
      destination: "",
      status: "pending",
      orderId: "",
    });
    setOpen(true);
  };

  const openEdit = (s: Shipment) => {
    setEditing(s);
    setForm({ ...s });
    setOpen(true);
  };

  const handleSave = async () => {
    const principal = identity?.getPrincipal();
    if (!principal) return;
    const now = BigInt(Date.now()) * BigInt(1_000_000);
    const ship: Shipment = {
      id: editing?.id ?? crypto.randomUUID(),
      userId: principal,
      carrier: form.carrier ?? "",
      trackingNumber: form.trackingNumber ?? "",
      origin: form.origin ?? "",
      destination: form.destination ?? "",
      status: form.status ?? "pending",
      orderId: form.orderId ?? "",
      dispatchDate: editing?.dispatchDate ?? now,
      deliveryDate: form.deliveryDate ?? BigInt(0),
    };
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, shipment: ship });
    } else {
      await createMutation.mutateAsync(ship);
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
          data-ocid="crm.add_button"
        >
          <Plus className="h-4 w-4" /> Add Shipment
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
          ) : !shipments || shipments.length === 0 ? (
            <div
              className="text-center py-10"
              data-ocid="crm.shipments.empty_state"
            >
              <Ship className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No shipments yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table data-ocid="crm.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Carrier</TableHead>
                    <TableHead>Tracking No.</TableHead>
                    <TableHead>Origin → Destination</TableHead>
                    <TableHead>Order Ref</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Dispatch</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shipments.map((s, idx) => {
                    const order = orders?.find((o) => o.id === s.orderId);
                    return (
                      <TableRow
                        key={s.id}
                        data-ocid={`crm.row.item.${idx + 1}`}
                        className="hover:bg-muted/30"
                      >
                        <TableCell className="font-medium text-sm">
                          {s.carrier}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {s.trackingNumber || "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {s.origin} → {s.destination}
                        </TableCell>
                        <TableCell className="text-xs">
                          {order?.orderNumber ?? (s.orderId || "—")}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={s.status} />
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(s.dispatchDate)}
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
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editing ? "Edit" : "Add"} Shipment
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Carrier *</Label>
              <Input
                value={form.carrier ?? ""}
                onChange={(e) => setForm({ ...form, carrier: e.target.value })}
                placeholder="e.g. FedEx, DHL"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Tracking Number</Label>
              <Input
                value={form.trackingNumber ?? ""}
                onChange={(e) =>
                  setForm({ ...form, trackingNumber: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Origin</Label>
              <Input
                value={form.origin ?? ""}
                onChange={(e) => setForm({ ...form, origin: e.target.value })}
                placeholder="Mumbai, India"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Destination</Label>
              <Input
                value={form.destination ?? ""}
                onChange={(e) =>
                  setForm({ ...form, destination: e.target.value })
                }
                placeholder="Dubai, UAE"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Linked Order</Label>
              <Select
                value={form.orderId ?? ""}
                onValueChange={(v) => setForm({ ...form, orderId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select order" />
                </SelectTrigger>
                <SelectContent>
                  {orders?.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.orderNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.status ?? "pending"}
                onValueChange={(v) => setForm({ ...form, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "pending",
                    "dispatched",
                    "in_transit",
                    "delivered",
                    "returned",
                  ].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}{" "}
              {editing ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Delete Shipment?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone.
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
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---- Payments Tab ----
function PaymentsTab() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Payment | null>(null);
  const [form, setForm] = useState<Partial<Payment>>({});
  const [deleting, setDeleting] = useState<string | null>(null);

  const { data: payments, isLoading } = useQuery<Payment[]>({
    queryKey: ["payments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPayments();
    },
    enabled: !!actor && !isFetching,
  });

  const { data: orders } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOrders();
    },
    enabled: !!actor && !isFetching,
  });

  const createMutation = useMutation({
    mutationFn: async (p: Payment) => {
      if (!actor) throw new Error();
      await actor.createPayment(p);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["payments"] });
      toast.success("Payment saved");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payment }: { id: string; payment: Payment }) => {
      if (!actor) throw new Error();
      await actor.updatePayment(id, payment);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["payments"] });
      toast.success("Updated");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error();
      await actor.deletePayment(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["payments"] });
      toast.success("Deleted");
      setDeleting(null);
    },
  });

  const openAdd = () => {
    setEditing(null);
    setForm({
      amount: 0,
      status: "pending",
      mode: "Bank Transfer",
      orderId: "",
      notes: "",
    });
    setOpen(true);
  };

  const openEdit = (p: Payment) => {
    setEditing(p);
    setForm({ ...p });
    setOpen(true);
  };

  const handleSave = async () => {
    const principal = identity?.getPrincipal();
    if (!principal) return;
    const now = BigInt(Date.now()) * BigInt(1_000_000);
    const payment: Payment = {
      id: editing?.id ?? crypto.randomUUID(),
      userId: principal,
      orderId: form.orderId ?? "",
      amount: form.amount ?? 0,
      status: form.status ?? "pending",
      mode: form.mode ?? "Bank Transfer",
      dueDate: form.dueDate ?? now,
      paidDate: form.paidDate ?? BigInt(0),
      notes: form.notes ?? "",
    };
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, payment });
    } else {
      await createMutation.mutateAsync(payment);
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
          data-ocid="crm.add_button"
        >
          <Plus className="h-4 w-4" /> Add Payment
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
          ) : !payments || payments.length === 0 ? (
            <div
              className="text-center py-10"
              data-ocid="crm.payments.empty_state"
            >
              <CreditCard className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No payments recorded yet
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table data-ocid="crm.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Order Ref</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((p, idx) => {
                    const order = orders?.find((o) => o.id === p.orderId);
                    return (
                      <TableRow
                        key={p.id}
                        data-ocid={`crm.row.item.${idx + 1}`}
                        className="hover:bg-muted/30"
                      >
                        <TableCell className="font-mono text-xs font-semibold">
                          {order?.orderNumber ?? (p.orderId || "—")}
                        </TableCell>
                        <TableCell className="text-sm font-semibold">
                          ₹ {formatAmount(p.amount)}
                        </TableCell>
                        <TableCell className="text-sm">{p.mode}</TableCell>
                        <TableCell>
                          <StatusBadge status={p.status} />
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(p.dueDate)}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[100px] truncate">
                          {p.notes || "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => openEdit(p)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => setDeleting(p.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editing ? "Edit" : "Add"} Payment
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Linked Order</Label>
              <Select
                value={form.orderId ?? ""}
                onValueChange={(v) => setForm({ ...form, orderId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select order" />
                </SelectTrigger>
                <SelectContent>
                  {orders?.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.orderNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Amount (₹) *</Label>
              <Input
                type="number"
                value={form.amount ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    amount: Number.parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Payment Mode</Label>
              <Select
                value={form.mode ?? "Bank Transfer"}
                onValueChange={(v) => setForm({ ...form, mode: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Bank Transfer",
                    "UPI",
                    "Cheque",
                    "Cash",
                    "Letter of Credit",
                    "TT / Wire Transfer",
                    "DD",
                  ].map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.status ?? "pending"}
                onValueChange={(v) => setForm({ ...form, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["pending", "paid", "overdue", "partial", "cancelled"].map(
                    (s) => (
                      <SelectItem key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Notes</Label>
              <Textarea
                value={form.notes ?? ""}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                placeholder="Payment notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}{" "}
              {editing ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Delete Payment?</DialogTitle>
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

// ---- Main CRM Page ----
export default function CRMPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" /> CRM
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Manage your customers, suppliers, orders, shipments, and payments
        </p>
      </div>

      <Tabs defaultValue="customers">
        <TabsList className="bg-muted h-10">
          <TabsTrigger
            value="customers"
            data-ocid="crm.customers.tab"
            className="gap-2"
          >
            <Users className="h-3.5 w-3.5" /> Customers
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="gap-2">
            <Users className="h-3.5 w-3.5" /> Suppliers
          </TabsTrigger>
          <TabsTrigger
            value="orders"
            data-ocid="crm.orders.tab"
            className="gap-2"
          >
            <Package className="h-3.5 w-3.5" /> Orders
          </TabsTrigger>
          <TabsTrigger
            value="shipments"
            data-ocid="crm.shipments.tab"
            className="gap-2"
          >
            <Ship className="h-3.5 w-3.5" /> Shipments
          </TabsTrigger>
          <TabsTrigger
            value="payments"
            data-ocid="crm.payments.tab"
            className="gap-2"
          >
            <CreditCard className="h-3.5 w-3.5" /> Payments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="mt-4">
          <ContactsTab contactType="customer" />
        </TabsContent>
        <TabsContent value="suppliers" className="mt-4">
          <ContactsTab contactType="supplier" />
        </TabsContent>
        <TabsContent value="orders" className="mt-4">
          <OrdersTab />
        </TabsContent>
        <TabsContent value="shipments" className="mt-4">
          <ShipmentsTab />
        </TabsContent>
        <TabsContent value="payments" className="mt-4">
          <PaymentsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
