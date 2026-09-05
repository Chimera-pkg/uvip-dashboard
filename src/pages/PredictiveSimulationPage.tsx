import { useMemo, useState } from "react";
import { Card, Row, Col, Slider, Tag, Button, Divider } from "antd";
import {
  EnvironmentOutlined,
  ExperimentOutlined,
  CloseOutlined,
  CheckCircleFilled,
  ThunderboltOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import KpiCard from "../components/charts/KpiCard";
import MapView from "../components/charts/MapView";
import { kpiData } from "../data/kpiData";
import {
  sliderConfigs,
  selectedLocation,
  recommendationText,
  simulate,
} from "../data/simulationData";

export default function PredictiveSimulationPage() {
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      sliderConfigs.map((s) => [s.key, s.defaultValue]),
    ),
  );

  const result = useMemo(() => simulate(values), [values]);

  const setSlider = (key: string, v: number) =>
    setValues((prev) => ({ ...prev, [key]: v }));

  return (
    <div>
      {/* Title */}
      <div className="flex items-center gap-2 mb-5">
        <ExperimentOutlined className="text-purple-500 text-xl" />
        <h1 className="text-lg font-bold text-gray-800">Predictive Simulation</h1>
        <Tag color="purple" className="text-xs ml-1">
          Scenario Modeling
        </Tag>
      </div>

      {/* KPI Cards */}
      <Row gutter={[14, 14]} className="mb-5">
        {kpiData.map((kpi) => (
          <Col key={kpi.key} xs={24} sm={12} lg={4}>
            <KpiCard kpi={kpi} />
          </Col>
        ))}
      </Row>

      <Row gutter={[14, 14]}>
        {/* Left: Selected Location + Map */}
        <Col xs={24} lg={9}>
          <div className="flex flex-col gap-3.5 h-full">
            <Card
              className="dashboard-card rounded-xl shadow-sm"
              title={
                <div className="flex items-center gap-2">
                  <EnvironmentOutlined className="text-blue-500" />
                  <span className="font-semibold text-gray-800 text-sm">
                    Selected Location
                  </span>
                  <CloseOutlined className="text-gray-300 cursor-pointer hover:text-gray-500 ml-auto" />
                </div>
              }
            >
              <div className="space-y-2">
                <div>
                  <div className="text-sm font-semibold text-gray-800">
                    {selectedLocation.name}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {selectedLocation.fullAddress}
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Tag color="blue" className="text-xs border-none">
                    {selectedLocation.zone}
                  </Tag>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="font-mono">
                    {selectedLocation.lat}, {selectedLocation.lng}
                  </span>
                </div>
                <Divider style={{ margin: "6px 0" }} />
                <div className="flex justify-between items-center pt-1">
                  <span className="text-xs text-gray-400">Current UVI Status</span>
                  <Tag color="success" className="text-xs font-bold border-none">
                    {selectedLocation.status} ({selectedLocation.currentUvi.toFixed(2)})
                  </Tag>
                </div>
              </div>
            </Card>

            <Card
              className="dashboard-card rounded-xl shadow-sm flex-1"
              styles={{ body: { padding: 0 } }}
              title={
                <span className="font-semibold text-gray-800 text-sm">Location Map</span>
              }
            >
              <MapView
                height={280}
                showStats={false}
                initialLayer="uvi"
              />
            </Card>
          </div>
        </Col>

        {/* Right: sliders + results + recommendation */}
        <Col xs={24} lg={15}>
          <div className="flex flex-col gap-3.5">
            {/* Adjust Design Variables */}
            <Card
              className="dashboard-card rounded-xl shadow-sm"
              title={
                <div className="flex items-center gap-2">
                  <span>⚙️</span>
                  <span className="font-semibold text-gray-800 text-sm">
                    Adjust Design Variables
                  </span>
                  <Tag color="blue" className="text-xs">{selectedLocation.name}</Tag>
                  <CloseOutlined className="text-gray-300 cursor-pointer ml-auto" />
                </div>
              }
              extra={
                <a
                  className="text-blue-500 text-xs font-medium cursor-pointer"
                  onClick={() =>
                    setValues(
                      Object.fromEntries(
                        sliderConfigs.map((s) => [s.key, s.defaultValue]),
                      ),
                    )
                  }
                >
                  Reset
                </a>
              }
            >
              <div className="flex flex-col gap-5 pt-2">
                {sliderConfigs.map((s) => (
                  <div key={s.key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {s.icon} {s.label}
                      </span>
                      <Tag
                        color={
                          values[s.key] >= 0 ? "success" : "error"
                        }
                        className="text-sm font-bold border-none"
                        style={{ minWidth: 56, textAlign: "center" }}
                      >
                        {s.format(values[s.key])}
                      </Tag>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-12 text-right">
                        -{Math.abs(s.min)}
                        {s.unit === "m" ? "m" : "%"}
                      </span>
                      <Slider
                        className="simulation-slider flex-1"
                        min={s.min}
                        max={s.max}
                        step={s.step}
                        value={values[s.key]}
                        onChange={(v) => setSlider(s.key, v)}
                        marks={{
                          [s.min]: null,
                          0: <span className="text-xs text-gray-400">0</span>,
                          [s.max]: null,
                        }}
                        tooltip={{
                          formatter: (v) => s.format(v ?? 0),
                        }}
                      />
                      <span className="text-xs text-gray-400 w-12">
                        +{s.max}
                        {s.unit === "m" ? "m" : "%"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Prediction Results + Recommendation */}
            <Row gutter={[14, 14]}>
              <Col xs={24} md={14}>
                <Card
                  className="dashboard-card rounded-xl shadow-sm h-full"
                  title={
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800 text-sm">
                        Prediction Results
                      </span>
                    </div>
                  }
                  extra={
                    <a className="text-blue-500 text-xs font-medium cursor-pointer">
                      View Details
                    </a>
                  }
                >
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                        <th className="py-2 font-medium">Metric</th>
                        <th className="py-2 font-medium text-right">Before</th>
                        <th className="py-2 font-medium text-right">After</th>
                        <th className="py-2 font-medium text-right">Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.rows.map((r) => (
                        <tr
                          key={r.key}
                          className="border-b border-gray-50 last:border-0"
                        >
                          <td className="py-2.5 font-medium text-gray-700">
                            {r.metric}
                          </td>
                          <td className="py-2.5 text-right text-gray-400">
                            {r.before}
                            {r.isPercent ? "%" : ""}
                          </td>
                          <td className="py-2.5 text-right font-semibold text-gray-800">
                            {r.after}
                            {r.isPercent ? "%" : ""}
                          </td>
                          <td className="py-2.5 text-right">
                            <Tag
                              color={r.changeType === "positive" ? "success" : "error"}
                              className="text-xs font-bold border-none"
                            >
                              {r.changeLabel}
                            </Tag>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              </Col>

              <Col xs={24} md={10}>
                <Card
                  className="dashboard-card rounded-xl shadow-sm h-full"
                  title={
                    <div className="flex items-center gap-2">
                      <ThunderboltOutlined className="text-amber-500" />
                      <span className="font-semibold text-gray-800 text-sm">
                        Recommendation
                      </span>
                    </div>
                  }
                >
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs text-gray-400 mb-1">
                        Impact of the Simulation
                      </div>
                      <Tag
                        color={result.impact === "positive" ? "success" : "error"}
                        className="text-sm font-bold border-none px-3 py-1"
                      >
                        {result.impact === "positive" ? "Positive" : "Negative"}
                      </Tag>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Summary</div>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {recommendationText}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                      <Button
                        type="primary"
                        icon={<PlayCircleOutlined />}
                        size="small"
                        className="bg-blue-500 hover:bg-blue-600 border-none"
                      >
                        Apply Scenario
                      </Button>
                      <Button
                        size="small"
                        icon={<CheckCircleFilled />}
                        className="border-gray-200 text-gray-600"
                      >
                        Save as Baseline
                      </Button>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
    </div>
  );
}