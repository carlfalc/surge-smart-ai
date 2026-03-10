import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const SurgeBar = ({ delay, label }: { delay: number; label: string }) => {
  const [height, setHeight] = useState(20);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeight(Math.random() * 70 + 20);
    }, 2000 + delay * 300);
    return () => clearInterval(interval);
  }, [delay]);

  return (
    <div className="flex flex-col items-center gap-1">
      <motion.div
        className="w-3 rounded-full gradient-primary"
        animate={{ height: `${height}%` }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        style={{ minHeight: 12 }}
      />
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
};

const MapDot = ({ x, y, size, delay }: { x: number; y: number; size: number; delay: number }) => (
  <motion.div
    className="absolute rounded-full bg-primary"
    style={{ left: `${x}%`, top: `${y}%`, width: size, height: size }}
    animate={{ scale: [1, 1.8, 1], opacity: [0.4, 1, 0.4] }}
    transition={{ duration: 3, delay, repeat: Infinity, ease: "easeInOut" }}
  />
);

const RouteLine = ({ points, delay }: { points: string; delay: number }) => (
  <motion.path
    d={points}
    stroke="url(#routeGrad)"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    initial={{ pathLength: 0, opacity: 0 }}
    animate={{ pathLength: 1, opacity: 1 }}
    transition={{ duration: 2, delay, ease: "easeInOut" }}
  />
);

export function SurgeVisualization() {
  const hours = ["6am", "8am", "10am", "12pm", "2pm", "4pm", "6pm", "8pm", "10pm"];

  return (
    <motion.div
      className="relative w-full max-w-md mx-auto glass rounded-2xl p-6 overflow-hidden"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-display font-semibold text-foreground">Surge Prediction</span>
        <span className="text-xs text-accent font-semibold">+2.4x predicted</span>
      </div>
      <div className="flex items-end gap-2 h-32">
        {hours.map((h, i) => (
          <SurgeBar key={h} delay={i} label={h} />
        ))}
      </div>
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-primary/10 blur-3xl" />
    </motion.div>
  );
}

export function MapVisualization() {
  const dots = [
    { x: 25, y: 30, size: 8, delay: 0 },
    { x: 60, y: 20, size: 6, delay: 0.5 },
    { x: 45, y: 55, size: 10, delay: 1 },
    { x: 75, y: 45, size: 7, delay: 1.5 },
    { x: 35, y: 70, size: 9, delay: 2 },
    { x: 80, y: 70, size: 6, delay: 0.8 },
    { x: 15, y: 50, size: 5, delay: 1.2 },
  ];

  return (
    <motion.div
      className="relative w-full max-w-md mx-auto glass rounded-2xl p-6 overflow-hidden aspect-[4/3]"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-display font-semibold text-foreground">Smart Positioning</span>
        <span className="text-xs text-primary font-semibold">Live</span>
      </div>

      {/* Grid background */}
      <div className="absolute inset-6 opacity-10">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={`h${i}`} className="absolute w-full border-t border-foreground/30" style={{ top: `${(i + 1) * 16}%` }} />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={`v${i}`} className="absolute h-full border-l border-foreground/30" style={{ left: `${(i + 1) * 16}%` }} />
        ))}
      </div>

      {/* Route lines */}
      <svg className="absolute inset-6 w-[calc(100%-3rem)] h-[calc(100%-3rem)]" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(220 100% 55%)" />
            <stop offset="100%" stopColor="hsl(150 100% 42%)" />
          </linearGradient>
        </defs>
        <RouteLine points="M 25 30 C 35 25, 50 20, 60 20" delay={0.5} />
        <RouteLine points="M 45 55 C 55 50, 65 45, 75 45" delay={1} />
        <RouteLine points="M 35 70 C 50 65, 65 60, 80 70" delay={1.5} />
      </svg>

      {/* Pulsing dots */}
      {dots.map((dot, i) => (
        <MapDot key={i} {...dot} />
      ))}

      <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-accent/10 blur-3xl" />
    </motion.div>
  );
}

export function EarningsCounter() {
  const [earnings, setEarnings] = useState(0);
  const target = 847;

  useEffect(() => {
    let current = 0;
    const step = target / 60;
    const interval = setInterval(() => {
      current += step;
      if (current >= target) {
        setEarnings(target);
        clearInterval(interval);
      } else {
        setEarnings(Math.floor(current));
      }
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="glass rounded-2xl p-6 text-center"
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <p className="text-xs text-muted-foreground mb-1">Weekly Earnings Boost</p>
      <p className="text-4xl font-display font-bold gradient-primary-text">+${earnings}</p>
      <p className="text-xs text-accent mt-1">↑ 23% vs last week</p>
    </motion.div>
  );
}

export function PlatformComparison() {
  const platforms = [
    { name: "Uber", rate: "$18.50", surge: "1.8x", best: false },
    { name: "Lyft", rate: "$21.20", surge: "2.1x", best: true },
    { name: "Ola", rate: "$16.80", surge: "1.5x", best: false },
  ];

  return (
    <motion.div
      className="glass rounded-2xl p-6"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.4 }}
    >
      <p className="text-sm font-display font-semibold mb-3">Platform Comparison</p>
      <div className="space-y-2">
        {platforms.map((p) => (
          <div
            key={p.name}
            className={`flex items-center justify-between rounded-lg px-3 py-2 transition-colors ${
              p.best ? "bg-accent/10 border border-accent/30" : "bg-muted/50"
            }`}
          >
            <span className="text-sm font-medium">{p.name}</span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">{p.surge}</span>
              <span className={`text-sm font-semibold ${p.best ? "text-accent" : ""}`}>{p.rate}</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
