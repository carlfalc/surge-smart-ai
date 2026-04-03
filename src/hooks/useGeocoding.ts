import { useState, useRef, useCallback } from "react";

export interface GeocodingResult {
  name: string;
  country: string;
  country_code: string;
  admin1: string;
  latitude: number;
  longitude: number;
  display: string;
  type: string;
  class: string;
}

export function useGeocoding() {
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const search = useCallback((query: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!query || query.length < 3) {
      setResults([]);
      return;
    }

    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=6&addressdetails=1`,
          { headers: { 'User-Agent': 'TaxiFlowAI/1.0' } }
        );
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setResults(
            data.map((r: any) => ({
              name: r.name || r.display_name?.split(",")[0] || "",
              country: r.address?.country || "",
              country_code: r.address?.country_code || "",
              admin1: r.address?.state || r.address?.region || "",
              latitude: parseFloat(r.lat),
              longitude: parseFloat(r.lon),
              display: r.display_name || "",
              type: r.type || "",
              class: r.class || "",
            }))
          );
        } else {
          setResults([]);
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
  }, []);

  const clear = useCallback(() => setResults([]), []);

  return { results, loading, search, clear };
}
