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
    key: "total-projects",
    title: "Total Projects",
    value: "0",
    change: "↑ 0% vs last period",
    changeType: "up",
    color: "#3b82f6",
    sparkData: [30, 40, 35, 50, 49, 60, 70, 91, 86, 95, 100, 110],
  },
  {
    key: "avg-safety",
    title: "Safety Score",
    value: "0.00",
    suffix: "/10",
    change: "↑ 0.0 vs last period",
    changeType: "up",
    color: "#8b5cf6",
    sparkData: [55, 58, 60, 62, 64, 63, 67, 70, 72, 74, 76, 78],
  },
  {
    key: "avg-beauty",
    title: "Beauty Score",
    value: "0.00",
    suffix: "/10",
    change: "↑ 0.0 vs last period",
    changeType: "up",
    color: "#f59e0b",
    sparkData: [50, 52, 48, 55, 58, 60, 62, 65, 68, 70, 72, 74],
  },
  {
    key: "avg-comfort",
    title: "Comfort Score",
    value: "0.00",
    suffix: "/10",
    change: "↑ 0.0 vs last period",
    changeType: "up",
    color: "#ec4899",
    sparkData: [45, 50, 48, 52, 56, 58, 62, 64, 68, 70, 72, 75],
  },
  {
    key: "avg-uvi",
    title: "UVI Score",
    value: "0.00",
    suffix: "/10",
    change: "↑ 0.0 vs last period",
    changeType: "up",
    color: "#10b981",
    sparkData: [60, 65, 62, 68, 72, 70, 74, 73, 76, 78, 75, 80],
  },
];