import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useGeocoding, GeocodingResult } from "@/hooks/useGeocoding";
import { MapPin, Loader2, Search } from "lucide-react";

interface CitySelection {
  name: string;
  lat: number;
  lng: number;
  display: string;
  type?: string;
  class?: string;
}

interface CitySearchProps {
  value?: string;
  onSelect: (city: CitySelection) => void;
  placeholder?: string;
}

export function CitySearch({ value, onSelect, placeholder = "Search any address worldwide..." }: CitySearchProps) {
  const [query, setQuery] = useState(value || "");
  const [open, setOpen] = useState(false);
  const { results, loading, search, clear } = useGeocoding();
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
    const shortDisplay = [r.name, r.admin1, r.country].filter(Boolean).join(", ");
    setQuery(shortDisplay);
    setOpen(false);
    clear();
    onSelect({
      name: r.name,
      lat: r.latitude,
      lng: r.longitude,
      display: shortDisplay,
      type: r.type,
      class: r.class,
    });
  };

  return (
    <div ref={wrapperRef} className="relative" style={{ zIndex: 9999 }}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className="pl-9 pr-9"
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
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0"
              onClick={() => handleSelect(r)}
            >
              <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{r.name}</p>
                <p className="text-xs text-muted-foreground truncate">{r.display}</p>
              </div>
            </button>
          ))}
        </div>
      )}
      {open && !loading && results.length === 0 && query.length >= 3 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-background/95 backdrop-blur-md shadow-lg px-4 py-3 text-sm text-muted-foreground">
          No results found for "{query}"
        </div>
      )}
    </div>
  );
}
