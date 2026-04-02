import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface TripHeatPoint {
  lat: number;
  lng: number;
  count: number;
  avgAmount: number;
}

export function useTripHeatData() {
  const { user } = useAuth();
  const [points, setPoints] = useState<TripHeatPoint[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetch = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("earnings")
          .select("trip_lat, trip_lng, amount")
          .eq("user_id", user.id)
          .not("trip_lat", "is", null)
          .not("trip_lng", "is", null);

        if (error) throw error;
        if (!data?.length) {
          setPoints([]);
          return;
        }

        // Group by rounded coordinates (3 decimal places ≈ ~110m precision)
        const grouped = new Map<string, { lat: number; lng: number; total: number; count: number }>();

        for (const row of data) {
          const lat = Math.round((row as any).trip_lat * 1000) / 1000;
          const lng = Math.round((row as any).trip_lng * 1000) / 1000;
          const key = `${lat},${lng}`;
          const existing = grouped.get(key);
          if (existing) {
            existing.total += Number(row.amount);
            existing.count += 1;
          } else {
            grouped.set(key, { lat, lng, total: Number(row.amount), count: 1 });
          }
        }

        setPoints(
          Array.from(grouped.values()).map((g) => ({
            lat: g.lat,
            lng: g.lng,
            count: g.count,
            avgAmount: Math.round((g.total / g.count) * 100) / 100,
          }))
        );
      } catch (err) {
        console.error("TripHeatData fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [user]);

  return { points, loading };
}
