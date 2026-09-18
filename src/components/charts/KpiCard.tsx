import { Card } from "antd";
import {
  AimOutlined,
  EnvironmentOutlined,
  SmileOutlined,
  SafetyCertificateOutlined,
  HeartOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import type { KpiItem } from "../../data/kpiData";
import SparklineChart from "./SparklineChart";

const ICONS: Record<string, React.ReactNode> = {
  "total-survey": <AimOutlined />,
  "avg-uvi": <EnvironmentOutlined />,
  "avg-beauty": <AppstoreOutlined />,
  "avg-safety": <SafetyCertificateOutlined />,
  "avg-comfort": <HeartOutlined />,
  gvi: <SmileOutlined />,
};

export default function KpiCard({ kpi }: { kpi: KpiItem }) {
  return (
    <Card
      className="kpi-card rounded-xl shadow-sm"
      styles={{ body: { padding: "16px 18px" } }}
    >
      <div className="flex items-start gap-3">
        <div
          className="h-10 w-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
          style={{ background: `${kpi.color}1a`, color: kpi.color }}
        >
          {ICONS[kpi.key] ?? <EnvironmentOutlined />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-400 font-medium truncate">
            {kpi.title}
          </div>
          <div className="flex items-baseline gap-0.5 mt-0.5">
            <span className="text-2xl font-bold text-gray-800 leading-none">
              {kpi.value}
            </span>
            {kpi.suffix && (
              <span className="text-sm font-medium text-gray-400 leading-none">
                {kpi.suffix}
              </span>
            )}
          </div>
          <div
            className={`text-[11px] mt-1.5 font-semibold ${
              kpi.changeType === "up" ? "text-emerald-500" : "text-rose-500"
            }`}
          >
            {kpi.change.slice(0, kpi.change.indexOf(" vs"))}
            <span className="text-gray-400 font-medium"> vs last period</span>
          </div>
        </div>
        <div className="w-20 h-10 flex-shrink-0 ml-1 self-center">
          <SparklineChart data={kpi.sparkData} color={kpi.color} />
        </div>
      </div>
    </Card>
  );
}