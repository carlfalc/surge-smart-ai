import { useEffect, useRef, useState } from "react";
import { useHeatMap, getCityCenter } from "@/hooks/useHeatMap";
import { useAuth } from "@/contexts/AuthContext";
import { WeatherBadge } from "@/components/dashboard/WeatherBadge";
import { Button } from "@/components/ui/button";
import { CitySearch } from "@/components/ui/CitySearch";
import { RefreshCw } from "lucide-react";

function getZoneColor(demand: number) {
  if (demand > 70) return "#ef4444";
  return "#f59e0b";
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
  severity: "clear" | "warning" | "danger";
}

function useForecastAlert(city: string, coords?: { lat: number; lng: number }): ForecastAlert {
  const [alert, setAlert] = useState<ForecastAlert>({ emoji: "☀️", text: "Clear conditions next 2hrs", severity: "clear" });

  useEffect(() => {
    if (!city) return;

    const fetchForecast = async () => {
      try {
        let lat: number, lon: number;
        if (coords) {
          lat = coords.lat;
          lon = coords.lng;
        } else {
          const geoRes = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
          );
          const geoData = await geoRes.json();
          if (!geoData.results?.[0]) return;
          lat = geoData.results[0].latitude;
          lon = geoData.results[0].longitude;
        }

        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=weathercode,rain&forecast_days=1`
        );
        const data = await res.json();
        if (!data.hourly?.time) return;

        const now = new Date();
        const currentHour = now.getHours();
        const times: string[] = data.hourly.time;
        const rainValues: number[] = data.hourly.rain;
        const weatherCodes: number[] = data.hourly.weathercode;

        const upcoming: { hour: number; rain: number; code: number }[] = [];
        for (let i = 0; i < times.length && upcoming.length < 2; i++) {
          const h = new Date(times[i]).getHours();
          if (h > currentHour && h <= currentHour + 2) {
            upcoming.push({ hour: h, rain: rainValues[i], code: weatherCodes[i] });
          }
        }

        const heavyRain = upcoming.some((u) => u.rain > 2 || u.code >= 80);
        const lightRain = upcoming.some((u) => u.rain > 0.5 || u.code >= 51);

        if (heavyRain) {
          setAlert({ emoji: "⛈️", text: "Heavy rain — high surge incoming!", severity: "danger" });
        } else if (lightRain) {
          setAlert({ emoji: "🌧️", text: "Rain moving in — surge likely", severity: "warning" });
        } else {
          setAlert({ emoji: "☀️", text: "Clear conditions next 2hrs", severity: "clear" });
        }
      } catch {
        setAlert({ emoji: "☀️", text: "Clear conditions next 2hrs", severity: "clear" });
      }
    };

    fetchForecast();
  }, [city, coords?.lat, coords?.lng]);

  return alert;
}

function getForecastPillClasses(severity: "clear" | "warning" | "danger") {
  if (severity === "danger") return "bg-destructive/10 border-destructive/20 text-destructive";
  if (severity === "warning") return "bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400";
  return "bg-muted border-border text-muted-foreground";
}

export function HeatMap() {
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.id = 'leaflet-css';
    if (!document.getElementById('leaflet-css')) {
      document.head.appendChild(link);
    }
  }, []);

  const { profile } = useAuth();
  const [city, setCity] = useState(profile?.city || "Auckland");
  const [cityCoords, setCityCoords] = useState<{ lat: number; lng: number } | undefined>(
    profile?.city_lat && profile?.city_lng
      ? { lat: Number(profile.city_lat), lng: Number(profile.city_lng) }
      : undefined
  );
  const { zones, loading, refresh, resolvedCoords } = useHeatMap(city, cityCoords);
  const forecastAlert = useForecastAlert(city, cityCoords || resolvedCoords || undefined);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<any>(null);
  const circlesRef = useRef<any[]>([]);

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;
    import("leaflet").then((L) => {
      const center = getCityCenter(city, cityCoords);
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

  useEffect(() => {
    if (!leafletMapRef.current) return;
    const center = getCityCenter(city, cityCoords);
    leafletMapRef.current.setView([center.lat, center.lng], 13);
  }, [city, cityCoords]);

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

        const pinLat = zone.pin_lat ?? zone.lat;
        const pinLng = zone.pin_lng ?? zone.lng;
        const icon = L.divIcon({
          className: '',
          html: `<div style="
            background: ${color};
            border: 2px solid white;
            border-radius: 50%;
            width: 12px;
            height: 12px;
            box-shadow: 0 0 8px rgba(0,0,0,0.6);
          "></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });
        const marker = L.marker([pinLat, pinLng], { icon })
          .bindPopup(`<strong>${zone.name}</strong><br/>Best pickup spot<br/>Demand: ${zone.demand}/100`)
          .addTo(leafletMapRef.current);
        circlesRef.current.push(marker);
      });
    });
  }, [zones]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-[220px]">
          <CitySearch
            value={city}
            onSelect={(c) => {
              setCity(c.name);
              setCityCoords({ lat: c.lat, lng: c.lng });
            }}
          />
        </div>

        <WeatherBadge city={city} />

        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${getForecastPillClasses(forecastAlert.severity)}`}>
          {forecastAlert.emoji} {forecastAlert.text}
        </span>

        <Button variant="ghost" size="sm" onClick={refresh} disabled={loading} className="text-xs">
          <RefreshCw className={`h-3 w-3 mr-1 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Updating…" : "Refresh"}
        </Button>

        <div className="flex items-center gap-3 ml-auto text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full inline-block" style={{ background: "#f59e0b" }} /> Medium</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-destructive inline-block" /> High</span>
        </div>
      </div>

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
