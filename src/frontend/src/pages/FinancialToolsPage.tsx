import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, Globe, Landmark, TrendingUp } from "lucide-react";
import { useState } from "react";

// --- GST Calculator ---
function GSTCalculator() {
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("18");
  const [inclusive, setInclusive] = useState<"exclusive" | "inclusive">(
    "exclusive",
  );

  const numAmount = Number.parseFloat(amount) || 0;
  const gstRate = Number.parseFloat(rate) / 100;

  let baseAmount = 0;
  let gstAmount = 0;
  let totalAmount = 0;

  if (inclusive === "exclusive") {
    baseAmount = numAmount;
    gstAmount = numAmount * gstRate;
    totalAmount = numAmount + gstAmount;
  } else {
    totalAmount = numAmount;
    baseAmount = numAmount / (1 + gstRate);
    gstAmount = numAmount - baseAmount;
  }

  const cgst = gstAmount / 2;
  const sgst = gstAmount / 2;
  const igst = gstAmount;

  const fmt = (n: number) =>
    n.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label>Amount (₹)</Label>
          <Input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            data-ocid="tools.gst_input"
          />
        </div>
        <div className="space-y-1.5">
          <Label>GST Rate</Label>
          <Select value={rate} onValueChange={setRate}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["0", "5", "12", "18", "28"].map((r) => (
                <SelectItem key={r} value={r}>
                  {r}%
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Calculation Type</Label>
          <Select
            value={inclusive}
            onValueChange={(v) => setInclusive(v as "exclusive" | "inclusive")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="exclusive">GST Exclusive (add GST)</SelectItem>
              <SelectItem value="inclusive">
                GST Inclusive (extract GST)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {numAmount > 0 && (
        <div className="bg-secondary/50 rounded-xl p-5 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Results
          </p>
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
            <ResultRow label="Base Amount" value={`₹ ${fmt(baseAmount)}`} />
            <ResultRow
              label="GST Amount"
              value={`₹ ${fmt(gstAmount)}`}
              highlight
            />
            <ResultRow label="CGST (Local)" value={`₹ ${fmt(cgst)}`} sub />
            <ResultRow label="SGST (Local)" value={`₹ ${fmt(sgst)}`} sub />
            <ResultRow label="IGST (Interstate)" value={`₹ ${fmt(igst)}`} sub />
            <Separator className="sm:col-span-2" />
            <ResultRow
              label="Total Amount"
              value={`₹ ${fmt(totalAmount)}`}
              large
            />
          </div>
        </div>
      )}
    </div>
  );
}

// --- Profit Margin Calculator ---
function ProfitMarginCalculator() {
  const [costPrice, setCostPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");

  const cp = Number.parseFloat(costPrice) || 0;
  const sp = Number.parseFloat(sellingPrice) || 0;
  const profit = sp - cp;
  const margin = sp > 0 ? (profit / sp) * 100 : 0;
  const markup = cp > 0 ? (profit / cp) * 100 : 0;

  const fmt = (n: number) =>
    n.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Cost Price (₹)</Label>
          <Input
            type="number"
            placeholder="Total cost of goods"
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value)}
            data-ocid="tools.margin_input"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Selling Price (₹)</Label>
          <Input
            type="number"
            placeholder="Price charged to customer"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
            data-ocid="tools.margin_input"
          />
        </div>
      </div>

      {cp > 0 && sp > 0 && (
        <div className="bg-secondary/50 rounded-xl p-5 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Results
          </p>
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
            <ResultRow
              label="Profit / Loss"
              value={`₹ ${fmt(profit)}`}
              highlight
              positive={profit >= 0}
            />
            <ResultRow
              label="Profit Margin"
              value={`${fmt(margin)}%`}
              highlight
              positive={margin >= 0}
            />
            <ResultRow label="Markup Percentage" value={`${fmt(markup)}%`} />
            <ResultRow label="Cost Price" value={`₹ ${fmt(cp)}`} sub />
            <ResultRow label="Selling Price" value={`₹ ${fmt(sp)}`} sub />
          </div>
          {/* Visual bar */}
          {sp > 0 && cp > 0 && (
            <div className="mt-2">
              <p className="text-xs text-muted-foreground mb-1.5">
                Cost vs. Profit breakdown
              </p>
              <div className="flex h-6 rounded-lg overflow-hidden text-xs font-medium">
                <div
                  style={{ width: `${Math.min((cp / sp) * 100, 100)}%` }}
                  className="bg-chart-2/70 flex items-center justify-center text-white"
                >
                  Cost
                </div>
                {profit > 0 && (
                  <div
                    style={{ width: `${Math.min((profit / sp) * 100, 100)}%` }}
                    className="bg-success/70 flex items-center justify-center text-white"
                  >
                    Profit
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- FOB to CIF Calculator ---
function ExportFOBCIFCalculator() {
  const [fob, setFob] = useState("");
  const [freight, setFreight] = useState("");
  const [insurance, setInsurance] = useState("");
  const [currency, setCurrency] = useState("USD");

  const fobVal = Number.parseFloat(fob) || 0;
  const freightVal = Number.parseFloat(freight) || 0;
  const insuranceVal = Number.parseFloat(insurance) || 0;

  const cif = fobVal + freightVal + insuranceVal;

  const fmt = (n: number) =>
    n.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Currency</Label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["USD", "EUR", "GBP", "INR", "AED"].map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>FOB Value ({currency})</Label>
          <Input
            type="number"
            placeholder="Free On Board value"
            value={fob}
            onChange={(e) => setFob(e.target.value)}
            data-ocid="tools.fob_input"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Freight Charges ({currency})</Label>
          <Input
            type="number"
            placeholder="Shipping / freight cost"
            value={freight}
            onChange={(e) => setFreight(e.target.value)}
            data-ocid="tools.fob_input"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Insurance ({currency})</Label>
          <Input
            type="number"
            placeholder="Cargo insurance premium"
            value={insurance}
            onChange={(e) => setInsurance(e.target.value)}
            data-ocid="tools.fob_input"
          />
        </div>
      </div>

      <div className="bg-secondary/50 rounded-xl p-4 text-xs text-muted-foreground">
        <p>
          <strong>CIF = FOB + Freight + Insurance</strong> — Cost, Insurance &
          Freight is the price paid by the buyer including all costs up to the
          destination port.
        </p>
      </div>

      {fobVal > 0 && (
        <div className="bg-secondary/50 rounded-xl p-5 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Results
          </p>
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
            <ResultRow label="FOB Value" value={`${currency} ${fmt(fobVal)}`} />
            <ResultRow
              label="Freight Charges"
              value={`${currency} ${fmt(freightVal)}`}
            />
            <ResultRow
              label="Insurance"
              value={`${currency} ${fmt(insuranceVal)}`}
            />
            <Separator className="sm:col-span-2" />
            <ResultRow
              label="CIF Value (Total)"
              value={`${currency} ${fmt(cif)}`}
              large
              highlight
            />
          </div>
        </div>
      )}
    </div>
  );
}

// --- EMI Calculator ---
function LoanEMICalculator() {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [tenure, setTenure] = useState("");

  const P = Number.parseFloat(principal) || 0;
  const R = (Number.parseFloat(rate) || 0) / 12 / 100; // Monthly rate
  const N = Number.parseFloat(tenure) || 0; // Months

  let emi = 0;
  let totalPayment = 0;
  let totalInterest = 0;

  if (P > 0 && R > 0 && N > 0) {
    emi = (P * R * (1 + R) ** N) / ((1 + R) ** N - 1);
    totalPayment = emi * N;
    totalInterest = totalPayment - P;
  } else if (P > 0 && R === 0 && N > 0) {
    emi = P / N;
    totalPayment = P;
    totalInterest = 0;
  }

  const fmt = (n: number) =>
    n.toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  const interestPct =
    totalPayment > 0 ? (totalInterest / totalPayment) * 100 : 0;
  const principalPct = 100 - interestPct;

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label>Loan Amount (₹)</Label>
          <Input
            type="number"
            placeholder="Principal amount"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            data-ocid="tools.emi_input"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Annual Interest Rate (%)</Label>
          <Input
            type="number"
            placeholder="e.g. 12"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            data-ocid="tools.emi_input"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Tenure (Months)</Label>
          <Input
            type="number"
            placeholder="e.g. 24"
            value={tenure}
            onChange={(e) => setTenure(e.target.value)}
            data-ocid="tools.emi_input"
          />
          <p className="text-xs text-muted-foreground">
            e.g. 12 = 1 year, 60 = 5 years
          </p>
        </div>
      </div>

      {emi > 0 && (
        <div className="space-y-4">
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-5">
            <p className="text-xs font-semibold text-muted-foreground mb-1">
              Monthly EMI
            </p>
            <p className="font-display text-4xl font-bold text-primary">
              ₹ {fmt(emi)}
            </p>
          </div>
          <div className="bg-secondary/50 rounded-xl p-5 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Loan Summary
            </p>
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
              <ResultRow label="Principal Amount" value={`₹ ${fmt(P)}`} />
              <ResultRow
                label="Total Interest"
                value={`₹ ${fmt(totalInterest)}`}
                highlight
              />
              <ResultRow
                label="Total Payment"
                value={`₹ ${fmt(totalPayment)}`}
                large
              />
              <ResultRow
                label="Interest to Principal Ratio"
                value={`${interestPct.toFixed(1)}% : ${principalPct.toFixed(1)}%`}
              />
            </div>
            <div className="mt-2">
              <p className="text-xs text-muted-foreground mb-1.5">
                Loan breakdown
              </p>
              <div className="flex h-6 rounded-lg overflow-hidden text-xs font-medium">
                <div
                  style={{ width: `${principalPct}%` }}
                  className="bg-chart-2/70 flex items-center justify-center text-white text-xs"
                >
                  Principal
                </div>
                <div
                  style={{ width: `${interestPct}%` }}
                  className="bg-chart-5/70 flex items-center justify-center text-white text-xs"
                >
                  Interest
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Result Row helper ---
function ResultRow({
  label,
  value,
  highlight = false,
  large = false,
  positive,
  sub = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  large?: boolean;
  positive?: boolean;
  sub?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={`text-sm ${sub ? "text-muted-foreground" : "text-foreground"}`}
      >
        {label}
      </span>
      <span
        className={`font-semibold ${large ? "text-base" : "text-sm"} ${
          highlight
            ? positive === false
              ? "text-destructive"
              : positive === true
                ? "text-success"
                : "text-primary"
            : "text-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export default function FinancialToolsPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <Calculator className="h-6 w-6 text-primary" /> Financial Tools
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Business calculators to help you make informed financial decisions
        </p>
      </div>

      <Tabs defaultValue="gst">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto gap-1 bg-muted p-1">
          <TabsTrigger
            value="gst"
            className="gap-1.5 py-2 text-xs sm:text-sm"
            data-ocid="tools.gst_input"
          >
            <Calculator className="h-3.5 w-3.5" /> GST
          </TabsTrigger>
          <TabsTrigger
            value="margin"
            className="gap-1.5 py-2 text-xs sm:text-sm"
            data-ocid="tools.margin_input"
          >
            <TrendingUp className="h-3.5 w-3.5" /> Profit Margin
          </TabsTrigger>
          <TabsTrigger
            value="fob"
            className="gap-1.5 py-2 text-xs sm:text-sm"
            data-ocid="tools.fob_input"
          >
            <Globe className="h-3.5 w-3.5" /> FOB/CIF
          </TabsTrigger>
          <TabsTrigger
            value="emi"
            className="gap-1.5 py-2 text-xs sm:text-sm"
            data-ocid="tools.emi_input"
          >
            <Landmark className="h-3.5 w-3.5" /> Loan EMI
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gst" className="mt-4">
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" /> GST Calculator
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Calculate GST for any transaction — CGST + SGST for local, IGST
                for interstate
              </p>
            </CardHeader>
            <CardContent>
              <GSTCalculator />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="margin" className="mt-4">
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" /> Profit Margin
                Calculator
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Calculate profit margin and markup percentage for your products
              </p>
            </CardHeader>
            <CardContent>
              <ProfitMarginCalculator />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fob" className="mt-4">
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" /> Export FOB → CIF
                Calculator
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Calculate the total Cost, Insurance & Freight (CIF) for export
                shipments
              </p>
            </CardHeader>
            <CardContent>
              <ExportFOBCIFCalculator />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emi" className="mt-4">
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Landmark className="h-5 w-5 text-primary" /> Loan EMI
                Calculator
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Calculate your monthly EMI for Mudra, CGTMSE, or any business
                loan
              </p>
            </CardHeader>
            <CardContent>
              <LoanEMICalculator />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
