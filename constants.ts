import { PrizeTier, WheelConfig } from './types';

// Configuration reordered for visual excitement (High/Low interleaving)
// $1 next to $100, $2 next to $50, etc.
export const PRIZE_TIERS: PrizeTier[] = [
  { value: 1, label: "$1", probability: 0.30, color: "#94a3b8", textColor: "#0f172a" },   // Slate 400
  { value: 100, label: "$100", probability: 0.01, color: "#eab308", textColor: "#000000" }, // Yellow 500
  { value: 2, label: "$2", probability: 0.23, color: "#3b82f6", textColor: "#ffffff" },   // Blue 500
  { value: 50, label: "$50", probability: 0.03, color: "#ef4444", textColor: "#ffffff" },  // Red 500
  { value: 5, label: "$5", probability: 0.20, color: "#22c55e", textColor: "#ffffff" },   // Green 500
  { value: 20, label: "$20", probability: 0.08, color: "#f97316", textColor: "#ffffff" },  // Orange 500
  { value: 10, label: "$10", probability: 0.15, color: "#a855f7", textColor: "#ffffff" },  // Purple 500
];

export const WHEEL_CONFIG: WheelConfig = {
  rotationDuration: 4, // seconds
  minSpins: 5,
};

// Colors for the UI
export const UI_COLORS = {
  background: "bg-slate-950",
  panel: "bg-slate-900",
  border: "border-slate-800",
  accent: "text-indigo-400",
};