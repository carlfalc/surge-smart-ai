import { useEffect, useState } from "react";

export interface WeatherData {
  temperature: number;
  rainfall: number;
  windspeed: number;
  weatherCode: number;
  description: string;
  surgeImpact: "high" | "medium" | "low" | "none";
  surgeReason: string;
  emoji: string;
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

const getWeatherDescription = (code: number): { description: string; emoji: string } => {
  if (code === 0) return { description: "Clear sky", emoji: "☀️" };
  if (code <= 3) return { description: "Partly cloudy", emoji: "⛅" };
  if (code <= 9) return { description: "Foggy", emoji: "🌫️" };
  if (code <= 19) return { description: "Drizzle", emoji: "🌦️" };
  if (code <= 29) return { description: "Rain", emoji: "🌧️" };
  if (code <= 39) return { description: "Snow", emoji: "🌨️" };
  if (code <= 49) return { description: "Fog", emoji: "🌫️" };
  if (code <= 59) return { description: "Light drizzle", emoji: "🌦️" };
  if (code <= 69) return { description: "Heavy rain", emoji: "🌧️" };
  if (code <= 79) return { description: "Snow", emoji: "❄️" };
  if (code <= 84) return { description: "Rain showers", emoji: "🌦️" };
  if (code <= 94) return { description: "Thunderstorm", emoji: "⛈️" };
  return { description: "Severe storm", emoji: "🌪️" };
};

const getSurgeImpact = (
  code: number,
  rainfall: number,
  windspeed: number
): { surgeImpact: WeatherData["surgeImpact"]; surgeReason: string } => {
  if (code >= 80 || rainfall > 5) {
    return { surgeImpact: "high", surgeReason: "Heavy rain/storm — expect 1.8x–2.5x surge. Get out now!" };
  }
  if (code >= 51 || rainfall > 1) {
    return { surgeImpact: "medium", surgeReason: "Rain likely — moderate surge expected. Good time to drive." };
  }
  if (windspeed > 40) {
    return { surgeImpact: "medium", surgeReason: "Strong winds — fewer drivers out, surge likely." };
  }
  if (code >= 40 && code <= 49) {
    return { surgeImpact: "low", surgeReason: "Foggy conditions — slightly elevated demand." };
  }
  return { surgeImpact: "none", surgeReason: "Clear conditions — normal demand expected." };
};

export function useWeather(city: string) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!city) return;

    const fetchWeather = async () => {
      setLoading(true);
      try {
        const coords = CITY_COORDS[city];
        let lat: number, lon: number;

        if (coords) {
          lat = coords.lat;
          lon = coords.lon;
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
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
            `&current=temperature_2m,rain,windspeed_10m,weathercode` +
            `&hourly=rain&forecast_days=1`
        );
        const data = await res.json();
        const current = data.current;

        const { description, emoji } = getWeatherDescription(current.weathercode);
        const { surgeImpact, surgeReason } = getSurgeImpact(
          current.weathercode,
          current.rain,
          current.windspeed_10m
        );

        setWeather({
          temperature: Math.round(current.temperature_2m),
          rainfall: current.rain,
          windspeed: Math.round(current.windspeed_10m),
          weatherCode: current.weathercode,
          description,
          emoji,
          surgeImpact,
          surgeReason,
        });
      } catch (err) {
        console.error("Weather fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [city]);

  return { weather, loading };
}
