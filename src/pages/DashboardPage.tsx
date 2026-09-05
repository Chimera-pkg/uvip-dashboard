import { Card, Row, Col } from "antd";
import { EnvironmentOutlined, DashboardOutlined } from "@ant-design/icons";
import KpiCard from "../components/charts/KpiCard";
import MapView from "../components/charts/MapView";
import DonutChart from "../components/charts/DonutChart";
import HorizontalBarChart from "../components/charts/HorizontalBarChart";
import { kpiData } from "../data/kpiData";
import { surveyPoints } from "../data/surveyPoints";

/* ============================================================
   Recent Survey Points Card
   ============================================================ */
function RecentSurveyPointsCard() {
  const getUviBadgeClass = (level: string) => {
    if (level === "high") return "uvi-badge-high";
    if (level === "medium") return "uvi-badge-medium";
    return "uvi-badge-low";
  };

  return (
    <Card
      className="dashboard-card rounded-xl shadow-sm h-full"
      title={
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-800 text-sm">
            Recent Survey Points
          </span>
          <a className="text-blue-500 text-xs font-medium cursor-pointer">
            View All
          </a>
        </div>
      }
    >
      <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-1">
        {surveyPoints.map((sp) => (
          <div
            key={sp.key}
            className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            {/* Thumbnail */}
            <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-emerald-100 to-blue-100 flex-shrink-0 flex items-center justify-center">
              <EnvironmentOutlined className="text-blue-500 text-lg" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-800 truncate">
                  {sp.name}
                </span>
                <span className={getUviBadgeClass(sp.uviLevel)}>
                  UVI {sp.uvi.toFixed(2)}
                </span>
              </div>
              <div className="text-xs text-gray-400 mt-0.5">{sp.area}</div>
            </div>

            {/* Right info */}
            <div className="text-right flex-shrink-0">
              <div className="text-[11px] text-gray-400">
                {sp.date}, {sp.time}
              </div>
              <div className="text-[10px] text-gray-300 mt-0.5">
                {sp.lat}, {sp.lng}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ============================================================
   Dataset Summary Card
   ============================================================ */
function DatasetSummaryCard() {
  return (
    <Card
      className="dashboard-card rounded-xl shadow-sm"
      title={
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-800 text-sm">
            Dataset Summary
          </span>
          <a className="text-blue-500 text-xs font-medium cursor-pointer">
            View All
          </a>
        </div>
      }
    >
      <DonutChart />
    </Card>
  );
}

/* ============================================================
   Model Performance Card
   ============================================================ */
function ModelPerformanceCard() {
  return (
    <Card
      className="dashboard-card rounded-xl shadow-sm"
      title={
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-800 text-sm">
            Model Performance (R²)
          </span>
          <a className="text-blue-500 text-xs font-medium cursor-pointer">
            Detail
          </a>
        </div>
      }
    >
      <HorizontalBarChart />
    </Card>
  );
}

/* ============================================================
   Dashboard Page (Main Export)
   ============================================================ */
export default function DashboardPage() {
  return (
    <div>
      {/* Title */}
      <div className="flex items-center gap-2 mb-5">
        <DashboardOutlined className="text-blue-500 text-xl" />
        <h1 className="text-lg font-bold text-gray-800">Dashboard Overview</h1>
      </div>

      {/* KPI Cards */}
      <Row gutter={[14, 14]} className="mb-5">
        {kpiData.map((kpi) => (
          <Col key={kpi.key} xs={24} sm={12} lg={4}>
            <KpiCard kpi={kpi} />
          </Col>
        ))}
      </Row>

      {/* Middle Section */}
      <Row gutter={[14, 14]} className="mb-5">
        {/* UVI Heatmap map */}
        <Col xs={24} lg={9}>
          <Card
            className="dashboard-card rounded-xl shadow-sm h-full"
            styles={{ body: { padding: 0 } }}
            title={
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-800 text-sm">
                  UVI Heatmap
                </span>
              </div>
            }
          >
            <MapView height={310} />
          </Card>
        </Col>

        {/* Recent Survey Points */}
        <Col xs={24} lg={8}>
          <RecentSurveyPointsCard />
        </Col>

        {/* Right column: Dataset + Model */}
        <Col xs={24} lg={7}>
          <div className="flex flex-col gap-3.5">
            <DatasetSummaryCard />
            <ModelPerformanceCard />
          </div>
        </Col>
      </Row>
    </div>
  );
}