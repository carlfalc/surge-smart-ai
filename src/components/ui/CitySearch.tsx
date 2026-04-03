import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useGeocoding, GeocodingResult } from "@/hooks/useGeocoding";
import { MapPin, Loader2 } from "lucide-react";

interface CitySelection {
  name: string;
  lat: number;
  lng: number;
  display: string;
}

interface CitySearchProps {
  value?: string;
  onSelect: (city: CitySelection) => void;
  placeholder?: string;
}

export function CitySearch({ value, onSelect, placeholder = "Search any city…" }: CitySearchProps) {
  const [query, setQuery] = useState(value || "");
  const [open, setOpen] = useState(false);
  const { results, loading, search } = useGeocoding();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value && !query) setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleChange = (val: string) => {
    setQuery(val);
    search(val);
    setOpen(true);
  };

  const handleSelect = (r: GeocodingResult) => {
    setQuery(r.display);
    setOpen(false);
    onSelect({ name: r.name, lat: r.latitude, lng: r.longitude, display: r.display });
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className="pl-9"
          onFocus={() => results.length > 0 && setOpen(true)}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-background/95 backdrop-blur-md shadow-lg max-h-56 overflow-y-auto">
          {results.map((r, i) => (
            <button
              key={`${r.latitude}-${r.longitude}-${i}`}
              type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors flex items-center gap-2"
              onClick={() => handleSelect(r)}
            >
              <MapPin className="h-3 w-3 text-primary shrink-0" />
              <span>{r.display}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
