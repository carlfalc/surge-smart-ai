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

const CITY_COORDS: Record<string, { lat: number; lon: number }> = {
  Auckland: { lat: -36.8509, lon: 174.7645 },
  Wellington: { lat: -41.2866, lon: 174.7756 },
  Christchurch: { lat: -43.5321, lon: 172.6362 },
  Hamilton: { lat: -37.787, lon: 175.2793 },
  Tauranga: { lat: -37.6878, lon: 176.1651 },
  Sydney: { lat: -33.8688, lon: 151.2093 },
  Melbourne: { lat: -37.8136, lon: 144.9631 },
  Brisbane: { lat: -27.4698, lon: 153.0251 },
  Perth: { lat: -31.9505, lon: 115.8605 },
  Adelaide: { lat: -34.9285, lon: 138.6007 },
  London: { lat: 51.5074, lon: -0.1278 },
  Manchester: { lat: 53.4808, lon: -2.2426 },
  Birmingham: { lat: 52.4862, lon: -1.8904 },
  "New York": { lat: 40.7128, lon: -74.006 },
  "Los Angeles": { lat: 34.0522, lon: -118.2437 },
  Chicago: { lat: 41.8781, lon: -87.6298 },
};

export function getCityCenter(city: string) {
  const coords = CITY_COORDS[city];
  if (coords) return { lat: coords.lat, lng: coords.lon };
  return { lat: -36.8509, lng: 174.7645 }; // default Auckland
}

const CITY_LANDMARKS: Record<string, string> = {
  Auckland: "Britomart, Viaduct Harbour, Ponsonby, Sky City, Auckland Airport, Newmarket, Parnell, K Road, Mt Eden, Takapuna",
  Wellington: "Courtenay Place, Cuba Street, Lambton Quay, Wellington Airport, Te Aro, Thorndon, Newtown",
  Christchurch: "Cathedral Square, Christchurch Airport, Riccarton, Sumner, Merivale",
  Sydney: "CBD/Circular Quay, Kings Cross, Darling Harbour, Sydney Airport, Bondi, Surry Hills, Newtown, Barangaroo",
  Melbourne: "CBD/Flinders St, Southbank, St Kilda, Melbourne Airport, Fitzroy, Chapel Street, Richmond",
  Brisbane: "CBD/Queen Street, Fortitude Valley, South Bank, Brisbane Airport, West End, New Farm",
  London: "Soho, Liverpool Street, Heathrow Airport, Canary Wharf, Kings Cross, Shoreditch, Westminster, Camden",
  Manchester: "Deansgate, Northern Quarter, Manchester Airport, Piccadilly, Oxford Road, Ancoats",
  "New York": "Midtown Manhattan, JFK Airport, Times Square, Brooklyn Downtown, LaGuardia, Lower East Side, SoHo, Williamsburg",
  "Los Angeles": "Downtown LA, LAX Airport, Hollywood, Santa Monica, Beverly Hills, WeHo",
  Chicago: "The Loop, O'Hare Airport, Wicker Park, River North, Lincoln Park, Wrigleyville",
};

export function useHeatMap(city: string) {
  const [zones, setZones] = useState<DemandZone[]>([]);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const refresh = useCallback(async () => {
    if (!city) return;
    setLoading(true);

    try {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-NZ", { hour: "2-digit", minute: "2-digit", hour12: true });
      const dayOfWeek = now.toLocaleDateString("en-NZ", { weekday: "long" });
      const landmarks = CITY_LANDMARKS[city] || "city centre, airport, main entertainment district, business district";

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
              content: `You are a rideshare demand analyst. It is currently ${timeStr} on ${dayOfWeek} in ${city}.

Using your real knowledge of ${city}'s geography and landmarks (${landmarks}), return a JSON array of 8-12 demand zones where rideshare demand is currently likely to be elevated.

Each zone must have ACCURATE real-world coordinates for the named location. Use these exact fields:
{
  "name": "Location Name",
  "lat": number,
  "lng": number,
  "demand": number (0-100, based on time of day and venue type),
  "radius": number (metres, 200-800, larger for airports/districts),
  "type": "nightlife"|"transport"|"business"|"residential"|"shopping"|"stadium",
  "reason": "short explanation of why demand is high/low right now",
  "pin_lat": number (precise latitude of the single best pickup hotspot within this zone — e.g. a specific intersection, train station entrance, or venue door),
  "pin_lng": number (precise longitude of the best pickup hotspot)
}

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
            typeof z.radius === "number"
        );
        if (valid.length) setZones(valid);
      }
    } catch (err) {
      console.error("HeatMap fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [city]);

  useEffect(() => {
    refresh();
    intervalRef.current = setInterval(refresh, 15 * 60 * 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refresh]);

  return { zones, loading, refresh };
}
