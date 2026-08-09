export interface SliderConfig {
  key: string;
  label: string;
  icon: string;
  min: number;
  max: number;
  defaultValue: number;
  unit: string;
  displayValue: string;
}

export const sliderConfigs: SliderConfig[] = [
  {
    key: "vegetation",
    label: "Cakupan Vegetasi",
    icon: "🌿",
    min: -50,
    max: 50,
    defaultValue: 20,
    unit: "%",
    displayValue: "+20%",
  },
  {
    key: "sidewalk",
    label: "Lebar Trotoar",
    icon: "🚶",
    min: -3,
    max: 3,
    defaultValue: 1.5,
    unit: "m",
    displayValue: "+1.5 m",
  },
  {
    key: "billboard",
    label: "Kepadatan Reklame",
    icon: "📋",
    min: -50,
    max: 50,
    defaultValue: -30,
    unit: "%",
    displayValue: "-30%",
  },
];

export interface PredictionRow {
  key: string;
  indikator: string;
  sebelum: number | string;
  sesudah: number | string;
  perubahan: string;
  changeType: "positive" | "negative";
}

export const predictionData: PredictionRow[] = [
  {
    key: "uvi",
    indikator: "UVI",
    sebelum: 6.14,
    sesudah: 7.98,
    perubahan: "↑ 1.84",
    changeType: "positive",
  },
  {
    key: "beauty",
    indikator: "Beauty Score",
    sebelum: 5.82,
    sesudah: 7.76,
    perubahan: "↑ 1.94",
    changeType: "positive",
  },
  {
    key: "safety",
    indikator: "Safety Score",
    sebelum: 6.21,
    sesudah: 8.25,
    perubahan: "↑ 2.04",
    changeType: "positive",
  },
  {
    key: "comfort",
    indikator: "Comfort Score",
    sebelum: 5.91,
    sesudah: 7.88,
    perubahan: "↑ 1.97",
    changeType: "positive",
  },
  {
    key: "gvi",
    indikator: "Green View Index (GVI)",
    sebelum: "28.1%",
    sesudah: "38.6%",
    perubahan: "↑ 10.5%",
    changeType: "positive",
  },
];

export const selectedLocation = {
  name: "Jl. Ijen",
  area: "Klojen, Malang",
  lat: "-7.9792",
  lng: "112.6301",
};

export const recommendation = {
  impact: "Positif",
  text: "Intervensi penambahan vegetasi dan pelebaran trotoar secara signifikan meningkatkan indeks kenyamanan dan keamanan. Pengurangan kepadatan reklame membantu meningkatkan kualitas visual koridor.",
};
