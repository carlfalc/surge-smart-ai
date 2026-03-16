import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { CheckCircle, Mail, PenLine, ChevronRight, Car, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PLATFORMS = ["Uber", "Ola", "DiDi", "Lyft", "InDriver", "Bolt"];

const CITIES = [
  "Auckland", "Wellington", "Christchurch", "Hamilton", "Tauranga",
  "Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide",
  "London", "Manchester", "Birmingham",
  "New York", "Los Angeles", "Chicago",
  "Other",
];

const STEPS = [
  { id: 1, label: "Welcome" },
  { id: 2, label: "Platform" },
  { id: 3, label: "Earnings Sync" },
  { id: 4, label: "Your Details" },
];

export default function Onboarding() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [gmailConnected, setGmailConnected] = useState(false);
  const [form, setForm] = useState({
    platforms: [] as string[],
    city: "",
    earnings_goal: "",
  });

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [loading, user, navigate]);

  // Check for gmail callback
  useEffect(() => {
    const stepParam = searchParams.get("step");
    const gmailParam = searchParams.get("gmail");
    if (stepParam) setStep(parseInt(stepParam));
    if (gmailParam === "connected") setGmailConnected(true);
  }, [searchParams]);

  const togglePlatform = (p: string) => {
    setForm((f) => ({
      ...f,
      platforms: f.platforms.includes(p)
        ? f.platforms.filter((x) => x !== p)
        : [...f.platforms, p],
    }));
  };

  const handleFinish = async () => {
    if (!form.city) {
      toast.error("Please select your city");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          preferred_platforms: form.platforms,
          city: form.city,
          earnings_goal: form.earnings_goal ? parseFloat(form.earnings_goal) : 200,
          onboarding_completed: true,
        })
        .eq("user_id", user?.id);

      if (error) throw error;
      toast.success("You're all set! Welcome to TaxiFlow AI 🚀");
      navigate("/dashboard");
    } catch {
      toast.error("Failed to save settings");
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
                    { icon: "💰", title: "Earnings Tracking", desc: "Automatic via Gmail or quick manual entry" },
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

            {/* Step 3 — Gmail / Earnings Sync */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-display font-bold">How should we track your earnings?</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Choose how TaxiFlow syncs your trip data.
                  </p>
                </div>

                {/* Gmail Option */}
                <div className="border-2 border-primary/30 rounded-xl p-5 bg-primary/5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm">Auto-sync via Gmail</h3>
                        {gmailConnected && (
                          <span className="text-[10px] bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
                            Connected
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        We read your trip receipt emails from {form.platforms.join(", ") || "your platforms"} and
                        automatically log your earnings. No manual entry needed.
                      </p>
                      {!gmailConnected ? (
                        <p className="text-xs text-muted-foreground mt-3 italic">
                          Gmail auto-sync coming soon — use manual entry for now.
                        </p>
                      ) : (
                        <p className="text-xs text-accent mt-3">
                          ✅ Gmail connected — earnings will sync automatically!
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Manual Option */}
                <div
                  className="border-2 border-border rounded-xl p-5 hover:border-primary/30 transition-all cursor-pointer"
                  onClick={() => setStep(4)}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <PenLine className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">Manual entry</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        No problem — you can log trips manually. It takes about 5 seconds
                        per trip. Your platform is pre-selected so you just enter the amount.
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-2">
                        💡 Tip: Keeping earnings updated helps surge predictions get smarter for you.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button variant="hero" className="flex-1" onClick={() => setStep(4)}>
                    {gmailConnected ? "Continue" : "Skip for now"}
                    <ChevronRight className="ml-1 h-4 w-4" />
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
                  <p className="text-xs text-muted-foreground">📧 Earnings sync: {gmailConnected ? "Gmail auto-sync ✅" : "Manual entry"}</p>
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
