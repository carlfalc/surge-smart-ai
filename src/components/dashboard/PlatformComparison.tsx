import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, RefreshCw, Users, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface PlatformRate {
  platform: string;
  avg_per_km: number;
  avg_per_hour: number;
  avg_trip_value: number;
  avg_surge: number;
  trip_count: number;
  source: "real" | "ai";
}

const PLATFORMS = ["Uber", "Ola", "DiDi", "Lyft"];

export function PlatformComparison() {
  const { profile } = useAuth();
  const [rates, setRates] = useState<PlatformRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalDrivers, setTotalDrivers] = useState(0);
  const city = profile?.city || "Auckland";

  const fetchRealRates = async (): Promise<PlatformRate[]> => {
    const { data, error } = await supabase
      .from("platform_rates" as any)
      .select("*")
      .eq("city", city)
      .gte("trip_count", 5);

    if (error || !data) return [];

    setTotalDrivers((data as any[]).length);

    return (data as any[]).map((r: any) => ({
      platform: r.platform,
      avg_per_km: Number(r.avg_per_km) || 0,
      avg_per_hour: Number(r.avg_per_hour) || 0,
      avg_trip_value: Number(r.avg_trip_value) || 0,
      avg_surge: Number(r.avg_surge) || 1,
      trip_count: Number(r.trip_count) || 0,
      source: "real" as const,
    }));
  };

  const fetchAIRates = async (missingPlatforms: string[]): Promise<PlatformRate[]> => {
    if (missingPlatforms.length === 0) return [];

    try {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-NZ", { hour: "2-digit", minute: "2-digit" });
      const dayStr = now.toLocaleDateString("en-NZ", { weekday: "long" });

      const prompt = `You are a rideshare data expert. Estimate current typical driver earnings for these platforms in ${city}: ${missingPlatforms.join(", ")}.
It is currently ${timeStr} on a ${dayStr}.
Return ONLY a JSON array like this:
[{"platform":"Uber","avg_per_km":1.85,"avg_per_hour":28.50,"avg_trip_value":18.00,"avg_surge":1.2}]
Base estimates on typical rideshare driver pay rates for ${city}. Return ONLY the JSON array, no markdown.`;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({
            messages: [{ role: "user", content: prompt }],
            type: "surge",
          }),
        }
      );

      let fullText = "";
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (line.startsWith("data: ")) {
            const payload = line.slice(6).trim();
            if (payload === "[DONE]") continue;
            try {
              const parsed = JSON.parse(payload);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) fullText += delta;
            } catch {}
          }
        }
      }

      const jsonMatch = fullText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) return [];
      const parsed = JSON.parse(jsonMatch[0]);

      return parsed
        .filter((r: any) => r.platform && r.avg_per_hour != null)
        .map((r: any) => ({
          platform: r.platform,
          avg_per_km: Number(r.avg_per_km) || 0,
          avg_per_hour: Number(r.avg_per_hour) || 0,
          avg_trip_value: Number(r.avg_trip_value) || 0,
          avg_surge: Number(r.avg_surge) || 1,
          trip_count: 0,
          source: "ai" as const,
        }));
    } catch {
      return [];
    }
  };

  const loadRates = async () => {
    setLoading(true);
    try {
      const realRates = await fetchRealRates();
      const realPlatforms = realRates.map((r) => r.platform);
      const missingPlatforms = PLATFORMS.filter((p) => !realPlatforms.includes(p));
      const aiRates = await fetchAIRates(missingPlatforms);
      const combined = [...realRates, ...aiRates].sort(
        (a, b) => b.avg_per_hour - a.avg_per_hour
      );
      setRates(combined);
    } catch {
      toast.error("Failed to load platform rates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRates();
  }, [city]);

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="font-display font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-accent" />
            Platform Earnings Comparison
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {city} •{" "}
            {totalDrivers > 0 ? (
              <span className="inline-flex items-center gap-1">
                <Users className="h-3 w-3" />
                {totalDrivers} platforms with real data
              </span>
            ) : (
              "Powered by AI estimates — improves as drivers log trips"
            )}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={loadRates}
          disabled={loading}
          className="text-muted-foreground"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {loading && rates.length === 0 && (
        <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          Analysing platform rates for {city}...
        </div>
      )}

      <div className="space-y-3 mt-4">
        {rates.map((rate, index) => (
          <div
            key={rate.platform}
            className={`rounded-lg px-4 py-3 border ${
              index === 0
                ? "border-accent/40 bg-accent/5"
                : "border-border bg-muted/30"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold">{rate.platform}</span>
              <div className="flex items-center gap-2">
                {index === 0 && (
                  <Badge variant="default" className="bg-accent text-accent-foreground text-[10px] px-2 py-0">
                    Best
                  </Badge>
                )}
                <Badge variant="outline" className="text-[10px] px-2 py-0">
                  {rate.source === "real" ? (
                    <span className="flex items-center gap-1">
                      <Users className="h-2.5 w-2.5" />
                      {rate.trip_count} trips
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Sparkles className="h-2.5 w-2.5" />
                      AI estimate
                    </span>
                  )}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div>
                <p className="text-[10px] text-muted-foreground">Per hour</p>
                <p className={`text-sm font-bold ${index === 0 ? "text-accent" : ""}`}>
                  ${rate.avg_per_hour?.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Per km</p>
                <p className="text-sm font-medium">${rate.avg_per_km?.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Avg trip</p>
                <p className="text-sm font-medium">${rate.avg_trip_value?.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Avg surge</p>
                <p className="text-sm font-medium">{rate.avg_surge?.toFixed(1)}x</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground mt-4">
        💡 Real data appears automatically as drivers log trips. AI estimates are replaced
        once 5+ trips are recorded per platform.
      </p>
    </div>
  );
}
