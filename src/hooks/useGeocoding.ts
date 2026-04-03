import { useState, useRef, useCallback } from "react";

export interface GeocodingResult {
  name: string;
  country: string;
  admin1: string;
  latitude: number;
  longitude: number;
  display: string;
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
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=en&format=json`
        );
        const data = await res.json();
        if (data.results) {
          setResults(
            data.results.map((r: any) => ({
              name: r.name,
              country: r.country || "",
              admin1: r.admin1 || "",
              latitude: r.latitude,
              longitude: r.longitude,
              display: [r.name, r.admin1, r.country].filter(Boolean).join(", "),
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
    }, 400);
  }, []);

  return { results, loading, search };
}
