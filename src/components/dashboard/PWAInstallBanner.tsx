import { useState } from 'react';
import { Smartphone, X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export default function PWAInstallBanner() {
  const { canInstall, isInstalled, isStandalone, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  if (isStandalone) return null;

  if (isInstalled) {
    return (
      <div className="mb-4 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium inline-flex items-center gap-2">
        ✅ TaxiFlow installed on your device
      </div>
    );
  }

  if (canInstall && !dismissed) {
    return (
      <div className="mb-4 relative rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl p-4 sm:p-5 flex items-center gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Smartphone className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground">Install TaxiFlow on your phone</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Get surge alerts and log trips without opening a browser. Works offline too.
          </p>
        </div>
        <Button size="sm" onClick={install} className="flex-shrink-0 gap-1.5">
          <Download className="w-4 h-4" />
          Install App
        </Button>
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // iOS Safari fallback
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  if (isIOS && !canInstall) {
    return (
      <div className="mb-4 rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl p-4 flex items-center gap-3 text-sm text-muted-foreground">
        <span className="text-lg">📱</span>
        <span>On iPhone: tap the <strong className="text-foreground">Share</strong> button then <strong className="text-foreground">'Add to Home Screen'</strong> to install TaxiFlow</span>
      </div>
    );
  }

  return null;
}
