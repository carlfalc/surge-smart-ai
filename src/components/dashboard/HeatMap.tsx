import { useEffect, useRef, useState } from "react";
import { useHeatMap, getCityCenter } from "@/hooks/useHeatMap";
import { useAuth } from "@/contexts/AuthContext";
import { WeatherBadge } from "@/components/dashboard/WeatherBadge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, MapPin } from "lucide-react";

const CITIES = ["Auckland","Wellington","Christchurch","Hamilton","Tauranga","Sydney","Melbourne","Brisbane","Perth","Adelaide","London","Manchester","Birmingham","New York","Los Angeles","Chicago"];

function getZoneColor(demand: number) {
  if (demand > 70) return "#ef4444";
  if (demand >= 40) return "#f59e0b";
  return "#22c55e";
}

export function HeatMap() {
  const { profile } = useAuth();
  const [city, setCity] = useState(profile?.city || "Auckland");
  const { zones, loading, refresh } = useHeatMap(city);
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
