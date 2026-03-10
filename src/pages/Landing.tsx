import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Pricing } from "@/components/landing/Pricing";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";
import { MapVisualization } from "@/components/landing/InteractiveGraphics";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Landing = () => {
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />

      {/* Interactive map section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                See the city through <span className="gradient-primary-text">AI eyes</span>
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Our dynamic positioning engine analyzes real-time traffic, event schedules, and historical patterns to show you exactly where demand is building — before the surge hits.
              </p>
              <Button variant="hero" asChild>
                <Link to="/signup">Try It Free <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </motion.div>
            <MapVisualization />
          </div>
        </div>
      </section>

      <Features />
      <Testimonials />
      <Pricing />
      <FAQ />

      {/* Final CTA */}
      <section className="py-24 relative">
        <div className="absolute inset-0 gradient-glow" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
              Ready to <span className="gradient-primary-text">earn more</span>?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Join 2,400+ drivers who are already using AI to maximize their earnings.
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/signup">Start Free Today <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
