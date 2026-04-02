import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface AlertPrefs {
  surge_alerts: boolean;
  surge_threshold: number;
  goal_alerts: boolean;
  platform_alerts: boolean;
  alerts_enabled: boolean;
}

const DEFAULT_PREFS: AlertPrefs = {
  surge_alerts: true,
  surge_threshold: 1.5,
  goal_alerts: true,
  platform_alerts: true,
  alerts_enabled: true,
};

export function useAlerts() {
  const { user, profile } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [prefsLoading, setPrefsLoading] = useState(true);
  const [alertsFired, setAlertsFired] = useState(0);
  const prefsRef = useRef<AlertPrefs>(DEFAULT_PREFS);
  const firedRef = useRef<Set<string>>(new Set());

  // Request notification permission once
  useEffect(() => {
    if (typeof Notification === "undefined") return;
    setPermission(Notification.permission);
    if (Notification.permission === "default") {
      Notification.requestPermission().then((p) => setPermission(p));
    }
  }, []);

  // Fetch alert preferences
  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      setPrefsLoading(true);
      const { data } = await supabase
        .from("alert_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (data) {
        prefsRef.current = {
          surge_alerts: data.surge_alerts ?? true,
          surge_threshold: Number(data.surge_threshold) || 1.5,
          goal_alerts: data.goal_alerts ?? true,
          platform_alerts: data.platform_alerts ?? true,
          alerts_enabled: data.alerts_enabled ?? true,
        };
      }
      setPrefsLoading(false);
    };
    fetch();
  }, [user]);

  const fireNotification = useCallback((key: string, title: string, body: string) => {
    if (firedRef.current.has(key)) return;
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    firedRef.current.add(key);
    new Notification(title, { body, icon: "/favicon.ico" });
    setAlertsFired((c) => c + 1);
  }, []);

  const runChecks = useCallback(async () => {
    const prefs = prefsRef.current;
    if (!prefs.alerts_enabled || !user) return;

    const city = profile?.city || "Auckland";

    // Surge check
    if (prefs.surge_alerts) {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        const res = await fetch(`${supabaseUrl}/functions/v1/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseKey}`,
            apikey: supabaseKey,
          },
          body: JSON.stringify({
            messages: [{
              role: "user",
              content: `What is the single highest surge zone in ${city} right now? Return ONLY JSON: { "area": "string", "multiplier": number }. No markdown.`,
            }],
            type: "surge",
          }),
        });

        if (res.ok) {
          const reader = res.body?.getReader();
          if (reader) {
            const decoder = new TextDecoder();
            let accumulated = "";
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              const chunk = decoder.decode(value, { stream: true });
              for (const line of chunk.split("\n")) {
                if (!line.startsWith("data: ")) continue;
                const d = line.slice(6).trim();
                if (d === "[DONE]") continue;
                try {
                  const parsed = JSON.parse(d);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) accumulated += content;
                } catch { /* skip */ }
              }
            }
            const jsonMatch = accumulated.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const surge = JSON.parse(jsonMatch[0]);
              if (surge.multiplier >= prefs.surge_threshold) {
                fireNotification(
                  `surge-${surge.area}`,
                  `🔴 Surge Alert — ${city}`,
                  `${surge.area} is surging at ${surge.multiplier}x right now. Head there!`
                );
              }
            }
          }
        }
      } catch (e) {
        console.error("Surge alert check failed:", e);
      }
    }

    // Goal check
    if (prefs.goal_alerts && profile?.earnings_goal) {
      try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const { data } = await supabase
          .from("earnings")
          .select("amount")
          .eq("user_id", user.id)
          .gte("created_at", todayStart.toISOString());

        if (data) {
          const total = data.reduce((s, r) => s + (r.amount || 0), 0);
          const goal = Number(profile.earnings_goal);
          if (total >= goal) {
            fireNotification("goal-100", "🎉 Goal smashed!", `You've hit your $${goal} daily goal! Legend.`);
          } else if (total >= goal * 0.8) {
            fireNotification("goal-80", "🎯 Almost there!", `You've hit 80% of your $${goal} daily goal. Keep going!`);
          }
        }
      } catch (e) {
        console.error("Goal alert check failed:", e);
      }
    }

    // Platform check
    if (prefs.platform_alerts) {
      try {
        const { data } = await supabase
          .from("platform_rates")
          .select("platform, avg_trip_value");

        if (data && data.length >= 2) {
          const sorted = data
            .filter((r) => r.avg_trip_value != null)
            .sort((a, b) => (b.avg_trip_value ?? 0) - (a.avg_trip_value ?? 0));
          if (sorted.length >= 2) {
            const high = sorted[0];
            const low = sorted[sorted.length - 1];
            const diff = ((high.avg_trip_value! - low.avg_trip_value!) / low.avg_trip_value!) * 100;
            if (diff > 20) {
              fireNotification(
                "platform-tip",
                "💰 Platform tip",
                `${high.platform} is paying ${Math.round(diff)}% more per trip right now.`
              );
            }
          }
        }
      } catch (e) {
        console.error("Platform alert check failed:", e);
      }
    }
  }, [user, profile, fireNotification]);

  // Run checks every 5 minutes
  useEffect(() => {
    if (!user || prefsLoading) return;
    runChecks();
    const interval = setInterval(runChecks, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user, prefsLoading, runChecks]);

  return { permission, prefsLoading, alertsFired };
}
