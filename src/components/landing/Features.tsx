import { motion } from "framer-motion";
import { TrendingUp, Map, ArrowLeftRight, Fuel, Clock, Brain, Receipt, FileText } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Surge Prediction",
    description: "Machine learning analyzes weather, events, traffic, and historical patterns to predict surge pricing up to 30 minutes ahead.",
  },
  {
    icon: ArrowLeftRight,
    title: "Multi-Platform Compare",
    description: "See real-time rate comparisons across Uber, Lyft, and Ola. Accept the highest-paying trip every time.",
  },
  {
    icon: Map,
    title: "Smart Positioning",
    description: "Dynamic heat maps show you exactly where to drive for maximum trip density and shortest wait times.",
  },
  {
    icon: TrendingUp,
    title: "Earnings Analytics",
    description: "Track your hourly rate, trip efficiency, and weekly trends. See exactly where your income comes from.",
  },
  {
    icon: Receipt,
    title: "Expense Tracker",
    description: "Log fuel, maintenance, insurance and more. See your real profit after costs — not just gross earnings.",
  },
  {
    icon: FileText,
    title: "Tax Ready",
    description: "Automatic NZ tax calculations, GST threshold tracker, and one-click CSV export at year end. No accountant needed.",
  },
  {
    icon: Fuel,
    title: "Fuel & EV Optimization",
    description: "Integration with local fuel prices and EV charging stations. Factor in real costs for true profit calculation.",
  },
  {
    icon: Clock,
    title: "Shift Planning",
    description: "AI recommends optimal start times and shift lengths based on historical demand patterns in your city.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 relative">
      <div className="absolute inset-0 gradient-glow opacity-50" />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Every tool you need to{" "}
            <span className="gradient-primary-text">maximize earnings</span>
          </h2>
          <p className="text-muted-foreground">
            Stop driving blind. Get AI-powered insights that turn every hour on the road into maximum profit.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="glass rounded-2xl p-6 hover:shadow-glow transition-all duration-500 group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-display font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
