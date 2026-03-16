import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, RefreshCw, MapPin } from "lucide-react";
import { useWeather } from "@/hooks/useWeather";
import { WeatherBadge } from "@/components/dashboard/WeatherBadge";

interface SurgeArea {
  area: string;
  multiplier: string;
  confidence: string;
  tip: string;
}

interface SurgeData {
  areas: SurgeArea[];
  summary: string;
  best_area: string;
}

export function SurgePredictionCard() {
  const { profile } = useAuth();
  const [surgeData, setSurgeData] = useState<SurgeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const city = profile?.city || "Auckland";
  const { weather } = useWeather(city);

  const fetchSurgePredictions = useCallback(async () => {
    setLoading(true);
    try {
      const weatherContext = weather
        ? `Current weather in ${city}: ${weather.description}, ${weather.temperature}°C, wind ${weather.windspeed}km/h, rainfall ${weather.rainfall}mm. Weather surge impact: ${weather.surgeImpact}.`
        : "";

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
          messages: [
            {
              role: "user",
              content: `${weatherContext} Give me current surge pricing predictions for rideshare drivers in ${city}. Return a JSON object with this exact structure:
{
  "areas": [
    { "area": "Area Name", "multiplier": "1.8x", "confidence": "High", "tip": "short tip" }
  ],
  "summary": "one sentence market summary",
  "best_area": "Best Area Name"
}
Include 4 areas. Base predictions on current time of day, weather conditions, and typical ${city} patterns. Return ONLY valid JSON, no markdown.`,
            },
          ],
          type: "surge",
        }),
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        // Parse SSE lines
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) accumulated += content;
          } catch {
            // skip malformed chunks
          }
        }
      }

      const jsonMatch = accumulated.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed: SurgeData = JSON.parse(jsonMatch[0]);
        // Filter out malformed areas
        if (parsed.areas) {
          parsed.areas = parsed.areas.filter(
            (a) => a.area && typeof a.area === "string" && a.area.length > 1
          );
        }
        if (parsed.areas?.length) {
          setSurgeData(parsed);
          setLastUpdated(new Date());
        }
      }
    } catch (err) {
      console.error("Surge fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [city, weather]);

  useEffect(() => {
    fetchSurgePredictions();
    const interval = setInterval(fetchSurgePredictions, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchSurgePredictions]);

  const getMultiplierColor = (multiplier: string | undefined) => {
    if (!multiplier) return "bg-primary text-primary-foreground";
    const val = parseFloat(String(multiplier).replace("x", ""));
    if (isNaN(val)) return "bg-primary text-primary-foreground";
    if (val >= 2.0) return "bg-destructive text-destructive-foreground";
    if (val >= 1.5) return "bg-accent text-accent-foreground";
    return "bg-primary text-primary-foreground";
  };

  const getConfidenceVariant = (confidence: string): "default" | "secondary" | "outline" => {
    if (confidence === "High") return "default";
    if (confidence === "Medium") return "secondary";
    return "outline";
  };

  return (
    <Card className="glass border-0 rounded-2xl">
      <CardHeader className="pb-2 space-y-2">
        <div className="flex items-center justify-between">
          <CardTitle className="font-display font-semibold text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Live Surge Predictions
            <span className="text-xs text-muted-foreground font-normal flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {city}
            </span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchSurgePredictions}
            disabled={loading}
            className="text-xs"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Updating…" : "Refresh"}
          </Button>
        </div>
        <WeatherBadge city={city} />
      </CardHeader>
      <CardContent className="space-y-3">
        {loading && !surgeData && (
          <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            Analysing surge patterns for {city}…
          </div>
        )}

        {surgeData && (
          <>
            <p className="text-xs text-muted-foreground">{surgeData.summary}</p>
            <div className="space-y-2">
              {surgeData.areas.map((area, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between rounded-lg px-4 py-3 ${
                    area.area === surgeData.best_area
                      ? "bg-accent/10 border border-accent/30"
                      : "bg-muted/30"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{area.area || "Unknown"}</span>
                    {area.area === surgeData.best_area && (
                      <span className="text-[10px] bg-accent/20 text-accent px-2 py-0.5 rounded-full font-semibold">
                        BEST
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getMultiplierColor(area.multiplier)}`}>
                      {area.multiplier || "N/A"}
                    </span>
                    <Badge variant={getConfidenceVariant(area.confidence)}>{area.confidence || "?"}</Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-1">
              {surgeData.areas.map((area, i) => (
                <p key={i} className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{area.area}:</span> {area.tip}
                </p>
              ))}
            </div>
            {lastUpdated && (
              <p className="text-[10px] text-muted-foreground text-right">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
