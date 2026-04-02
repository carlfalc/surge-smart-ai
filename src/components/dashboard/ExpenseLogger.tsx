import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Receipt, PlusCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = [
  "Fuel",
  "Vehicle Maintenance",
  "Insurance",
  "Phone/Data",
  "Tolls",
  "Car Wash",
  "Licensing & Registration",
  "Other",
];

interface GroupedExpense {
  category: string;
  total: number;
  count: number;
}

export function ExpenseLogger() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    category: "",
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [grouped, setGrouped] = useState<GroupedExpense[]>([]);
  const [grandTotal, setGrandTotal] = useState(0);

  const fetchMonthExpenses = useCallback(async () => {
    if (!user) return;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
    const { data } = await supabase
      .from("expenses")
      .select("category, amount")
      .eq("user_id", user.id)
      .gte("date", monthStart)
      .order("category");

    if (!data) return;

    const map: Record<string, { total: number; count: number }> = {};
    let total = 0;
    for (const row of data) {
      if (!map[row.category]) map[row.category] = { total: 0, count: 0 };
      map[row.category].total += Number(row.amount);
      map[row.category].count += 1;
      total += Number(row.amount);
    }
    setGrouped(
      Object.entries(map)
        .map(([category, v]) => ({ category, ...v }))
        .sort((a, b) => b.total - a.total)
    );
    setGrandTotal(total);
  }, [user]);

  useEffect(() => {
    fetchMonthExpenses();
  }, [fetchMonthExpenses]);

  const handleSubmit = async () => {
    if (!form.category || !form.amount) {
      toast.error("Category and amount are required");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from("expenses").insert({
        user_id: user?.id,
        category: form.category,
        description: form.description || null,
        amount: parseFloat(form.amount),
        date: form.date,
      });
      if (error) throw error;
      toast.success(`$${form.amount} expense logged`);
      setForm({ category: "", description: "", amount: "", date: new Date().toISOString().split("T")[0] });
      fetchMonthExpenses();
    } catch (err: any) {
      toast.error(err.message || "Failed to log expense");
    } finally {
      setLoading(false);
    }
  };

  const monthName = new Date().toLocaleString("default", { month: "long" });

  return (
    <div className="space-y-6">
      <Card className="glass border-0 rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="font-display font-semibold text-base flex items-center gap-2">
            <PlusCircle className="h-4 w-4 text-accent" />
            Log an Expense
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Category *</Label>
              <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Amount * (NZD)</Label>
              <Input
                type="number"
                placeholder="0.00"
                className="h-9 text-xs"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Description</Label>
              <Input
                type="text"
                placeholder="Optional note"
                className="h-9 text-xs"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Date</Label>
              <Input
                type="date"
                className="h-9 text-xs"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              />
            </div>
          </div>
          <Button
            className="mt-4 w-full"
            variant="hero"
            size="sm"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
            ) : (
              <><PlusCircle className="h-4 w-4 mr-2" /> Log Expense</>
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="glass rounded-2xl p-6">
        <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
          <Receipt className="h-4 w-4 text-accent" />
          {monthName} Expenses
        </h3>
        {grouped.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No expenses logged this month yet.</p>
        ) : (
          <div className="space-y-2">
            {grouped.map((g) => (
              <div key={g.category} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div>
                  <p className="text-sm font-medium">{g.category}</p>
                  <p className="text-xs text-muted-foreground">{g.count} expense{g.count !== 1 ? "s" : ""}</p>
                </div>
                <p className="text-sm font-semibold text-destructive">${g.total.toFixed(2)}</p>
              </div>
            ))}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <p className="text-sm font-bold">Total</p>
              <p className="text-base font-bold text-destructive">${grandTotal.toFixed(2)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
