import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DollarSign, FileText, AlertTriangle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface TaxBracket {
  label: string;
  rate: number;
  min: number;
  max: number;
  taxable: number;
  tax: number;
}

function getNZFinancialYear(): { start: string; end: string; label: string } {
  const now = new Date();
  const year = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  return {
    start: `${year}-04-01`,
    end: `${year + 1}-03-31`,
    label: `${year}/${year + 1}`,
  };
}

function calculateNZTax(income: number): { total: number; brackets: TaxBracket[] } {
  const brackets: TaxBracket[] = [
    { label: "$0 – $14,000", rate: 0.105, min: 0, max: 14000, taxable: 0, tax: 0 },
    { label: "$14,001 – $48,000", rate: 0.175, min: 14000, max: 48000, taxable: 0, tax: 0 },
    { label: "$48,001 – $70,000", rate: 0.30, min: 48000, max: 70000, taxable: 0, tax: 0 },
    { label: "$70,001+", rate: 0.33, min: 70000, max: Infinity, taxable: 0, tax: 0 },
  ];

  let remaining = Math.max(income, 0);
  let total = 0;

  for (const b of brackets) {
    const range = b.max === Infinity ? remaining : b.max - b.min;
    const taxable = Math.min(remaining, range);
    b.taxable = taxable;
    b.tax = taxable * b.rate;
    total += b.tax;
    remaining -= taxable;
    if (remaining <= 0) break;
  }

  return { total, brackets };
}

const GST_THRESHOLD = 60000;

export function TaxSummary() {
  const { user } = useAuth();
  const [grossEarnings, setGrossEarnings] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [loading, setLoading] = useState(true);

  const fy = getNZFinancialYear();

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      const [earningsRes, expensesRes] = await Promise.all([
        supabase
          .from("earnings")
          .select("amount")
          .eq("user_id", user.id)
          .gte("recorded_at", fy.start)
          .lte("recorded_at", fy.end),
        supabase
          .from("expenses")
          .select("amount")
          .eq("user_id", user.id)
          .gte("date", fy.start)
          .lte("date", fy.end),
      ]);

      const gross = (earningsRes.data || []).reduce((s, r) => s + Number(r.amount), 0);
      const exp = (expensesRes.data || []).reduce((s, r) => s + Number(r.amount), 0);
      setGrossEarnings(gross);
      setTotalExpenses(exp);
      setLoading(false);
    };
    fetchData();
  }, [user, fy.start, fy.end]);

  const netIncome = grossEarnings - totalExpenses;
  const tax = useMemo(() => calculateNZTax(netIncome), [netIncome]);
  const gstPercent = Math.min((grossEarnings / GST_THRESHOLD) * 100, 100);
  const gstRequired = grossEarnings >= GST_THRESHOLD;

  const exportCSV = () => {
    const rows = [
      ["NZ Tax Summary", fy.label],
      [],
      ["Gross Earnings", `$${grossEarnings.toFixed(2)}`],
      ["Total Deductible Expenses", `$${totalExpenses.toFixed(2)}`],
      ["Net Taxable Income", `$${netIncome.toFixed(2)}`],
      [],
      ["Tax Bracket", "Rate", "Taxable Amount", "Tax"],
      ...tax.brackets
        .filter((b) => b.taxable > 0)
        .map((b) => [b.label, `${(b.rate * 100).toFixed(1)}%`, `$${b.taxable.toFixed(2)}`, `$${b.tax.toFixed(2)}`]),
      [],
      ["Estimated Total Tax", `$${tax.total.toFixed(2)}`],
      [],
      ["GST Status", gstRequired ? "Registration Required" : `${gstPercent.toFixed(0)}% toward $60,000 threshold`],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tax-summary-${fy.label.replace("/", "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="glass rounded-2xl p-6 animate-pulse">
        <p className="text-muted-foreground text-sm">Loading tax summary…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Tax Summary
          </h2>
          <p className="text-sm text-muted-foreground">NZ Financial Year {fy.label}</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Top-level figures */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="glass rounded-xl p-5">
          <p className="text-xs text-muted-foreground mb-1">Gross Earnings</p>
          <p className="text-2xl font-display font-bold text-accent">${grossEarnings.toFixed(2)}</p>
        </div>
        <div className="glass rounded-xl p-5">
          <p className="text-xs text-muted-foreground mb-1">Total Deductible Expenses</p>
          <p className="text-2xl font-display font-bold text-destructive">${totalExpenses.toFixed(2)}</p>
        </div>
        <div className="glass rounded-xl p-5">
          <p className="text-xs text-muted-foreground mb-1">Net Taxable Income</p>
          <p className="text-2xl font-display font-bold">${netIncome.toFixed(2)}</p>
        </div>
      </div>

      {/* Tax breakdown */}
      <div className="glass rounded-2xl p-6">
        <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-primary" />
          Estimated Income Tax Breakdown
        </h3>
        <div className="space-y-3">
          {tax.brackets
            .filter((b) => b.taxable > 0)
            .map((b) => (
              <div key={b.label} className="flex items-center justify-between bg-muted/30 rounded-lg px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{b.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {(b.rate * 100).toFixed(1)}% on ${b.taxable.toFixed(2)}
                  </p>
                </div>
                <p className="text-sm font-semibold text-destructive">${b.tax.toFixed(2)}</p>
              </div>
            ))}
          {tax.brackets.every((b) => b.taxable === 0) && (
            <p className="text-sm text-muted-foreground text-center py-2">No taxable income recorded yet.</p>
          )}
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <p className="font-display font-semibold">Estimated Total Tax</p>
          <p className="text-xl font-bold text-destructive">${tax.total.toFixed(2)}</p>
        </div>
      </div>

      {/* GST Tracker */}
      <div className={`glass rounded-2xl p-6 ${gstRequired ? "border-2 border-destructive/50" : ""}`}>
        <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
          {gstRequired ? (
            <AlertTriangle className="h-4 w-4 text-destructive" />
          ) : (
            <DollarSign className="h-4 w-4 text-primary" />
          )}
          GST Tracker
        </h3>
        {gstRequired ? (
          <div className="bg-destructive/10 rounded-lg p-4">
            <p className="text-sm font-semibold text-destructive">⚠️ GST registration required</p>
            <p className="text-xs text-muted-foreground mt-1">
              Your gross earnings of ${grossEarnings.toFixed(2)} exceed the $60,000 threshold. You must register for GST with IRD.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">
                {gstPercent.toFixed(0)}% toward GST threshold
              </p>
              <p className="text-xs text-muted-foreground">
                ${grossEarnings.toFixed(2)} / $60,000
              </p>
            </div>
            <Progress value={gstPercent} className="h-3" />
          </div>
        )}
      </div>
    </div>
  );
}
