import { useWeather } from "@/hooks/useWeather";
import { Badge } from "@/components/ui/badge";
import { Cloud } from "lucide-react";

const impactColors: Record<string, string> = {
  high: "bg-destructive text-destructive-foreground",
  medium: "bg-accent text-accent-foreground",
  low: "bg-secondary text-secondary-foreground",
  none: "bg-primary text-primary-foreground",
};

const impactLabels: Record<string, string> = {
  high: "High Surge Risk",
  medium: "Moderate Surge Risk",
  low: "Low Surge Risk",
  none: "Normal Conditions",
};

export function WeatherBadge({ city }: { city: string }) {
  const { weather, loading } = useWeather(city);

  if (loading || !weather) {
    return (
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Cloud className="h-3 w-3 animate-pulse" />
        Loading weather...
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground">
          {weather.emoji} {weather.description} · {weather.temperature}°
          {weather.windspeed > 20 && ` · 💨 ${weather.windspeed}km/h`}
          {weather.rainfall > 0 && ` · 🌧️ ${weather.rainfall}mm`}
        </span>
        <Badge className={impactColors[weather.surgeImpact]}>
          {impactLabels[weather.surgeImpact]}
        </Badge>
      </div>
      <p className="text-[10px] text-muted-foreground">{weather.surgeReason}</p>
    </div>
  );
}
