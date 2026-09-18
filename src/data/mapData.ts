export interface MapMarkerPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  /** UVI score 0-10; drives heatmap color */
  uvi: number;
  surveyCount: number;
}

export interface MapLayer {
  key: string;
  label: string;
}

export interface MapLegendItem {
  label: string;
  value: string;
  color: string;
}

export interface MapStats {
  label: string;
  value: string;
  unit?: string;
}

/* ============================================================
   Kota Malang survey points + POI markers
   ============================================================ */
export const mapCenters: Array<{ name: string; city: string; lat: number; lng: number; zoom: number }> = [
  { name: "Kota Malang", city: "Kota Malang", lat: -7.9627, lng: 112.6291, zoom: 13 },
  { name: "Kota Batu", city: "Kota Batu", lat: -7.9275, lng: 112.6256, zoom: 13 },
  { name: "Kab. Malang", city: "Kab. Malang", lat: -7.9951, lng: 112.6218, zoom: 10 },
];

export const markerPoints: MapMarkerPoint[] = [
  { id: "sp-1", name: "Jl. Ijen", lat: -7.9792, lng: 112.6301, uvi: 8.14, surveyCount: 148 },
  { id: "sp-2", name: "Jl. Soekarno Hatta", lat: -7.9543, lng: 112.637, uvi: 5.42, surveyCount: 96 },
  { id: "sp-3", name: "Kayutangan Heritage", lat: -7.9786, lng: 112.6324, uvi: 8.91, surveyCount: 164 },
  { id: "sp-4", name: "Jl. Kawi", lat: -7.9881, lng: 112.6335, uvi: 4.76, surveyCount: 71 },
  { id: "sp-5", name: "Jl. Veteran", lat: -7.9948, lng: 112.6462, uvi: 6.03, surveyCount: 88 },
  { id: "sp-6", name: "Alun-Alun Malang", lat: -7.9672, lng: 112.6337, uvi: 7.85, surveyCount: 122 },
  { id: "sp-7", name: "Universitas Brawijaya", lat: -7.9556, lng: 112.6183, uvi: 6.94, surveyCount: 103 },
  { id: "sp-8", name: "UMM Junction", lat: -7.9281, lng: 112.6451, uvi: 7.31, surveyCount: 95 },
];

/** Secondary POI names shown as map labels (like the mockup's map) */
export const mapPoiLabels: Array<{ name: string; lat: number; lng: number }> = [
  { name: "Ijen Suites Resort & Convention", lat: -7.9808, lng: 112.6278 },
  { name: "NANAYA Resort", lat: -7.9859, lng: 112.6294 },
  { name: "Bontarang Waterpark", lat: -7.9741, lng: 112.6398 },
  { name: "Park. Sumber Enon", lat: -7.9723, lng: 112.6281 },
  { name: "Tiondhar Atas", lat: -7.9892, lng: 112.6361 },
  { name: "Mia Saleh Airport", lat: -7.9249, lng: 112.7111 },
  { name: "Singasari", lat: -7.9568, lng: 112.5868 },
];

/* ============================================================
   Map controls / overlays
   ============================================================ */
export const mapLayers: MapLayer[] = [
  { key: "uvi", label: "Urban Visual Index (UVI) Heatmap" },
  { key: "survey", label: "Survey Points" },
  { key: "gvi", label: "Green View Index (GVI)" },
  { key: "traffic", label: "Traffic Conditions" },
];

export const uviHeatLegend: MapLegendItem[] = [
  { label: "0 (Low)", value: "0", color: "#22c55e" },
  { label: "5 (Avg)", value: "5", color: "#f59e0b" },
  { label: "10 (High)", value: "10", color: "#ef4444" },
];

export const mapStats: MapStats[] = [
  { label: "UVI Avg. Score", value: "7.32" },
  { label: "Survey Points", value: "2,456" },
  { label: "Total Area", value: "186", unit: "km²" },
];

/* ============================================================
   Recent 7-day UVI trend (Mon–Sun)
   ============================================================ */
export const sevenDayTrend: Array<{ day: string; uvi: number }> = [
  { day: "Mon", uvi: 6.9 },
  { day: "Tue", uvi: 7.1 },
  { day: "Wed", uvi: 7.0 },
  { day: "Thu", uvi: 7.4 },
  { day: "Fri", uvi: 7.6 },
  { day: "Sat", uvi: 7.5 },
  { day: "Sun", uvi: 7.32 },
];