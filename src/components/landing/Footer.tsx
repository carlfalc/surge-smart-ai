import { Link } from "react-router-dom";
import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Zap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-lg">TaxiFlow AI</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Your AI co-driver for maximum earnings.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-3 text-sm">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="#features" className="hover:text-foreground transition-colors">Features</Link></li>
              <li><Link to="#pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
              <li><Link to="#faq" className="hover:text-foreground transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-3 text-sm">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/help" className="hover:text-foreground transition-colors">Help Center</Link></li>
              <li><Link to="/help" className="hover:text-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-3 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} TaxiFlow AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
