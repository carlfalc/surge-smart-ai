import { useEffect, useState, useCallback, useRef } from "react";

export interface DemandZone {
  name: string;
  lat: number;
  lng: number;
  demand: number;
  radius: number;
  type: "nightlife" | "transport" | "business" | "residential" | "shopping" | "stadium";
  reason: string;
  pin_lat?: number;
  pin_lng?: number;
}

const DEFAULT_CENTER = { lat: -36.8509, lng: 174.7645 };

async function geocodeCity(city: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
    );
    const data = await res.json();
    if (data.results?.[0]) {
      return { lat: data.results[0].latitude, lng: data.results[0].longitude };
    }
  } catch {}
  return null;
}

const geoCache = new Map<string, { lat: number; lng: number }>();

export function getCityCenter(city: string, coords?: { lat: number; lng: number }) {
  if (coords) return coords;
  if (geoCache.has(city)) return geoCache.get(city)!;
  return DEFAULT_CENTER;
}

export function useHeatMap(city: string, coords?: { lat: number; lng: number }) {
  const [zones, setZones] = useState<DemandZone[]>([]);
  const [loading, setLoading] = useState(false);
  const [resolvedCoords, setResolvedCoords] = useState<{ lat: number; lng: number } | null>(coords || null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (coords) {
      setResolvedCoords(coords);
      geoCache.set(city, coords);
      return;
    }
    geocodeCity(city).then((result) => {
      if (result) {
        geoCache.set(city, result);
        setResolvedCoords(result);
      } else {
        setResolvedCoords(DEFAULT_CENTER);
      }
    });
  }, [city, coords?.lat, coords?.lng]);

  const refresh = useCallback(async () => {
    if (!city || !resolvedCoords) return;
    setLoading(true);

    try {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-NZ", { hour: "2-digit", minute: "2-digit", hour12: true });
      const dayOfWeek = now.toLocaleDateString("en-NZ", { weekday: "long" });

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
              content: `You are a rideshare demand analyst. It is currently ${timeStr} on ${dayOfWeek} in ${city} (lat: ${resolvedCoords.lat}, lng: ${resolvedCoords.lng}).

Using your real knowledge of ${city}'s geography and landmarks, return a JSON array of 8-12 demand zones where rideshare demand is currently likely to be elevated.

Each zone must have ACCURATE real-world coordinates for the named location. Use these exact fields:
{
  "name": "Location Name",
  "lat": number,
  "lng": number,
  "demand": number (0-100, based on time of day and venue type),
  "radius": number (metres, 200-800, larger for airports/districts),
  "type": "nightlife"|"transport"|"business"|"residential"|"shopping"|"stadium",
  "reason": "short explanation of why demand is high/low right now",
  "pin_lat": number,
  "pin_lng": number
}

IMPORTANT: pin_lat and pin_lng are REQUIRED fields for every zone. They must be the precise coordinates (6 decimal places) of the single best street-level pickup location within the zone — a specific intersection, station entrance, terminal door or venue entrance. Do not omit these fields.

Score demand realistically based on:
- Time: ${timeStr} — nightlife peaks 10pm-3am, business peaks 7-9am & 5-7pm, airports are steady, shopping peaks midday-5pm
- Day: ${dayOfWeek} — weekends boost nightlife, weekdays boost business
- Venue type and typical patterns for ${city}

Return ONLY a valid JSON array, no markdown, no wrapping.`,
            },
          ],
          type: "heatmap",
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

      const jsonMatch = accumulated.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed: DemandZone[] = JSON.parse(jsonMatch[0]);
        const valid = parsed.filter(
          (z) =>
            z.name &&
            typeof z.lat === "number" &&
            typeof z.lng === "number" &&
            typeof z.demand === "number" &&
            typeof z.radius === "number" &&
            z.demand >= 40
        );
        if (valid.length) setZones(valid);
      }
    } catch (err) {
      console.error("HeatMap fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [city, resolvedCoords]);

  // Trigger refresh when coords resolve
  useEffect(() => {
    if (resolvedCoords) refresh();
  }, [resolvedCoords?.lat, resolvedCoords?.lng]);

  // Set up 15-minute auto-refresh interval only
  useEffect(() => {
    intervalRef.current = setInterval(refresh, 15 * 60 * 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refresh]);

  return { zones, loading, refresh, resolvedCoords };
}
