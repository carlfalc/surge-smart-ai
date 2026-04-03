import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, Save, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { CitySearch } from "@/components/ui/CitySearch";

const PLATFORMS = ["Uber", "Ola", "DiDi", "Lyft", "InDriver", "Other"];

export function ProfileEditor() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    city: "",
    city_lat: null as number | null,
    city_lng: null as number | null,
    earnings_goal: "",
    preferred_platforms: [] as string[],
  });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || "",
        city: profile.city || "",
        earnings_goal: profile.earnings_goal?.toString() || "",
        preferred_platforms: profile.preferred_platforms || [],
      });
    }
  }, [profile]);

  const togglePlatform = (platform: string) => {
    setForm((f) => ({
      ...f,
      preferred_platforms: f.preferred_platforms.includes(platform)
        ? f.preferred_platforms.filter((p: string) => p !== platform)
        : [...f.preferred_platforms, platform],
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updateData: Record<string, unknown> = {
        full_name: form.full_name,
        city: form.city,
        preferred_platforms: form.preferred_platforms,
      };
      if (form.earnings_goal) {
        updateData.earnings_goal = parseFloat(form.earnings_goal);
      }

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("user_id", user?.id);

      if (error) throw error;
      toast.success("Profile updated! Your changes have been saved.");
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display">
          <User className="h-5 w-5 text-primary" />
          Edit Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name</Label>
          <Input
            id="full_name"
            value={form.full_name}
            onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
            placeholder="Your name"
          />
        </div>

        {/* City */}
        <div className="space-y-2">
          <Label>City</Label>
          <CitySearch
            value={form.city}
            onSelect={(c) => setForm((f) => ({ ...f, city: c.name, city_lat: c.lat, city_lng: c.lng }))}
            placeholder="Search any city worldwide..."
          />
          <p className="text-xs text-muted-foreground">
            🌍 Search any city worldwide — Whanganui, London, Dubai, anywhere you drive.
          </p>
        </div>

        {/* Platforms */}
        <div className="space-y-2">
          <Label>Platforms You Drive For</Label>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => togglePlatform(p)}
                className={`px-3 py-1.5 rounded-full text-sm border-2 transition-all ${
                  form.preferred_platforms.includes(p)
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                {form.preferred_platforms.includes(p) && (
                  <span className="mr-1">✓</span>
                )}
                {p}
              </button>
            ))}
          </div>

          {form.preferred_platforms.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {form.preferred_platforms.map((p: string) => (
                <Badge key={p} variant="secondary" className="gap-1">
                  {p}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => togglePlatform(p)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Earnings Goal */}
        <div className="space-y-2">
          <Label htmlFor="earnings_goal">Daily Earnings Goal ($)</Label>
          <Input
            id="earnings_goal"
            type="number"
            min="0"
            step="10"
            value={form.earnings_goal}
            onChange={(e) => setForm((f) => ({ ...f, earnings_goal: e.target.value }))}
            placeholder="200"
          />
          <p className="text-xs text-muted-foreground">
            Used to track your progress on the dashboard
          </p>
        </div>

        <Button onClick={handleSave} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
