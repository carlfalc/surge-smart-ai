import { useState } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, Map, Clock, Zap, DollarSign, Settings, HelpCircle, 
  ChevronLeft, ChevronRight, Bell, Fuel, BarChart3, Navigation
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const navItems = [
  { icon: BarChart3, label: "Dashboard", active: true },
  { icon: Map, label: "Heat Map" },
  { icon: TrendingUp, label: "Surge Predict" },
  { icon: Navigation, label: "Positioning" },
  { icon: DollarSign, label: "Earnings" },
  { icon: Fuel, label: "Fuel & EV" },
  { icon: Clock, label: "Shift Planner" },
  { icon: Bell, label: "Alerts" },
  { icon: Settings, label: "Settings" },
  { icon: HelpCircle, label: "Help" },
];

const StatCard = ({ label, value, change, positive }: { label: string; value: string; change: string; positive: boolean }) => (
  <div className="glass rounded-xl p-4">
    <p className="text-xs text-muted-foreground mb-1">{label}</p>
    <p className="text-2xl font-display font-bold">{value}</p>
    <p className={`text-xs mt-1 ${positive ? "text-accent" : "text-destructive"}`}>{change}</p>
  </div>
);

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);

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
              key={item.label}
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                item.active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-2 border-t border-border">
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
              <h1 className="text-2xl font-display font-bold">Good afternoon, Driver</h1>
              <p className="text-sm text-muted-foreground">Here's your earnings overview for today</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="hero" size="sm" asChild>
                <Link to="#pricing">Upgrade to Pro</Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Today's Earnings" value="$187.40" change="↑ 12% vs avg" positive />
            <StatCard label="Active Hours" value="6.2h" change="On track" positive />
            <StatCard label="Trips Completed" value="14" change="↑ 3 vs yesterday" positive />
            <StatCard label="Avg Surge" value="1.6x" change="↑ 0.3x higher" positive />
          </div>

          {/* Content grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Surge prediction */}
            <div className="glass rounded-2xl p-6">
              <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Surge Prediction — Next 2 Hours
              </h3>
              <div className="space-y-3">
                {[
                  { time: "Now", area: "CBD", surge: "1.8x", confidence: "92%" },
                  { time: "+30m", area: "Airport", surge: "2.4x", confidence: "87%" },
                  { time: "+60m", area: "Suburbs East", surge: "1.5x", confidence: "78%" },
                  { time: "+90m", area: "Entertainment District", surge: "3.1x", confidence: "71%" },
                ].map((pred) => (
                  <div key={pred.time} className="flex items-center justify-between bg-muted/30 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-10">{pred.time}</span>
                      <span className="text-sm font-medium">{pred.area}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{pred.confidence}</span>
                      <span className="text-sm font-bold text-accent">{pred.surge}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

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

            {/* Heat map placeholder */}
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
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
