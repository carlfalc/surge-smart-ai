import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Star, Trash2, MapPin, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface FavLocation {
  id: string;
  name: string;
  city: string | null;
  lat: number | null;
  lng: number | null;
  zone_type: string | null;
  notes: string | null;
  created_at: string;
}

interface Props {
  onViewOnMap?: (lat: number, lng: number, name: string) => void;
}

export function FavouriteLocations({ onViewOnMap }: Props) {
  const { user } = useAuth();
  const [locations, setLocations] = useState<FavLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState("");

  const fetchFavourites = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("favourite_locations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setLocations((data as FavLocation[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchFavourites();
  }, [user]);

  const handleDelete = async (id: string) => {
    await supabase.from("favourite_locations").delete().eq("id", id);
    setLocations((prev) => prev.filter((l) => l.id !== id));
    toast.success("Removed from favourites");
  };

  const handleSaveNotes = async (id: string) => {
    await supabase.from("favourite_locations").update({ notes: editNotes }).eq("id", id);
    setLocations((prev) => prev.map((l) => (l.id === id ? { ...l, notes: editNotes } : l)));
    setEditingId(null);
    toast.success("Notes saved");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
        Loading favourites…
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="glass rounded-2xl p-10 max-w-md text-center space-y-4">
          <div className="w-14 h-14 rounded-xl bg-yellow-500/10 flex items-center justify-center mx-auto">
            <Star className="h-7 w-7 text-yellow-500" />
          </div>
          <h2 className="text-xl font-display font-bold">No favourites yet</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Tap the ⭐ star next to any surge zone on your dashboard to save it here. Build your personal list of hotspots.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Favourite Locations
        </h2>
        <span className="text-sm text-muted-foreground">
          You have {locations.length} favourite location{locations.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="divide-y divide-border">
          {locations.map((loc) => (
            <div key={loc.id} className="flex items-center gap-4 px-5 py-4">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 shrink-0" />

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{loc.name}</p>
                <p className="text-xs text-muted-foreground">{loc.city || "—"}</p>
              </div>

              {loc.zone_type && (
                <Badge variant="secondary" className="text-[10px] shrink-0">
                  {loc.zone_type}
                </Badge>
              )}

              <div className="flex-1 min-w-0">
                {editingId === loc.id ? (
                  <div className="flex items-center gap-1">
                    <Input
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      className="h-7 text-xs"
                      placeholder="Add notes…"
                    />
                    <button onClick={() => handleSaveNotes(loc.id)} className="text-accent hover:text-accent/80">
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-foreground">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setEditingId(loc.id); setEditNotes(loc.notes || ""); }}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 truncate"
                  >
                    <Pencil className="h-3 w-3 shrink-0" />
                    {loc.notes || "Add notes…"}
                  </button>
                )}
              </div>

              {loc.lat != null && loc.lng != null && onViewOnMap && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs shrink-0"
                  onClick={() => onViewOnMap(loc.lat!, loc.lng!, loc.name)}
                >
                  <MapPin className="h-3 w-3 mr-1" />
                  View on Map
                </Button>
              )}

              <button
                onClick={() => handleDelete(loc.id)}
                className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
