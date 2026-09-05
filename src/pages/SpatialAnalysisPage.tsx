import { Card, Row, Col, Tag, Divider } from "antd";
import {
  EnvironmentOutlined,
  SearchOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import KpiCard from "../components/charts/KpiCard";
import MapView from "../components/charts/MapView";
import TrendChart from "../components/charts/TrendChart";
import { kpiData } from "../data/kpiData";
import { selectedLocation } from "../data/simulationData";

const recentPois = [
  { name: "Alun-Alun Malang", distance: "250 m" },
  { name: "Ijen Suites Resort & Convention", distance: "400 m" },
  { name: "Universitas Brawijaya", distance: "850 m" },
  { name: "NANAYA Resort", distance: "1.2 km" },
  { name: "Tiondhar Atas", distance: "1.5 km" },
  { name: "Bontarang Waterpark", distance: "1.9 km" },
];

export default function SpatialAnalysisPage() {
  return (
    <div>
      {/* Title */}
      <div className="flex items-center gap-2 mb-5">
        <EnvironmentOutlined className="text-emerald-500 text-xl" />
        <h1 className="text-lg font-bold text-gray-800">Spatial Analysis</h1>
        <Tag color="green" className="text-xs ml-1">
          Live
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

      {/* Main grid: location summary + map */}
      <Row gutter={[14, 14]}>
        {/* Selected Location Summary */}
        <Col xs={24} lg={7}>
          <Card
            className="dashboard-card rounded-xl shadow-sm h-full"
            title={
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-800 text-sm">
                  Selected Location Summary
                </span>
              </div>
            }
          >
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 mb-3">
              <SearchOutlined className="text-gray-400" />
              <span className="text-sm font-medium text-gray-700 flex-1 truncate">
                {selectedLocation.fullAddress}
              </span>
              <CloseOutlined className="text-gray-300 cursor-pointer hover:text-gray-500" />
            </div>

            <div className="space-y-2.5 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Zone</span>
                <Tag color="blue" className="text-xs border-none">
                  {selectedLocation.zone}
                </Tag>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Coordinates</span>
                <span className="text-xs font-mono text-gray-600">
                  {selectedLocation.lat}, {selectedLocation.lng}
                </span>
              </div>
              <Divider style={{ margin: "6px 0" }} />
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Current UVI Status</span>
                <span className="inline-flex items-center gap-1.5">
                  <Tag color="success" className="text-xs font-bold border-none">
                    {selectedLocation.status} ({selectedLocation.currentUvi.toFixed(2)})
                  </Tag>
                </span>
              </div>
            </div>

            <Divider titlePlacement="left" style={{ margin: "4px 0 10px" }}>
              <span className="text-xs font-semibold text-gray-500">
                Nearby Points of Interest
              </span>
            </Divider>
            <div className="space-y-1.5">
              {recentPois.map((poi) => (
                <div
                  key={poi.name}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <EnvironmentOutlined className="text-blue-400 text-xs flex-shrink-0" />
                  <span className="text-xs text-gray-600 flex-1 truncate">
                    {poi.name}
                  </span>
                  <span className="text-[11px] text-gray-400">{poi.distance}</span>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* Map */}
        <Col xs={24} lg={17}>
          <Card
            className="dashboard-card rounded-xl shadow-sm h-full"
            styles={{ body: { padding: 0 } }}
            title={
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-800 text-sm">
                  City Map — UVI Heatmap
                </span>
                <Tag className="text-xs">Kota Malang</Tag>
              </div>
            }
            extra={
              <a className="text-blue-500 text-xs font-medium cursor-pointer">
                Export Map
              </a>
            }
          >
            <MapView height={468} />
          </Card>
        </Col>
      </Row>

      {/* Recent 7-Day Trend */}
      <Row gutter={[14, 14]} className="mt-5">
        <Col xs={24}>
          <Card
            className="dashboard-card rounded-xl shadow-sm"
            title={
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-800 text-sm">
                  Recent 7-Day Trend
                </span>
                <Tag color="purple" className="text-xs">
                  UVI Score
                </Tag>
              </div>
            }
            extra={
              <a className="text-blue-500 text-xs font-medium cursor-pointer">
                View Details
              </a>
            }
          >
            <TrendChart height={230} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}