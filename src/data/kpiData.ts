export interface KpiItem {
  key: string;
  title: string;
  value: string;
  suffix?: string;
  change: string;
  changeType: "up" | "down";
  color: string;
  sparkData: number[];
}

export const kpiData: KpiItem[] = [
  {
    key: "total-survey",
    title: "Total Survey Points",
    value: "12,456",
    change: "↑ 18.6% vs periode lalu",
    changeType: "up",
    color: "#3b82f6",
    sparkData: [30, 40, 35, 50, 49, 60, 70, 91, 86, 95, 100, 110],
  },
  {
    key: "avg-uvi",
    title: "Avg. Urban Visual Index (UVI)",
    value: "7.32",
    suffix: "/10",
    change: "↑ 0.74 vs periode lalu",
    changeType: "up",
    color: "#10b981",
    sparkData: [60, 65, 62, 68, 72, 70, 74, 73, 76, 78, 75, 80],
  },
  {
    key: "avg-safety",
    title: "Avg. Safety Score",
    value: "7.68",
    suffix: "/10",
    change: "↑ 0.82 vs periode lalu",
    changeType: "up",
    color: "#8b5cf6",
    sparkData: [55, 58, 60, 62, 64, 63, 67, 70, 72, 74, 76, 78],
  },
  {
    key: "avg-beauty",
    title: "Avg. Beauty Score",
    value: "7.21",
    suffix: "/10",
    change: "↑ 0.63 vs periode lalu",
    changeType: "up",
    color: "#f59e0b",
    sparkData: [50, 52, 48, 55, 58, 60, 62, 65, 68, 70, 72, 74],
  },
  {
    key: "avg-comfort",
    title: "Avg. Comfort Score",
    value: "7.45",
    suffix: "/10",
    change: "↑ 0.71 vs periode lalu",
    changeType: "up",
    color: "#ec4899",
    sparkData: [45, 50, 48, 52, 56, 58, 62, 64, 68, 70, 72, 75],
  },
  {
    key: "gvi",
    title: "Green View Index (GVI)",
    value: "32.4",
    suffix: "%",
    change: "↑ 4.5% vs periode lalu",
    changeType: "up",
    color: "#22c55e",
    sparkData: [20, 22, 24, 26, 28, 27, 30, 32, 31, 33, 34, 35],
  },
];
