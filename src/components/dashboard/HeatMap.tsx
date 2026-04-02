import { useState } from "react";
import { MapContainer, TileLayer, Circle, Popup, useMap } from "react-leaflet";
import L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});
import { useHeatMap, getCityCenter, DemandZone } from "@/hooks/useHeatMap";
import { useWeather } from "@/hooks/useWeather";
import { useAuth } from "@/contexts/AuthContext";
import { WeatherBadge } from "@/components/dashboard/WeatherBadge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, MapPin } from "lucide-react";

const CITIES = [
  "Auckland", "Wellington", "Christchurch", "Hamilton", "Tauranga",
  "Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide",
  "London", "Manchester", "Birmingham",
  "New York", "Los Angeles", "Chicago",
];

function getZoneColor(demand: number) {
  if (demand > 70) return "hsl(0, 84%, 60%)";
  if (demand >= 40) return "hsl(45, 100%, 50%)";
  return "hsl(150, 100%, 40%)";
}

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  map.setView([lat, lng], 13);
  return null;
}

export function HeatMap() {
  const { profile } = useAuth();
  const [city, setCity] = useState(profile?.city || "Auckland");
  const { zones, loading, refresh } = useHeatMap(city);
  const center = getCityCenter(city);

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
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full inline-block" style={{ background: "hsl(45, 100%, 50%)" }} /> Medium</span>
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
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={13}
          className="h-full w-full"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <RecenterMap lat={center.lat} lng={center.lng} />
          {zones.map((zone, i) => (
            <Circle
              key={`${zone.name}-${i}`}
              center={[zone.lat, zone.lng]}
              radius={zone.radius}
              pathOptions={{
                color: getZoneColor(zone.demand),
                fillColor: getZoneColor(zone.demand),
                fillOpacity: 0.35,
                weight: 2,
              }}
            >
              <Popup>
                <div className="text-sm space-y-1">
                  <p className="font-semibold">{zone.name}</p>
                  <p>Demand: <strong>{zone.demand}/100</strong></p>
                  <p className="capitalize">Type: {zone.type}</p>
                  <p className="text-muted-foreground">{zone.reason}</p>
                </div>
              </Popup>
            </Circle>
          ))}
        </MapContainer>
      </div>

      {zones.length > 0 && (
        <p className="text-[10px] text-muted-foreground text-right">
          {zones.length} zones loaded • Last updated: {new Date().toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
