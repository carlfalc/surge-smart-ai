import { useState } from "react";
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
import { PlusCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

const PLATFORMS = ["Uber", "Ola", "Lyft", "DiDi", "InDriver", "Other"];

export function TripLogger({ onTripAdded }: { onTripAdded: () => void }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    platform: "",
    amount: "",
    distance: "",
    duration: "",
    surge_multiplier: "",
  });

  const handleQuickAdd = async () => {
    if (!form.platform || !form.amount) {
      toast.error("Platform and earnings are required");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from("earnings").insert({
        user_id: user?.id,
        platform: form.platform,
        amount: parseFloat(form.amount),
        trip_distance_km: form.distance ? parseFloat(form.distance) : null,
        trip_duration_min: form.duration ? parseInt(form.duration) : null,
        surge_multiplier: form.surge_multiplier ? parseFloat(form.surge_multiplier) : 1.0,
      });
      if (error) throw error;
      toast.success(`Trip logged! $${form.amount} on ${form.platform}`);
      setForm({ platform: "", amount: "", distance: "", duration: "", surge_multiplier: "" });
      onTripAdded();
    } catch (err: any) {
      toast.error(err.message || "Failed to log trip");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass border-0 rounded-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="font-display font-semibold text-base flex items-center gap-2">
          <PlusCircle className="h-4 w-4 text-accent" />
          Log a Trip
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Platform *</Label>
            <Select value={form.platform} onValueChange={(v) => setForm((f) => ({ ...f, platform: v }))}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {PLATFORMS.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Earnings * ($)</Label>
            <Input
              type="number"
              placeholder="0.00"
              className="h-9 text-xs"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Distance (km)</Label>
            <Input
              type="number"
              placeholder="0"
              className="h-9 text-xs"
              value={form.distance}
              onChange={(e) => setForm((f) => ({ ...f, distance: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Duration (min)</Label>
            <Input
              type="number"
              placeholder="0"
              className="h-9 text-xs"
              value={form.duration}
              onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Surge (x)</Label>
            <Input
              type="number"
              step="0.1"
              placeholder="1.0"
              className="h-9 text-xs"
              value={form.surge_multiplier}
              onChange={(e) => setForm((f) => ({ ...f, surge_multiplier: e.target.value }))}
            />
          </div>
        </div>
        <Button
          className="mt-4 w-full"
          variant="hero"
          size="sm"
          onClick={handleQuickAdd}
          disabled={loading}
        >
          {loading ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
          ) : (
            <><PlusCircle className="h-4 w-4 mr-2" /> Log Trip</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
