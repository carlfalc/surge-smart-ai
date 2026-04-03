import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { CheckCircle, PenLine, ChevronRight, Car, Zap, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CitySearch } from "@/components/ui/CitySearch";

const PLATFORMS = ["Uber", "Ola", "DiDi", "Lyft", "InDriver", "Bolt"];


const STEPS = [
  { id: 1, label: "Welcome" },
  { id: 2, label: "Platform" },
  { id: 3, label: "Earnings Sync" },
  { id: 4, label: "Your Details" },
];

export default function Onboarding() {
  const { user, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const geoRequested = useRef(false);
  const [form, setForm] = useState({
    platforms: [] as string[],
    city: "",
    city_lat: null as number | null,
    city_lng: null as number | null,
    earnings_goal: "",
  });

  // Silently capture geolocation when Step 4 is reached
  useEffect(() => {
    if (step === 4 && !geoRequested.current && navigator.geolocation) {
      geoRequested.current = true;
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {} // silently ignore denial
      );
    }
  }, [step]);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [loading, user, navigate]);

  const togglePlatform = (p: string) => {
    setForm((f) => ({
      ...f,
      platforms: f.platforms.includes(p)
        ? f.platforms.filter((x) => x !== p)
        : [...f.platforms, p],
    }));
  };

  const handleFinish = async () => {
    if (!form.city) { toast.error("Please select your city"); return; }
    if (!user?.id) { toast.error("Not logged in"); return; }
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          preferred_platforms: form.platforms,
          city: form.city,
          earnings_goal: form.earnings_goal ? parseFloat(form.earnings_goal) : 200,
          onboarding_completed: true,
        }, { onConflict: 'user_id' });
      if (error) throw error;
      await supabase
        .from("alert_preferences")
        .upsert({ user_id: user.id }, { onConflict: 'user_id' });
      await refreshProfile();
      toast.success("You're all set! Welcome to TaxiFlow AI 🚀");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="dark min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="absolute inset-0 gradient-glow opacity-30" />

      <motion.div
        className="w-full max-w-2xl relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl">TaxiFlow AI</span>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-center gap-1 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-1">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step > s.id
                      ? "bg-accent text-accent-foreground"
                      : step === s.id
                      ? "gradient-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step > s.id ? <CheckCircle className="h-4 w-4" /> : s.id}
                </div>
                <span className="text-[10px] text-muted-foreground hidden sm:block">
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`w-8 sm:w-12 h-0.5 rounded-full mb-4 sm:mb-3 ${
                    step > s.id ? "bg-accent" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass rounded-2xl p-8"
          >
            {/* Step 1 — Welcome */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
                    <Car className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h2 className="text-2xl font-display font-bold">
                    Welcome to TaxiFlow AI 👋
                  </h2>
                  <p className="text-muted-foreground mt-2">
                    Let's work together to make your driving more profitable.
                    This setup takes less than 2 minutes.
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    { icon: "🎯", title: "Live Surge Predictions", desc: "Know where to be before the surge hits" },
                    { icon: "💰", title: "Earnings Tracking", desc: "Quick manual entry — takes 5 seconds per trip" },
                    { icon: "📊", title: "Platform Comparison", desc: "See which app pays best right now" },
                  ].map((f) => (
                    <div key={f.title} className="flex items-start gap-3 bg-muted/30 rounded-xl p-4">
                      <span className="text-2xl">{f.icon}</span>
                      <div>
                        <p className="font-medium text-sm">{f.title}</p>
                        <p className="text-xs text-muted-foreground">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Button variant="hero" className="w-full" onClick={() => setStep(2)}>
                  Let's Get Started <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Step 2 — Platform Selection */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-display font-bold">Which platforms do you drive for?</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Select all that apply — this personalises your surge predictions and earnings tracking.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {PLATFORMS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => togglePlatform(p)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        form.platforms.includes(p)
                          ? "border-primary bg-primary/5 font-semibold"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{p}</span>
                        {form.platforms.includes(p) && (
                          <CheckCircle className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {form.platforms.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center">
                    Please select at least one platform to continue
                  </p>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button
                    variant="hero"
                    className="flex-1"
                    disabled={form.platforms.length === 0}
                    onClick={() => setStep(3)}
                  >
                    Continue <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3 — Manual Trip Entry */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-display font-bold">How you'll track your earnings</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Simple, fast, and built into your dashboard.
                  </p>
                </div>

                <div className="border-2 border-primary/30 rounded-xl p-6 bg-primary/5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <PenLine className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="font-semibold">Manual Trip Entry</h3>
                      <p className="text-sm text-muted-foreground">
                        The fastest way to track your earnings — takes about 5 seconds per trip.
                        Your platform is pre-selected so you just enter the fare amount.
                      </p>
                      <p className="text-sm text-muted-foreground/80 mt-3">
                        💡 The more trips you log, the smarter your surge predictions get.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-2 border-accent/30 rounded-xl p-6 bg-accent/5">
                  <div className="flex items-center gap-3 mb-4">
                    <FileText className="h-5 w-5 text-accent" />
                    <h3 className="font-semibold">Why Your Entries Matter — TaxiFlow Accounts & Tax</h3>
                  </div>
                  <div className="space-y-3">
                    {[
                      "Every fare you log flows directly into your Earnings tracker — your daily, weekly and annual totals update in real time",
                      "Your entries power the Tax Summary — TaxiFlow automatically calculates your NZ taxable income, tax bracket breakdown and GST obligation from your logged trips",
                      "Expenses + Earnings = your real profit — pair trip entries with fuel, maintenance and insurance costs to see what you actually take home",
                      "Export a tax-ready CSV at year end — no accountant needed, everything is tracked from the moment you log your first fare",
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-accent mt-1.5 shrink-0" />
                        <p className="text-sm text-muted-foreground">{item}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground/70 italic mt-4">
                    The more consistently you log, the more accurate your tax summary and surge predictions become.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button variant="hero" className="flex-1" onClick={() => setStep(4)}>
                    Continue <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4 — City + Goal */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-display font-bold">Almost done! 🎉</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Just two more details to personalise your dashboard.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>What city do you drive in?</Label>
                  <Select
                    value={form.city}
                    onValueChange={(v) => setForm((f) => ({ ...f, city: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your city" />
                    </SelectTrigger>
                    <SelectContent>
                      {CITIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Daily earnings goal ($) — optional</Label>
                  <Input
                    type="number"
                    placeholder="200"
                    value={form.earnings_goal}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, earnings_goal: e.target.value }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    We'll show your progress towards this on the dashboard
                  </p>
                </div>

                {/* Summary */}
                <div className="bg-muted/30 rounded-xl p-4 space-y-1">
                  <p className="text-sm font-semibold mb-2">Your setup summary:</p>
                  <p className="text-xs text-muted-foreground">🚗 Platforms: {form.platforms.join(", ") || "None selected"}</p>
                  <p className="text-xs text-muted-foreground">📧 Earnings sync: Manual entry</p>
                  <p className="text-xs text-muted-foreground">📍 City: {form.city || "Not set"}</p>
                  <p className="text-xs text-muted-foreground">🎯 Daily goal: {form.earnings_goal ? `$${form.earnings_goal}` : "Not set"}</p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setStep(3)}>
                    Back
                  </Button>
                  <Button
                    variant="hero"
                    className="flex-1"
                    onClick={handleFinish}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Go to Dashboard 🚀"}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
