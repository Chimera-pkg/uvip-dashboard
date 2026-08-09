import { Card, Row, Col, Select, Slider, Table, Button, Tag } from "antd";
import {
  EnvironmentOutlined,
  CheckCircleFilled,
  InfoCircleOutlined,
  AimOutlined,
} from "@ant-design/icons";
import { kpiData } from "../data/kpiData";
import { surveyPoints } from "../data/surveyPoints";
import {
  sliderConfigs,
  predictionData,
  selectedLocation,
  recommendation,
} from "../data/simulationData";
import SparklineChart from "../components/charts/SparklineChart";
import DonutChart from "../components/charts/DonutChart";
import HorizontalBarChart from "../components/charts/HorizontalBarChart";

/* ============================================================
   KPI Card Component
   ============================================================ */
function KpiCard({
  title,
  value,
  suffix,
  change,
  color,
  sparkData,
}: {
  title: string;
  value: string;
  suffix?: string;
  change: string;
  color: string;
  sparkData: number[];
}) {
  return (
    <Card className="kpi-card rounded-xl shadow-sm" styles={{ body: { padding: "16px 18px" } }}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-400 font-medium mb-1 truncate">
            {title}
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="text-2xl font-bold text-gray-800">{value}</span>
            {suffix && (
              <span className="text-sm font-medium text-gray-400">
                {suffix}
              </span>
            )}
          </div>
          <div className="text-[11px] text-emerald-500 mt-1 font-medium">
            {change}
          </div>
        </div>
        <div className="w-20 h-10 flex-shrink-0 ml-2">
          <SparklineChart data={sparkData} color={color} />
        </div>
      </div>
    </Card>
  );
}

/* ============================================================
   UVI Heatmap Card
   ============================================================ */
function UviHeatmapCard() {
  return (
    <Card
      className="dashboard-card rounded-xl shadow-sm h-full"
      title={
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-800 text-sm">
            UVI Heatmap
          </span>
          <Select
            defaultValue="uvi"
            size="small"
            className="w-[100px]"
            options={[
              { value: "uvi", label: "UVI" },
              { value: "safety", label: "Safety" },
              { value: "beauty", label: "Beauty" },
            ]}
          />
        </div>
      }
    >
      {/* Map placeholder */}
      <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 h-[310px]">
        {/* Simulated map with heatmap overlay */}
        <div className="absolute inset-0 bg-[#e8e0d8]">
          {/* Road grid pattern */}
          <svg className="w-full h-full opacity-30" viewBox="0 0 400 310">
            {/* Major roads */}
            <line x1="0" y1="155" x2="400" y2="155" stroke="#bbb" strokeWidth="3" />
            <line x1="200" y1="0" x2="200" y2="310" stroke="#bbb" strokeWidth="3" />
            <line x1="50" y1="0" x2="350" y2="310" stroke="#ccc" strokeWidth="1.5" />
            <line x1="350" y1="0" x2="50" y2="310" stroke="#ccc" strokeWidth="1.5" />
            {/* Minor grid */}
            <line x1="100" y1="0" x2="100" y2="310" stroke="#ddd" strokeWidth="1" />
            <line x1="300" y1="0" x2="300" y2="310" stroke="#ddd" strokeWidth="1" />
            <line x1="0" y1="80" x2="400" y2="80" stroke="#ddd" strokeWidth="1" />
            <line x1="0" y1="230" x2="400" y2="230" stroke="#ddd" strokeWidth="1" />
          </svg>

          {/* Heatmap blobs */}
          <div
            className="absolute w-40 h-40 rounded-full blur-2xl opacity-60"
            style={{
              background: "radial-gradient(circle, #ef4444, #f59e0b, transparent 70%)",
              top: "20%",
              left: "25%",
            }}
          />
          <div
            className="absolute w-32 h-32 rounded-full blur-2xl opacity-50"
            style={{
              background: "radial-gradient(circle, #f59e0b, #22c55e, transparent 70%)",
              top: "45%",
              left: "50%",
            }}
          />
          <div
            className="absolute w-36 h-36 rounded-full blur-2xl opacity-40"
            style={{
              background: "radial-gradient(circle, #22c55e, #3b82f6, transparent 70%)",
              top: "55%",
              left: "15%",
            }}
          />
          <div
            className="absolute w-28 h-28 rounded-full blur-2xl opacity-45"
            style={{
              background: "radial-gradient(circle, #ef4444, #f59e0b, transparent 70%)",
              top: "10%",
              right: "15%",
            }}
          />
        </div>

        {/* Location labels */}
        <div className="absolute top-3 left-3 text-[10px] text-gray-600 bg-white/80 px-2 py-0.5 rounded">
          Klojen
        </div>
        <div className="absolute top-3 right-3 text-[10px] text-gray-600 bg-white/80 px-2 py-0.5 rounded">
          Blimbing
        </div>
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-xs font-semibold text-gray-700 bg-white/90 px-3 py-1 rounded shadow-sm">
          Malang
        </div>
        <div className="absolute bottom-3 right-3 text-[10px] text-gray-500 bg-white/80 px-2 py-0.5 rounded">
          Sukun
        </div>
        <div className="absolute top-1/4 right-1/4 text-[10px] text-gray-500 bg-white/70 px-1.5 py-0.5 rounded">
          Tlogomas
        </div>
        <div className="absolute bottom-1/4 left-1/3 text-[10px] text-gray-500 bg-white/70 px-1.5 py-0.5 rounded">
          Kedungkandang
        </div>

        {/* Map controls */}
        <div className="absolute top-3 right-14 flex flex-col gap-1">
          <button className="w-7 h-7 bg-white rounded shadow text-gray-600 text-sm font-bold border border-gray-200 cursor-pointer hover:bg-gray-50">
            +
          </button>
          <button className="w-7 h-7 bg-white rounded shadow text-gray-600 text-sm font-bold border border-gray-200 cursor-pointer hover:bg-gray-50">
            −
          </button>
        </div>
      </div>

      {/* Color legend */}
      <div className="flex items-center justify-between mt-3 px-1">
        <span className="text-[10px] text-gray-400">0 (Rendah)</span>
        <div
          className="flex-1 mx-2 h-2 rounded-full"
          style={{
            background:
              "linear-gradient(to right, #3b82f6, #22c55e, #f59e0b, #ef4444)",
          }}
        />
        <span className="text-[10px] text-gray-400">10 (Tinggi)</span>
      </div>
    </Card>
  );
}

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
            Detail
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
   Predictive Simulation Section
   ============================================================ */
function SimulationSection() {
  const columns = [
    {
      title: "Indikator",
      dataIndex: "indikator",
      key: "indikator",
      width: 160,
      render: (text: string) => (
        <span className="text-sm font-medium text-gray-700">{text}</span>
      ),
    },
    {
      title: "Sebelum",
      dataIndex: "sebelum",
      key: "sebelum",
      width: 90,
      align: "center" as const,
      render: (val: number | string) => (
        <span className="text-sm text-gray-500">{val}</span>
      ),
    },
    {
      title: "Sesudah",
      dataIndex: "sesudah",
      key: "sesudah",
      width: 90,
      align: "center" as const,
      render: (val: number | string) => (
        <span className="text-sm font-semibold text-gray-800">{val}</span>
      ),
    },
    {
      title: "Perubahan",
      dataIndex: "perubahan",
      key: "perubahan",
      width: 100,
      align: "center" as const,
      render: (text: string, record: { changeType: string }) => (
        <Tag
          color={record.changeType === "positive" ? "success" : "error"}
          className="text-xs font-semibold border-none"
        >
          {text}
        </Tag>
      ),
    },
  ];

  return (
    <div className="mt-5">
      {/* Section Title */}
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-base font-bold text-gray-800">
          Predictive Simulation (Numerical Sliders)
        </h2>
        <InfoCircleOutlined className="text-gray-400 text-sm cursor-pointer" />
      </div>

      <Row gutter={[16, 16]}>
        {/* Selected Location */}
        <Col xs={24} lg={6}>
          <Card className="rounded-xl shadow-sm h-full" styles={{ body: { padding: 16 } }}>
            <div className="text-xs font-semibold text-gray-500 mb-3 tracking-wide">
              Lokasi Terpilih
            </div>
            {/* Location image placeholder */}
            <div className="w-full h-28 rounded-lg bg-gradient-to-br from-emerald-50 to-blue-50 mb-3 flex items-center justify-center overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-200/40 to-blue-200/40" />
              <AimOutlined className="text-3xl text-blue-400/60" />
            </div>
            <div className="text-sm font-bold text-gray-800">
              {selectedLocation.name}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              {selectedLocation.area}
            </div>
            <div className="text-[10px] text-gray-300 mt-1">
              {selectedLocation.lat}, {selectedLocation.lng}
            </div>
            <Button
              type="primary"
              block
              className="mt-4 rounded-lg h-9 font-medium text-xs"
              style={{
                background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                border: "none",
              }}
            >
              Pilih Lokasi Lain
            </Button>
          </Card>
        </Col>

        {/* Design Variables */}
        <Col xs={24} lg={6}>
          <Card className="rounded-xl shadow-sm h-full" styles={{ body: { padding: 16 } }}>
            <div className="text-xs font-semibold text-gray-500 mb-3 tracking-wide">
              Adjust Variabel Desain
            </div>
            <div className="flex flex-col gap-5">
              {sliderConfigs.map((cfg) => (
                <div key={cfg.key}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{cfg.icon}</span>
                      <span className="text-xs font-medium text-gray-600">
                        {cfg.label}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-bold ${
                        cfg.defaultValue >= 0
                          ? "text-emerald-500"
                          : "text-red-500"
                      }`}
                    >
                      {cfg.displayValue}
                    </span>
                  </div>
                  <Slider
                    min={cfg.min}
                    max={cfg.max}
                    defaultValue={cfg.defaultValue}
                    className="simulation-slider"
                    tooltip={{
                      formatter: (val) => `${val}${cfg.unit}`,
                    }}
                  />
                  <div className="flex justify-between text-[10px] text-gray-300 -mt-1">
                    <span>
                      {cfg.min}
                      {cfg.unit}
                    </span>
                    <span>
                      +{cfg.max}
                      {cfg.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* Prediction Table */}
        <Col xs={24} lg={7}>
          <Card
            className="dashboard-card rounded-xl shadow-sm h-full"
            title={
              <span className="font-semibold text-gray-800 text-sm">
                Prediksi Hasil (Before vs After)
              </span>
            }
          >
            <Table
              dataSource={predictionData}
              columns={columns}
              pagination={false}
              size="small"
              className="prediction-table"
              rowClassName="text-sm"
            />
          </Card>
        </Col>

        {/* Recommendation */}
        <Col xs={24} lg={5}>
          <Card className="rounded-xl shadow-sm h-full border-emerald-200" styles={{ body: { padding: 16 } }}>
            <div className="text-xs font-semibold text-gray-500 mb-3 tracking-wide">
              Rekomendasi Kebijakan
            </div>

            {/* Impact badge */}
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 mb-4">
              <CheckCircleFilled className="text-emerald-500 text-base" />
              <div>
                <span className="text-xs text-gray-500">
                  Dampak Simulasi:{" "}
                </span>
                <span className="text-xs font-bold text-emerald-600">
                  {recommendation.impact}
                </span>
              </div>
            </div>

            {/* Recommendation text */}
            <div className="mb-4">
              <div className="text-xs font-semibold text-gray-600 mb-1.5">
                Sistem Rekomendasi:
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                {recommendation.text}
              </p>
            </div>

            <Button
              type="primary"
              block
              className="rounded-lg h-9 font-medium text-xs"
              style={{
                background: "linear-gradient(135deg, #1e293b, #334155)",
                border: "none",
              }}
            >
              💾 Simpan Skenario
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

/* ============================================================
   Dashboard Page (Main Export)
   ============================================================ */
export default function DashboardPage() {
  return (
    <div>
      {/* Title */}
      <h1 className="text-lg font-bold text-gray-800 mb-5">
        Dashboard Overview
      </h1>

      {/* KPI Cards */}
      <Row gutter={[14, 14]} className="mb-5">
        {kpiData.map((kpi) => (
          <Col key={kpi.key} xs={24} sm={12} lg={4}>
            <KpiCard
              title={kpi.title}
              value={kpi.value}
              suffix={kpi.suffix}
              change={kpi.change}
              color={kpi.color}
              sparkData={kpi.sparkData}
            />
          </Col>
        ))}
      </Row>

      {/* Middle Section */}
      <Row gutter={[14, 14]} className="mb-5">
        {/* UVI Heatmap */}
        <Col xs={24} lg={9}>
          <UviHeatmapCard />
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

      {/* Simulation Section */}
      <SimulationSection />
    </div>
  );
}
