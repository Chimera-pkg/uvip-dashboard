export interface ModelMetric {
  name: string;
  r2: number;
  color: string;
}

export const modelPerformance: ModelMetric[] = [
  { name: "Beauty Model", r2: 0.78, color: "#f59e0b" },
  { name: "Safety Model", r2: 0.82, color: "#3b82f6" },
  { name: "Comfort Model", r2: 0.76, color: "#22c55e" },
  { name: "UVI Model", r2: 0.80, color: "#8b5cf6" },
];

export const targetR2 = 0.7;
export const lastTraining = "12 Jun 2026";
