import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const tiers = [
  {
    name: "Basic",
    price: "Free",
    period: "",
    description: "Get started with essential tools",
    features: [
      "Real-time surge alerts",
      "Basic heat maps",
      "5 predictions per day",
      "Single platform tracking",
    ],
    cta: "Get Started Free",
    variant: "hero-outline" as const,
    popular: false,
  },
  {
    name: "Pro Driver",
    price: "$19.99",
    period: "/mo",
    description: "Everything to maximize your earnings",
    features: [
      "Unlimited AI predictions",
      "Multi-platform comparison",
      "Route optimization",
      "Earnings tracking & analytics",
      "Surge history & patterns",
      "Priority support",
    ],
    cta: "Start 7-Day Free Trial",
    variant: "hero" as const,
    popular: true,
  },
  {
    name: "Fleet Manager",
    price: "$49.99",
    period: "/mo",
    description: "Optimize your entire fleet",
    features: [
      "Up to 10 driver accounts",
      "Fleet analytics dashboard",
      "Driver performance comparison",
      "Bulk surge notifications",
      "Custom reporting",
      "Dedicated account manager",
    ],
    cta: "Contact Sales",
    variant: "hero-outline" as const,
    popular: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Plans that <span className="gradient-primary-text">pay for themselves</span>
          </h2>
          <p className="text-muted-foreground">
            Drivers using TaxiFlow Pro earn $200-400 more per week. Your subscription pays for itself in a single shift.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              className={`relative rounded-2xl p-6 flex flex-col ${
                tier.popular
                  ? "glass shadow-glow border-primary/30 border-2 scale-105"
                  : "glass"
              }`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-display font-semibold">{tier.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{tier.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-display font-bold">{tier.price}</span>
                <span className="text-muted-foreground">{tier.period}</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Button variant={tier.variant} className="w-full" asChild>
                <Link to="/signup">{tier.cta}</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
