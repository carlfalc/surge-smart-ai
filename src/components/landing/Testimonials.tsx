import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Marcus T.",
    role: "Full-time Uber driver, Auckland",
    quote: "TaxiFlow increased my weekly earnings by $320. The surge predictions are scary accurate — I'm always in the right place at the right time now.",
    rating: 5,
  },
  {
    name: "Sarah L.",
    role: "Part-time driver, Sydney",
    quote: "The platform comparison alone is worth the subscription. I switched to Lyft for a Friday night and made 40% more than I would have on Uber.",
    rating: 5,
  },
  {
    name: "David K.",
    role: "Fleet owner, Melbourne",
    quote: "Managing 12 drivers is so much easier. I can see who's positioned well and who's wasting time. Fleet earnings up 18% in the first month.",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 gradient-glow opacity-30" />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Drivers are already <span className="gradient-primary-text">earning more</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              className="glass rounded-2xl p-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-sm leading-relaxed mb-4">"{t.quote}"</p>
              <div>
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
