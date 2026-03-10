import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "How does TaxiFlow predict surge pricing?",
    a: "Our AI analyzes weather data, local events, traffic patterns, historical demand, and time-of-day trends to predict surge multipliers up to 30 minutes before they happen. Accuracy improves as we collect more data from your city.",
  },
  {
    q: "Which cities does TaxiFlow support?",
    a: "We currently support Auckland, Wellington, Sydney, Melbourne, and Brisbane — with more ANZ cities launching monthly. Our local-first approach means we understand your city's unique patterns.",
  },
  {
    q: "Will this actually increase my earnings?",
    a: "On average, Pro drivers see a 15-25% increase in weekly earnings. That's $200-400 more per week for full-time drivers. The subscription pays for itself in a single shift.",
  },
  {
    q: "Do I need to share my ride-share account credentials?",
    a: "No. TaxiFlow works with publicly available data and your manual input. We never ask for or store your Uber, Lyft, or Ola login credentials.",
  },
  {
    q: "Can I cancel my subscription anytime?",
    a: "Absolutely. No contracts, no cancellation fees. You can cancel directly from your dashboard and continue using the service until your billing period ends.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Frequently asked questions
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              className="glass rounded-xl overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <span className="text-sm font-semibold pr-4">{faq.q}</span>
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${
                    open === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              <motion.div
                initial={false}
                animate={{ height: open === i ? "auto" : 0, opacity: open === i ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <p className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
