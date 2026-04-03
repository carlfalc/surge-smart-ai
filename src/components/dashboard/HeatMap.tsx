import { useEffect, useRef, useState } from "react";
import { useHeatMap, getCityCenter } from "@/hooks/useHeatMap";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
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

function getSearchZoom(type?: string, cls?: string): number {
  const cityTypes = ["city", "town", "administrative", "state", "country"];
  if (type && cityTypes.includes(type)) return 12;
  if (cls === "boundary") return 12;
  return 15;
}

export function HeatMap() {
  const searchPinRef = useRef<any>(null);

  useEffect(() => {
    const styleId = 'leaflet-css-inline';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `.leaflet-pane,.leaflet-tile,.leaflet-marker-icon,.leaflet-marker-shadow,.leaflet-tile-container,.leaflet-pane>svg,.leaflet-pane>canvas,.leaflet-zoom-box,.leaflet-image-layer,.leaflet-layer{position:absolute;left:0;top:0}.leaflet-container{overflow:hidden}.leaflet-tile,.leaflet-marker-icon,.leaflet-marker-shadow{-webkit-user-select:none;-moz-user-select:none;user-select:none;-webkit-user-drag:none}.leaflet-tile::selection{background:transparent}.leaflet-safari .leaflet-tile{image-rendering:-webkit-optimize-contrast}.leaflet-safari .leaflet-tile-container{width:1600px;height:1600px;-webkit-transform-origin:0 0}.leaflet-marker-icon,.leaflet-marker-shadow{display:block}.leaflet-container .leaflet-overlay-pane svg{max-width:none!important;max-height:none!important}.leaflet-container .leaflet-marker-pane img,.leaflet-container .leaflet-shadow-pane img,.leaflet-container .leaflet-tile-pane img,.leaflet-container img.leaflet-image-layer,.leaflet-container .leaflet-tile{max-width:none!important;max-height:none!important;width:auto;padding:0}.leaflet-container.leaflet-touch-zoom{-ms-touch-action:pan-x pan-y;touch-action:pan-x pan-y}.leaflet-container.leaflet-touch-drag{-ms-touch-action:pinch-zoom;touch-action:none;touch-action:pinch-zoom}.leaflet-container.leaflet-touch-drag.leaflet-touch-zoom{-ms-touch-action:none;touch-action:none}.leaflet-container{-webkit-tap-highlight-color:transparent}.leaflet-container a{-webkit-tap-highlight-color:rgba(51,181,229,.4)}.leaflet-tile{filter:inherit;visibility:hidden}.leaflet-tile-loaded{visibility:inherit}.leaflet-zoom-box{width:0;height:0;-moz-box-sizing:border-box;box-sizing:border-box;z-index:800}.leaflet-overlay-pane svg{-moz-user-select:none}.leaflet-pane{z-index:400}.leaflet-tile-pane{z-index:200}.leaflet-overlay-pane{z-index:400}.leaflet-shadow-pane{z-index:500}.leaflet-marker-pane{z-index:600}.leaflet-tooltip-pane{z-index:650}.leaflet-popup-pane{z-index:700}.leaflet-map-pane canvas{z-index:100}.leaflet-map-pane svg{z-index:200}.leaflet-vml-shape{width:1px;height:1px}.lvml{behavior:url(#default#VML);display:inline-block;position:absolute}.leaflet-control{position:relative;z-index:800;pointer-events:visiblePainted;pointer-events:auto}.leaflet-top,.leaflet-bottom{position:absolute;z-index:1000;pointer-events:none}.leaflet-top{top:0}.leaflet-right{right:0}.leaflet-bottom{bottom:0}.leaflet-left{left:0}.leaflet-control{float:left;clear:both}.leaflet-right .leaflet-control{float:right}.leaflet-top .leaflet-control{margin-top:10px}.leaflet-bottom .leaflet-control{margin-bottom:10px}.leaflet-left .leaflet-control{margin-left:10px}.leaflet-right .leaflet-control{margin-right:10px}.leaflet-fade-anim .leaflet-popup{opacity:0;-webkit-transition:opacity .2s linear;-moz-transition:opacity .2s linear;transition:opacity .2s linear}.leaflet-fade-anim .leaflet-map-pane .leaflet-popup{opacity:1}.leaflet-zoom-animated{-webkit-transform-origin:0 0;-ms-transform-origin:0 0;transform-origin:0 0}svg.leaflet-zoom-animated{will-change:transform}.leaflet-zoom-anim .leaflet-zoom-animated{-webkit-transition:-webkit-transform .25s cubic-bezier(0,0,.25,1);-moz-transition:-moz-transform .25s cubic-bezier(0,0,.25,1);transition:transform .25s cubic-bezier(0,0,.25,1)}.leaflet-zoom-anim .leaflet-tile,.leaflet-pan-anim .leaflet-tile{-webkit-transition:none;-moz-transition:none;transition:none}.leaflet-zoom-anim .leaflet-zoom-animated{will-change:transform}.leaflet-popup{position:absolute;text-align:center;margin-bottom:20px}.leaflet-popup-content-wrapper{padding:1px;text-align:left;border-radius:12px}.leaflet-popup-content{margin:13px 24px 13px 20px;line-height:1.3;font-size:1.08333em}.leaflet-popup-content p{margin:17px 0}.leaflet-popup-tip-container{width:40px;height:20px;position:absolute;left:50%;margin-left:-20px;overflow:hidden;pointer-events:none}.leaflet-popup-tip{width:17px;height:17px;padding:1px;margin:-10px auto 0;pointer-events:auto;-webkit-transform:rotate(45deg);-moz-transform:rotate(45deg);-ms-transform:rotate(45deg);transform:rotate(45deg)}.leaflet-popup-content-wrapper,.leaflet-popup-tip{background:#fff;color:#333;box-shadow:0 3px 14px rgba(0,0,0,.4)}.leaflet-container a.leaflet-popup-close-button{position:absolute;top:0;right:0;border:none;text-align:center;width:24px;height:24px;font:16px/24px Tahoma,Verdana,sans-serif;color:#757575;text-decoration:none;background:transparent}.leaflet-container a.leaflet-popup-close-button:hover,.leaflet-container a.leaflet-popup-close-button:focus{color:#585858}.leaflet-popup-scrolled{overflow:auto}.leaflet-oldie .leaflet-popup-content-wrapper{-ms-zoom:1}.leaflet-oldie .leaflet-popup-tip{width:24px;-ms-filter:"progid:DXImageTransform.Microsoft.Matrix(M11=0.70710678, M12=0.70710678, M21=-0.70710678, M22=0.70710678)";filter:progid:DXImageTransform.Microsoft.Matrix(M11=0.70710678, M12=0.70710678, M21=-0.70710678, M22=0.70710678)}.leaflet-oldie .leaflet-control-zoom,.leaflet-oldie .leaflet-control-layers,.leaflet-oldie .leaflet-control-attribution{border:1px solid #999}.leaflet-div-icon{background:#fff;border:1px solid #666}.leaflet-tooltip{position:absolute;padding:6px;background-color:#fff;border:1px solid #fff;border-radius:3px;color:#222;white-space:nowrap;-webkit-user-select:none;-moz-user-select:none;user-select:none;pointer-events:none;box-shadow:0 1px 3px rgba(0,0,0,.4)}.leaflet-tooltip.leaflet-interactive{cursor:pointer;pointer-events:auto}.leaflet-tooltip-top:before,.leaflet-tooltip-bottom:before,.leaflet-tooltip-left:before,.leaflet-tooltip-right:before{position:absolute;pointer-events:none;border:6px solid transparent;background:transparent;content:""}.leaflet-zoom-anim .leaflet-tile{will-change:transform}.leaflet-control-zoom-in,.leaflet-control-zoom-out{font:bold 18px "Lucida Console",Monaco,monospace;text-indent:1px}.leaflet-touch .leaflet-control-zoom-in{font-size:22px}.leaflet-touch .leaflet-control-zoom-out{font-size:20px}.leaflet-control-attribution{padding:0 5px;background-color:rgba(255,255,255,.8);background-color:rgba(255,255,255,.4)}.leaflet-touch .leaflet-control-attribution,.leaflet-touch .leaflet-control-layers,.leaflet-touch .leaflet-control-zoom{box-shadow:none}.leaflet-touch .leaflet-control-zoom,.leaflet-touch .leaflet-control-layers{border:2px solid rgba(0,0,0,.2);background-clip:padding-box}.leaflet-control-zoom-in,.leaflet-control-zoom-out,.leaflet-control-attribution a{display:block}.leaflet-bar a{background-color:#fff;border-bottom:1px solid #ccc;width:26px;height:26px;line-height:26px;display:block;text-align:center;text-decoration:none;color:black}.leaflet-bar a,.leaflet-control-layers-toggle{background-position:50% 50%;background-repeat:no-repeat;display:block}.leaflet-bar a:hover,.leaflet-bar a:focus{background-color:#f4f4f4}.leaflet-bar a:first-child{border-top-left-radius:4px;border-top-right-radius:4px}.leaflet-bar a:last-child{border-bottom-left-radius:4px;border-bottom-right-radius:4px;border-bottom:none}.leaflet-bar a.leaflet-disabled{cursor:default;background-color:#f4f4f4;color:#bbb}.leaflet-touch .leaflet-bar a{width:30px;height:30px;line-height:30px}.leaflet-touch .leaflet-bar a:first-child{border-top-left-radius:2px;border-top-right-radius:2px}.leaflet-touch .leaflet-bar a:last-child{border-bottom-left-radius:2px;border-bottom-right-radius:2px}.leaflet-control-layers{box-shadow:0 1px 5px rgba(0,0,0,.4);background:#fff;border-radius:5px}.leaflet-control-layers-toggle{background-image:url(images/layers.png);width:36px;height:36px}.leaflet-retina .leaflet-control-layers-toggle{background-image:url(images/layers-2x.png);background-size:26px 26px}.leaflet-touch .leaflet-control-layers-toggle{width:44px;height:44px}.leaflet-control-layers .leaflet-control-layers-list,.leaflet-control-layers-expanded .leaflet-control-layers-toggle{display:none}.leaflet-control-layers-expanded .leaflet-control-layers-list{display:block;position:relative}.leaflet-control-layers-scrollbar{overflow-y:scroll;overflow-x:hidden;padding-right:5px}.leaflet-control-layers-selector{margin-top:2px;position:relative;top:1px}.leaflet-control-layers label{display:block;font-size:1.08333em}.leaflet-control-layers-separator{height:0;border-top:1px solid #ddd;margin:5px -10px}.leaflet-default-icon-path{background-image:url(https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png)}`;
      document.head.appendChild(style);
    }
  }, []);

  const { profile, user, refreshProfile } = useAuth();
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
        <div className="w-[260px]">
          <CitySearch
            value={city}
            onSelect={(c) => {
              setCity(c.name);
              setCityCoords({ lat: c.lat, lng: c.lng });

              // Fly map immediately
              if (leafletMapRef.current) {
                const zoom = getSearchZoom(c.type, c.class);
                leafletMapRef.current.flyTo([c.lat, c.lng], zoom, { duration: 1.2 });

                // Add search pin
                import("leaflet").then((L) => {
                  if (searchPinRef.current) {
                    searchPinRef.current.remove();
                    searchPinRef.current = null;
                  }
                  const icon = L.divIcon({
                    className: '',
                    html: `<div style="
                      background: hsl(221, 83%, 53%);
                      border: 3px solid white;
                      border-radius: 50%;
                      width: 16px;
                      height: 16px;
                      box-shadow: 0 0 12px rgba(59,130,246,0.6);
                    "></div>`,
                    iconSize: [16, 16],
                    iconAnchor: [8, 8],
                  });
                  searchPinRef.current = L.marker([c.lat, c.lng], { icon })
                    .bindPopup(`<strong>${c.display || c.name}</strong><br/>Searched location`)
                    .addTo(leafletMapRef.current);
                });
              }
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
