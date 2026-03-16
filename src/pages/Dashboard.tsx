import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  TrendingUp, Map, Clock, Zap, DollarSign, Settings, HelpCircle, 
  ChevronLeft, ChevronRight, Bell, Fuel, BarChart3, Navigation, LogOut, CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth, TIERS } from "@/contexts/AuthContext";
import { SurgePredictionCard } from "@/components/dashboard/SurgePredictionCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const navItems = [
  { icon: BarChart3, label: "Dashboard", id: "dashboard" },
  { icon: Map, label: "Heat Map", id: "heatmap" },
  { icon: TrendingUp, label: "Surge Predict", id: "surge" },
  { icon: Navigation, label: "Positioning", id: "positioning" },
  { icon: DollarSign, label: "Earnings", id: "earnings" },
  { icon: Fuel, label: "Fuel & EV", id: "fuel" },
  { icon: Clock, label: "Shift Planner", id: "shifts" },
  { icon: Bell, label: "Alerts", id: "alerts" },
];

const bottomNav = [
  { icon: CreditCard, label: "Subscription", id: "subscription" },
  { icon: Settings, label: "Settings", id: "settings" },
  { icon: HelpCircle, label: "Help", id: "help", link: "/help" },
];

const StatCard = ({ label, value, change, positive }: { label: string; value: string; change: string; positive: boolean }) => (
  <div className="glass rounded-xl p-4">
    <p className="text-xs text-muted-foreground mb-1">{label}</p>
    <p className="text-2xl font-display font-bold">{value}</p>
    <p className={`text-xs mt-1 ${positive ? "text-accent" : "text-destructive"}`}>{change}</p>
  </div>
);

const Dashboard = () => {
  const { user, profile, loading, subscribed, productId, signOut } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [loading, user, navigate]);

  const handleCheckout = async (priceId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (e: any) {
      toast.error(e.message || "Checkout failed");
    }
  };

  const handlePortal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (e: any) {
      toast.error(e.message || "Could not open billing portal");
    }
  };

  const currentTier = productId === TIERS.fleet.product_id ? "Fleet Manager" : productId === TIERS.pro.product_id ? "Pro Driver" : "Basic (Free)";

  if (loading) {
    return (
      <div className="dark min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <motion.aside
        className="h-screen sticky top-0 border-r border-border bg-card flex flex-col"
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-2 p-4 border-b border-border">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && <span className="font-display font-bold text-sm">TaxiFlow AI</span>}
        </div>

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                activeTab === item.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-2 border-t border-border space-y-1">
          {bottomNav.map((item) => (
            <button
              key={item.id}
              onClick={() => item.link ? navigate(item.link) : setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                activeTab === item.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          ))}
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted transition-colors"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </motion.aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-display font-bold">
                {profile?.full_name ? `Hey, ${profile.full_name}` : "Welcome back"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {currentTier} plan • {profile?.city || "Auckland"}
              </p>
            </div>
            {!subscribed && (
              <Button variant="hero" size="sm" onClick={() => setActiveTab("subscription")}>
                Upgrade to Pro
              </Button>
            )}
          </div>

          {activeTab === "subscription" ? (
            <div className="space-y-6">
              <h2 className="text-xl font-display font-bold">Subscription</h2>
              <p className="text-sm text-muted-foreground">Current plan: <strong>{currentTier}</strong></p>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className={`glass rounded-xl p-6 ${!subscribed ? "border-2 border-primary/30" : ""}`}>
                  <h3 className="font-display font-semibold">Basic</h3>
                  <p className="text-2xl font-bold mt-2">Free</p>
                  <p className="text-xs text-muted-foreground mt-1">5 predictions/day</p>
                  {!subscribed && <p className="text-xs text-accent mt-2">Your current plan</p>}
                </div>
                <div className={`glass rounded-xl p-6 ${productId === TIERS.pro.product_id ? "border-2 border-accent/50 shadow-accent-glow" : ""}`}>
                  <h3 className="font-display font-semibold">Pro Driver</h3>
                  <p className="text-2xl font-bold mt-2">$19.99<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                  <p className="text-xs text-muted-foreground mt-1">Unlimited predictions + route optimization</p>
                  {productId === TIERS.pro.product_id ? (
                    <Button variant="outline" size="sm" className="mt-3 w-full" onClick={handlePortal}>Manage</Button>
                  ) : (
                    <Button variant="hero" size="sm" className="mt-3 w-full" onClick={() => handleCheckout(TIERS.pro.price_id)}>
                      Start Free Trial
                    </Button>
                  )}
                </div>
                <div className={`glass rounded-xl p-6 ${productId === TIERS.fleet.product_id ? "border-2 border-accent/50 shadow-accent-glow" : ""}`}>
                  <h3 className="font-display font-semibold">Fleet Manager</h3>
                  <p className="text-2xl font-bold mt-2">$49.99<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                  <p className="text-xs text-muted-foreground mt-1">Up to 10 drivers + fleet analytics</p>
                  {productId === TIERS.fleet.product_id ? (
                    <Button variant="outline" size="sm" className="mt-3 w-full" onClick={handlePortal}>Manage</Button>
                  ) : (
                    <Button variant="hero" size="sm" className="mt-3 w-full" onClick={() => handleCheckout(TIERS.fleet.price_id)}>
                      Start Free Trial
                    </Button>
                  )}
                </div>
              </div>

              {subscribed && (
                <Button variant="outline" onClick={handlePortal}>Manage Subscription in Stripe</Button>
              )}
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard label="Today's Earnings" value="$187.40" change="↑ 12% vs avg" positive />
                <StatCard label="Active Hours" value="6.2h" change="On track" positive />
                <StatCard label="Trips Completed" value="14" change="↑ 3 vs yesterday" positive />
                <StatCard label="Avg Surge" value="1.6x" change="↑ 0.3x higher" positive />
              </div>

              {/* Content grid */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Surge prediction — live AI */}
                <SurgePredictionCard />

                {/* Platform comparison */}
                <div className="glass rounded-2xl p-6">
                  <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-accent" />
                    Platform Rates — Right Now
                  </h3>
                  <div className="space-y-3">
                    {[
                      { platform: "Uber", base: "$14.20", surge: "1.8x", total: "$25.56", best: false },
                      { platform: "Lyft", base: "$15.10", surge: "2.1x", total: "$31.71", best: true },
                      { platform: "Ola", base: "$12.80", surge: "1.5x", total: "$19.20", best: false },
                    ].map((p) => (
                      <div
                        key={p.platform}
                        className={`flex items-center justify-between rounded-lg px-4 py-3 ${
                          p.best ? "bg-accent/10 border border-accent/30" : "bg-muted/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium w-12">{p.platform}</span>
                          <span className="text-xs text-muted-foreground">{p.base} × {p.surge}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {p.best && <span className="text-[10px] bg-accent/20 text-accent px-2 py-0.5 rounded-full font-semibold">BEST</span>}
                          <span className={`text-sm font-bold ${p.best ? "text-accent" : ""}`}>{p.total}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Heat map */}
                <div className="glass rounded-2xl p-6">
                  <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                    <Map className="h-4 w-4 text-primary" />
                    Demand Heat Map
                  </h3>
                  <div className="aspect-video bg-muted/30 rounded-xl flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute rounded-full"
                          style={{
                            left: `${20 + Math.random() * 60}%`,
                            top: `${20 + Math.random() * 60}%`,
                            width: 30 + Math.random() * 40,
                            height: 30 + Math.random() * 40,
                            background: i < 3
                              ? "radial-gradient(circle, hsl(150 100% 42% / 0.3), transparent)"
                              : i < 6
                              ? "radial-gradient(circle, hsl(220 100% 55% / 0.3), transparent)"
                              : "radial-gradient(circle, hsl(40 100% 55% / 0.2), transparent)",
                          }}
                          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 3 + i * 0.5, repeat: Infinity }}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground relative z-10">Live demand visualization</p>
                  </div>
                </div>

                {/* Shift recommendations */}
                <div className="glass rounded-2xl p-6">
                  <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    AI Shift Recommendations
                  </h3>
                  <div className="space-y-3">
                    {[
                      { shift: "Morning Rush", time: "6:30 AM - 9:30 AM", est: "$95-120", score: 87 },
                      { shift: "Lunch Hour", time: "11:30 AM - 1:30 PM", est: "$45-65", score: 62 },
                      { shift: "Evening Peak", time: "5:00 PM - 8:00 PM", est: "$130-175", score: 94 },
                      { shift: "Late Night", time: "10:00 PM - 1:00 AM", est: "$80-110", score: 78 },
                    ].map((s) => (
                      <div key={s.shift} className="flex items-center justify-between bg-muted/30 rounded-lg px-4 py-3">
                        <div>
                          <p className="text-sm font-medium">{s.shift}</p>
                          <p className="text-xs text-muted-foreground">{s.time}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-accent">{s.est}</p>
                          <p className="text-xs text-muted-foreground">Score: {s.score}/100</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
