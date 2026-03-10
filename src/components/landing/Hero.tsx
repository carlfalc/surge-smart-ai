import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { SurgeVisualization, MapVisualization, EarningsCounter, PlatformComparison } from "./InteractiveGraphics";
import { ArrowRight, Zap } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Background effects */}
      <div className="absolute inset-0 gradient-glow" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-accent/5 blur-[80px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Copy */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 mb-6">
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">AI-Powered Driver Intelligence</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.1] mb-6">
              Drive smarter.{" "}
              <span className="gradient-primary-text">Earn more.</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-lg mb-8 leading-relaxed">
              TaxiFlow AI predicts surge pricing, compares platforms in real-time, and positions you where the money is. Boost your weekly earnings by 15-25%.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" asChild>
                <Link to="/signup">
                  Start Free <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="hero-outline" size="lg" asChild>
                <Link to="#features">See How It Works</Link>
              </Button>
            </div>

            <div className="flex items-center gap-6 mt-8">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-semibold"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold">2,400+ drivers</p>
                <p className="text-xs text-muted-foreground">earning more with TaxiFlow</p>
              </div>
            </div>
          </motion.div>

          {/* Right: Interactive visualizations */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="grid grid-cols-2 gap-4">
              <EarningsCounter />
              <PlatformComparison />
            </div>
            <SurgeVisualization />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
