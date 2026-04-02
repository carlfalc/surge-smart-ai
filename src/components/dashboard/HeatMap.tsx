import { useEffect, useRef, useState } from "react";
import { useHeatMap, getCityCenter } from "@/hooks/useHeatMap";
import { useAuth } from "@/contexts/AuthContext";
import { WeatherBadge } from "@/components/dashboard/WeatherBadge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, MapPin } from "lucide-react";

const CITIES = ["Auckland","Wellington","Christchurch","Hamilton","Tauranga","Sydney","Melbourne","Brisbane","Perth","Adelaide","London","Manchester","Birmingham","New York","Los Angeles","Chicago"];

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

function getZoneColor(demand: number) {
  if (demand > 70) return "#ef4444";
  if (demand >= 40) return "#f59e0b";
  return "#22c55e";
}

function getWeatherEmoji(code: number) {
  if (code === 0) return "☀️";
  if (code <= 3) return "⛅";
  if (code <= 49) return "🌫️";
  if (code <= 59) return "🌦️";
  if (code <= 69) return "🌧️";
  if (code <= 79) return "❄️";
  if (code <= 84) return "🌦️";
  if (code <= 94) return "⛈️";
  return "🌪️";
}

interface ForecastAlert {
  emoji: string;
  text: string;
}

function useForecastAlert(city: string): ForecastAlert | null {
  const [alert, setAlert] = useState<ForecastAlert | null>(null);

  useEffect(() => {
    if (!city) return;
    const coords = CITY_COORDS[city];
    if (!coords) return;

    const fetchForecast = async () => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&hourly=weathercode,rain&forecast_days=1`
        );
        const data = await res.json();
        if (!data.hourly?.time) return;

        const now = new Date();
        const currentHour = now.getHours();
        const times: string[] = data.hourly.time;
        const rainValues: number[] = data.hourly.rain;
        const weatherCodes: number[] = data.hourly.weathercode;

        // Find next 2 hours
        const upcoming: { hour: number; rain: number; code: number }[] = [];
        for (let i = 0; i < times.length && upcoming.length < 2; i++) {
          const h = new Date(times[i]).getHours();
          if (h > currentHour && h <= currentHour + 2) {
            upcoming.push({ hour: h, rain: rainValues[i], code: weatherCodes[i] });
          }
        }

        const hasRain = upcoming.some((u) => u.rain > 0.5 || u.code >= 51);
        if (hasRain && upcoming.length > 0) {
          const startHour = upcoming[0].hour;
          const endHour = upcoming[upcoming.length - 1].hour + 1;
          const emoji = getWeatherEmoji(upcoming.find((u) => u.rain > 0.5)?.code || 61);
          setAlert({
            emoji,
            text: `Rain moving in — ${String(startHour).padStart(2, "0")}:00–${String(endHour).padStart(2, "0")}:00 · High surge likely`,
          });
        } else {
          setAlert(null);
        }
      } catch {
        setAlert(null);
      }
    };

    fetchForecast();
  }, [city]);

  return alert;
}

export function HeatMap() {
  const { profile } = useAuth();
  const [city, setCity] = useState(profile?.city || "Auckland");
  const { zones, loading, refresh } = useHeatMap(city);
  const forecastAlert = useForecastAlert(city);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<any>(null);
  const circlesRef = useRef<any[]>([]);

  // Init map once
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;
    import("leaflet").then((L) => {
      const center = getCityCenter(city);
      const map = L.map(mapRef.current!, { zoomControl: true, scrollWheelZoom: true });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap',
      }).addTo(map);
      map.setView([center.lat, center.lng], 13);
      leafletMapRef.current = map;
    });
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Recenter when city changes
  useEffect(() => {
    if (!leafletMapRef.current) return;
    const center = getCityCenter(city);
    leafletMapRef.current.setView([center.lat, center.lng], 13);
  }, [city]);

  // Draw zones
  useEffect(() => {
    if (!leafletMapRef.current || zones.length === 0) return;
    import("leaflet").then((L) => {
      circlesRef.current.forEach((c: any) => c.remove());
      circlesRef.current = [];
      zones.forEach((zone) => {
        const color = getZoneColor(zone.demand);
        const circle = L.circle([zone.lat, zone.lng], {
          radius: zone.radius,
          color,
          fillColor: color,
          fillOpacity: 0.35,
          weight: 2,
        })
          .bindPopup(
            `<div style="font-size:13px"><p style="font-weight:600">${zone.name}</p><p>Demand: <strong>${zone.demand}/100</strong></p><p>Type: ${zone.type}</p><p style="opacity:0.7">${zone.reason}</p></div>`
          )
          .addTo(leafletMapRef.current);
        circlesRef.current.push(circle);

        // Add pin marker for best pickup hotspot
        if (zone.pin_lat != null && zone.pin_lng != null) {
          const icon = L.divIcon({
            className: '',
            html: `<div style="
              background: ${color};
              border: 2px solid white;
              border-radius: 50%;
              width: 12px;
              height: 12px;
              box-shadow: 0 0 6px rgba(0,0,0,0.5);
            "></div>`,
            iconSize: [12, 12],
            iconAnchor: [6, 6],
          });
          const marker = L.marker([zone.pin_lat, zone.pin_lng], { icon })
            .bindPopup(`<strong>${zone.name}</strong><br/>Best pickup spot<br/>Demand: ${zone.demand}/100`)
            .addTo(leafletMapRef.current);
          circlesRef.current.push(marker);
        }
      });
    });
  }, [zones]);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger className="w-[180px] glass border-0">
            <MapPin className="h-3 w-3 mr-1 text-primary" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CITIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <WeatherBadge city={city} />

        {forecastAlert && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 border border-destructive/20 px-3 py-1 text-xs font-medium text-destructive">
            {forecastAlert.emoji} {forecastAlert.text}
          </span>
        )}

        <Button variant="ghost" size="sm" onClick={refresh} disabled={loading} className="text-xs">
          <RefreshCw className={`h-3 w-3 mr-1 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Updating…" : "Refresh"}
        </Button>

        {/* Legend */}
        <div className="flex items-center gap-3 ml-auto text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-accent inline-block" /> Low</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full inline-block" style={{ background: "#f59e0b" }} /> Medium</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-destructive inline-block" /> High</span>
        </div>
      </div>

      {/* Map */}
      <div className="h-[500px] w-full rounded-2xl overflow-hidden border border-border relative">
        {loading && zones.length === 0 && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-background/80">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Loading demand zones for {city}…
            </div>
          </div>
        )}
        <div ref={mapRef} className="h-full w-full" />
      </div>

      {zones.length > 0 && (
        <p className="text-[10px] text-muted-foreground text-right">
          {zones.length} zones loaded • Last updated: {new Date().toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
