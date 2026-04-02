import { useEffect, useState, useCallback } from "react";
import { Bell, BellRing } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface AlertPrefs {
  surge_alerts: boolean;
  surge_threshold: number;
  goal_alerts: boolean;
  platform_alerts: boolean;
  alerts_enabled: boolean;
}

const DEFAULTS: AlertPrefs = {
  surge_alerts: true,
  surge_threshold: 1.5,
  goal_alerts: true,
  platform_alerts: true,
  alerts_enabled: true,
};

export function AlertsPanel({ alertsFired }: { alertsFired: number }) {
  const { user, profile } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );
  const [prefs, setPrefs] = useState<AlertPrefs>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("alert_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (data) {
        setPrefs({
          surge_alerts: data.surge_alerts ?? true,
          surge_threshold: Number(data.surge_threshold) || 1.5,
          goal_alerts: data.goal_alerts ?? true,
          platform_alerts: data.platform_alerts ?? true,
          alerts_enabled: data.alerts_enabled ?? true,
        });
      }
      setLoading(false);
    };
    fetch();
  }, [user]);

  const save = useCallback(
    async (updates: Partial<AlertPrefs>) => {
      if (!user) return;
      const newPrefs = { ...prefs, ...updates };
      setPrefs(newPrefs);
      await supabase
        .from("alert_preferences")
        .update(newPrefs as any)
        .eq("user_id", user.id);
      toast.success("Saved ✅");
    },
    [user, prefs]
  );

  const requestPermission = async () => {
    if (typeof Notification === "undefined") return;
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-pulse text-muted-foreground text-sm">Loading preferences…</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Section 1 — Permission banner */}
      {permission !== "granted" ? (
        <Card className="glass border-0 rounded-2xl border-l-4 border-l-primary">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Enable push notifications to get surge alerts, goal updates and platform tips</p>
              <p className="text-xs text-muted-foreground mt-1">
                {permission === "denied" ? "Notifications are blocked. Please enable them in your browser settings." : "We'll only notify you about things you care about."}
              </p>
            </div>
            {permission !== "denied" && (
              <Button variant="hero" size="sm" onClick={requestPermission}>
                Enable Notifications
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Badge className="bg-accent/20 text-accent border-accent/30">
          Notifications enabled ✅
        </Badge>
      )}

      {/* Section 2 — Alert preferences */}
      <Card className="glass border-0 rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="font-display font-semibold text-base flex items-center gap-2">
            <BellRing className="h-4 w-4 text-primary" />
            Alert Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Master toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
            <div>
              <Label className="text-sm font-medium">Alerts On/Off</Label>
              <p className="text-xs text-muted-foreground">Master switch for all notifications</p>
            </div>
            <Switch
              checked={prefs.alerts_enabled}
              onCheckedChange={(v) => save({ alerts_enabled: v })}
            />
          </div>

          <div className={prefs.alerts_enabled ? "" : "opacity-40 pointer-events-none"}>
            {/* Surge alerts */}
            <div className="flex items-center justify-between py-4 border-b border-border">
              <div className="flex-1">
                <Label className="text-sm font-medium">Surge Alerts</Label>
                <p className="text-xs text-muted-foreground">Get notified when surge pricing hits your area</p>
              </div>
              <Switch
                checked={prefs.surge_alerts}
                onCheckedChange={(v) => save({ surge_alerts: v })}
              />
            </div>
            {prefs.surge_alerts && (
              <div className="flex items-center gap-3 py-3 pl-4">
                <Label className="text-xs text-muted-foreground whitespace-nowrap">Alert me when surge exceeds</Label>
                <Input
                  type="number"
                  min={1.0}
                  step={0.1}
                  value={prefs.surge_threshold}
                  onChange={(e) => save({ surge_threshold: parseFloat(e.target.value) || 1.5 })}
                  className="w-20 h-8 text-sm"
                />
                <span className="text-xs text-muted-foreground">x</span>
              </div>
            )}

            {/* Goal alerts */}
            <div className="flex items-center justify-between py-4 border-b border-border">
              <div className="flex-1">
                <Label className="text-sm font-medium">Daily Goal Alerts</Label>
                <p className="text-xs text-muted-foreground">
                  Notify at 80% and 100% of your daily goal
                  {profile?.earnings_goal ? ` ($${profile.earnings_goal})` : ""}
                </p>
              </div>
              <Switch
                checked={prefs.goal_alerts}
                onCheckedChange={(v) => save({ goal_alerts: v })}
              />
            </div>

            {/* Platform alerts */}
            <div className="flex items-center justify-between py-4">
              <div className="flex-1">
                <Label className="text-sm font-medium">Platform Rate Alerts</Label>
                <p className="text-xs text-muted-foreground">Get tipped when one platform is paying significantly more</p>
              </div>
              <Switch
                checked={prefs.platform_alerts}
                onCheckedChange={(v) => save({ platform_alerts: v })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 3 — Recent alerts */}
      <Card className="glass border-0 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Bell className="h-4 w-4 text-muted-foreground" />
            {alertsFired > 0 ? (
              <div className="flex items-center gap-2">
                <Badge variant="destructive">{alertsFired}</Badge>
                <span className="text-sm text-muted-foreground">alert{alertsFired !== 1 ? "s" : ""} sent this session</span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No alerts fired yet this session — we're watching for surge activity.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
