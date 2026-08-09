export interface DatasetSlice {
  name: string;
  value: number;
  color: string;
  percentage: string;
}

export const datasetSummary: DatasetSlice[] = [
  { name: "Live Scanner", value: 12456, color: "#3b82f6", percentage: "51.2%" },
  { name: "Upload (Batch)", value: 8742, color: "#8b5cf6", percentage: "35.9%" },
  { name: "Street Scanner", value: 2680, color: "#22c55e", percentage: "11.0%" },
  { name: "Lainnya", value: 440, color: "#94a3b8", percentage: "1.9%" },
];

export const datasetTotal = 24318;
