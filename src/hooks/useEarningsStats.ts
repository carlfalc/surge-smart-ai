import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface EarningsStats {
  todayEarnings: number;
  todayTrips: number;
  todayHours: number;
  avgSurge: number;
  loading: boolean;
}

export function useEarningsStats(refreshKey: number): EarningsStats {
  const { user } = useAuth();
  const [stats, setStats] = useState<EarningsStats>({
    todayEarnings: 0,
    todayTrips: 0,
    todayHours: 0,
    avgSurge: 1.0,
    loading: true,
  });

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from("earnings")
        .select("amount, trip_duration_min, surge_multiplier")
        .eq("user_id", user.id)
        .gte("created_at", todayStart.toISOString());

      if (error || !data) {
        setStats((s) => ({ ...s, loading: false }));
        return;
      }

      const todayEarnings = data.reduce((sum, t) => sum + (t.amount || 0), 0);
      const todayTrips = data.length;
      const todayMinutes = data.reduce((sum, t) => sum + (t.trip_duration_min || 0), 0);
      const surgeValues = data
        .filter((t) => t.surge_multiplier != null)
        .map((t) => t.surge_multiplier!);
      const avgSurge =
        surgeValues.length > 0
          ? surgeValues.reduce((a, b) => a + b, 0) / surgeValues.length
          : 1.0;

      setStats({
        todayEarnings: parseFloat(todayEarnings.toFixed(2)),
        todayTrips,
        todayHours: parseFloat((todayMinutes / 60).toFixed(1)),
        avgSurge: parseFloat(avgSurge.toFixed(1)),
        loading: false,
      });
    };

    fetchStats();
  }, [user, refreshKey]);

  return stats;
}
