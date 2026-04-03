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

async function geocodeCity(city: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
    );
    const data = await res.json();
    if (data.results?.[0]) {
      return { lat: data.results[0].latitude, lon: data.results[0].longitude };
    }
  } catch {}
  return null;
}

export function useWeather(city: string, coords?: { lat: number; lng: number }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!city) return;

    const fetchWeather = async () => {
      setLoading(true);
      try {
        let lat: number, lon: number;

        if (coords) {
          lat = coords.lat;
          lon = coords.lng;
        } else {
          const geo = await geocodeCity(city);
          if (!geo) return;
          lat = geo.lat;
          lon = geo.lon;
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
  }, [city, coords?.lat, coords?.lng]);

  return { weather, loading };
}
