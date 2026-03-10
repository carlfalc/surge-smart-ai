import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, MapPin, TrendingUp, DollarSign, ArrowRight, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const steps = [
  {
    icon: MapPin,
    title: "What's your city?",
    description: "We'll customize surge predictions and positioning for your area.",
  },
  {
    icon: TrendingUp,
    title: "Which platforms do you drive for?",
    description: "We'll compare rates across your active platforms.",
  },
  {
    icon: DollarSign,
    title: "What's your earnings goal?",
    description: "We'll help you hit your weekly target with smart shift planning.",
  },
];

const cities = ["Auckland", "Wellington", "Sydney", "Melbourne", "Brisbane"];
const platforms = ["Uber", "Lyft", "Ola"];

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [city, setCity] = useState("Auckland");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["Uber"]);
  const [goal, setGoal] = useState("800");

  const togglePlatform = (p: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const handleComplete = async () => {
    if (user) {
      await supabase
        .from("profiles")
        .update({
          city,
          preferred_platforms: selectedPlatforms.map((p) => p.toLowerCase()),
          onboarding_completed: true,
        })
        .eq("user_id", user.id);
    }
    navigate("/dashboard");
  };

  const next = () => {
    if (step < 2) setStep(step + 1);
    else handleComplete();
  };

  return (
    <div className="dark min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="absolute inset-0 gradient-glow opacity-30" />

      <motion.div className="w-full max-w-lg relative z-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i <= step ? "w-12 gradient-primary" : "w-8 bg-muted"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl">TaxiFlow AI</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass rounded-2xl p-8"
          >
            <div className="text-center mb-6">
              {(() => {
                const Icon = steps[step].icon;
                return (
                  <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                );
              })()}
              <h2 className="text-xl font-display font-bold">{steps[step].title}</h2>
              <p className="text-sm text-muted-foreground mt-1">{steps[step].description}</p>
            </div>

            {step === 0 && (
              <div className="grid grid-cols-2 gap-2">
                {cities.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCity(c)}
                    className={`rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                      city === c
                        ? "gradient-primary text-primary-foreground"
                        : "bg-muted/50 hover:bg-muted text-foreground"
                    }`}
                  >
                    {city === c && <Check className="h-3 w-3 inline mr-1" />}
                    {c}
                  </button>
                ))}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-2">
                {platforms.map((p) => (
                  <button
                    key={p}
                    onClick={() => togglePlatform(p)}
                    className={`w-full rounded-lg px-4 py-3 text-sm font-medium text-left flex items-center justify-between transition-all ${
                      selectedPlatforms.includes(p)
                        ? "bg-primary/10 border border-primary/30 text-foreground"
                        : "bg-muted/50 hover:bg-muted text-foreground"
                    }`}
                  >
                    {p}
                    {selectedPlatforms.includes(p) && <Check className="h-4 w-4 text-primary" />}
                  </button>
                ))}
              </div>
            )}

            {step === 2 && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-2xl text-muted-foreground">$</span>
                  <Input
                    type="number"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="text-3xl font-display font-bold text-center w-32 border-none bg-transparent"
                  />
                  <span className="text-sm text-muted-foreground">/week</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Pro drivers in your area earn $700-1,200/week
                </p>
              </div>
            )}

            <Button variant="hero" className="w-full mt-6" onClick={next}>
              {step < 2 ? "Continue" : "Start Driving Smarter"}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Onboarding;
