import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: any | null;
  loading: boolean;
  subscribed: boolean;
  productId: string | null;
  signOut: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  subscribed: false,
  productId: null,
  signOut: async () => {},
  refreshSubscription: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const TIERS = {
  pro: {
    price_id: "price_1T9GdLKnqI7Oju4NdvnHKW5N",
    product_id: "prod_U7VeUdIYIOLgDE",
    name: "Pro Driver",
  },
  fleet: {
    price_id: "price_1T9Gt0KnqI7Oju4NiiHen1eL",
    product_id: "prod_U7VuZn4cdKrknC",
    name: "Fleet Manager",
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();
    setProfile(data);
  };

  const refreshSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (!error && data) {
        setSubscribed(data.subscribed || false);
        setProductId(data.product_id || null);
      }
    } catch (e) {
      console.error("Error checking subscription:", e);
    }
  };

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    const initializeAuth = async () => {
      try {
        // 1. Restore session from storage first
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
          await refreshSubscription();
        }

        // 2. Set up listener AFTER initial session is resolved
        const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            await fetchProfile(session.user.id);
            await refreshSubscription();
          } else {
            setProfile(null);
            setSubscribed(false);
            setProductId(null);
          }
        });
        subscription = data.subscription;
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    return () => subscription?.unsubscribe();
  }, []);

  // Refresh subscription every minute
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(refreshSubscription, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const refreshProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();
    if (data) setProfile(data);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, subscribed, productId, signOut, refreshSubscription, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
