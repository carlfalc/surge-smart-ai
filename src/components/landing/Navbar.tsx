import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { motion } from "framer-motion";

export function Navbar() {
  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 glass"
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg">TaxiFlow AI</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">Log in</Link>
          </Button>
          <Button variant="hero" size="sm" asChild>
            <Link to="/signup">Get Started</Link>
          </Button>
        </div>
      </div>
    </motion.nav>
  );
}
