export interface SliderConfig {
  key: string;
  label: string;
  icon: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  unit: string;
  format: (v: number) => string;
}

export const sliderConfigs: SliderConfig[] = [
  {
    key: "vegetation",
    label: "Vegetation Coverage",
    icon: "🌿",
    min: -50,
    max: 50,
    step: 5,
    defaultValue: 20,
    unit: "%",
    format: (v) => `${v > 0 ? "+" : ""}${v}%`,
  },
  {
    key: "sidewalk",
    label: "Sidewalk Width",
    icon: "🚶",
    min: -2,
    max: 2,
    step: 0.5,
    defaultValue: 1.5,
    unit: "m",
    format: (v) => `${v > 0 ? "+" : ""}${v}m`,
  },
  {
    key: "signage",
    label: "Signage Density",
    icon: "📋",
    min: -50,
    max: 50,
    step: 5,
    defaultValue: -15,
    unit: "%",
    format: (v) => `${v > 0 ? "+" : ""}${v}%`,
  },
];

/* ============================================================
   Baseline (current) metric values for the selected location
   ============================================================ */
export interface PredictionRow {
  key: string;
  metric: string;
  before: number;
  isPercent: boolean;
}

export const predictionBase: PredictionRow[] = [
  { key: "uvi", metric: "UVI", before: 6.14, isPercent: false },
  { key: "beauty", metric: "Beauty", before: 5.82, isPercent: false },
  { key: "safety", metric: "Safety", before: 6.21, isPercent: false },
  { key: "comfort", metric: "Comfort", before: 5.91, isPercent: false },
  { key: "gvi", metric: "GVI", before: 28.1, isPercent: true },
];

/* ============================================================
   Mock AI model weights.
   `simulate()` must reproduce the verified reference values at
   the default slider settings (vegetation +20, sidewalk +1.5,
   signage -15): UVI 7.98, Beauty 7.76, Safety 8.25, Comfort 7.88,
   GVI 38.6%.
   ============================================================ */
interface MetricWeights {
  vegetation: number;
  sidewalk: number;
  signage: number;
}

const modelWeights: Record<string, MetricWeights> = {
  uvi: { vegetation: 0.0575, sidewalk: 0.42, signage: -0.004 },
  beauty: { vegetation: 0.0625, sidewalk: 0.42, signage: -0.004 },
  safety: { vegetation: 0.06, sidewalk: 0.5, signage: -0.006 },
  comfort: { vegetation: 0.049, sidewalk: 0.62, signage: -0.004 },
  gvi: { vegetation: 0.2475, sidewalk: 3.6, signage: -0.01 },
};

export interface SimulationResult {
  rows: Array<{
    key: string;
    metric: string;
    isPercent: boolean;
    before: number;
    after: number;
    change: number;
    changeLabel: string;
    changeType: "positive" | "negative";
  }>;
  impact: "positive" | "negative";
}

export function simulate(values: Record<string, number>): SimulationResult {
  const v = {
    vegetation: values.vegetation ?? 0,
    sidewalk: values.sidewalk ?? 0,
    signage: values.signage ?? 0,
  };

  const rows = predictionBase.map((row) => {
    const w = modelWeights[row.key];
    const raw =
      row.before + w.vegetation * v.vegetation + w.sidewalk * v.sidewalk + w.signage * v.signage;
    // Clamp: skor UVI/beauty/safety/comfort maksimum 10, GVI maksimum 100%
    const capped = row.isPercent ? Math.min(raw, 100) : Math.min(raw, 10);
    const after = row.isPercent ? Number(capped.toFixed(1)) : Number(capped.toFixed(2));
    const change = Number((after - row.before).toFixed(row.isPercent ? 1 : 2));
    const changeType: "positive" | "negative" = change >= 0 ? "positive" : "negative";
    const changeLabel = `${change >= 0 ? "↑" : "↓"} ${Math.abs(
      change,
    ).toFixed(row.isPercent ? 1 : 2)}${row.isPercent ? "%" : ""}`;
    return { key: row.key, metric: row.metric, isPercent: row.isPercent, before: row.before, after, change, changeLabel, changeType };
  });

  const uviChange = rows.find((r) => r.key === "uvi")!.change;
  return { rows, impact: uviChange >= 0 ? "positive" : "negative" };
}

export const selectedLocation = {
  name: "Jalan Ijen Boulevard, Klojen",
  fullAddress: "Jalan Ijen Boulevard, Klojen, Malang",
  zone: "Residential / Heritage Zone",
  lat: "-7.9792",
  lng: "112.6301",
  currentUvi: 8.14,
  status: "Good",
};

export const recommendationText =
  "The combination of increased vegetation and wider sidewalks resulted in significant improvements in the Comfort Index and GVI.";