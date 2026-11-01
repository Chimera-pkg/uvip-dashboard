import { useEffect, useState } from "react";
import { Card, Row, Col, Spin, Empty } from "antd";
import { EnvironmentOutlined, DashboardOutlined } from "@ant-design/icons";
import KpiCard from "../components/charts/KpiCard";
import MapView from "../components/charts/MapView";
import { kpiData as initialKpiData, type KpiItem } from "../data/kpiData";
import apiClient from "../api/client";
import {
  streetPhotosService,
  type StreetPhotoLocation,
} from "../api/street-photos.service";
import { useProjects } from "../hooks/useProjects";
import { useNavigate } from "react-router-dom";

/* ============================================================
   Recent Projects Card
   ============================================================ */
function RecentProjectsCard() {
  const navigate = useNavigate();
  const { projects, fetchProjects, loading } = useProjects();

  useEffect(() => {
    fetchProjects(1, 10);
  }, [fetchProjects]);

  const getUviBadgeClass = (score: number) => {
    if (score >= 7) return "uvi-badge-high";
    if (score >= 4) return "uvi-badge-medium";
    return "uvi-badge-low";
  };

  return (
    <Card
      className="dashboard-card rounded-xl shadow-sm h-full flex flex-col"
      styles={{
        body: {
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "16px 20px",
          minHeight: 380,
        },
      }}
      title={
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-800 text-sm">
            Recent Projects
          </span>
          <a
            className="text-blue-500 text-xs font-medium hover:text-blue-600 transition-colors cursor-pointer"
            onClick={() => navigate("/projects")}
          >
            View All
          </a>
        </div>
      }
    >
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
          <Spin size="default" />
          <span className="text-xs">Memuat project...</span>
        </div>
      ) : projects.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-10">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span className="text-gray-400 text-xs">Belum ada project</span>
            }
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto max-h-[380px] pr-1">
          {projects.map((p) => (
            <div
              key={p.id}
              onClick={() => navigate("/projects")}
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-blue-50/50 hover:border-blue-100 border border-transparent transition-all duration-200 cursor-pointer group"
            >
              {/* Thumbnail */}
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-100 to-blue-100 flex-shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
                <EnvironmentOutlined className="text-blue-500 text-base" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-800 truncate group-hover:text-blue-600 transition-colors">
                    {p.name}
                  </span>
                  <span className={getUviBadgeClass(p.uvi_score)}>
                    PVI {p.uvi_score?.toFixed(2)}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-0.5 truncate">
                  {p.location || "Tanpa lokasi"}
                </div>
              </div>

              {/* Right info */}
              <div className="text-right flex-shrink-0">
                <div className="text-[11px] text-gray-400 font-medium">
                  {new Date(p.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

/* ============================================================
   Dashboard Page (Main Export)
   ============================================================ */
export default function DashboardPage() {
  const [kpis, setKpis] = useState<KpiItem[]>(initialKpiData);
  const [photoLocations, setPhotoLocations] = useState<StreetPhotoLocation[]>(
    [],
  );
  const [loadingLocations, setLoadingLocations] = useState<boolean>(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );

  const { projects, fetchProjects, loading: loadingProjects } = useProjects();

  useEffect(() => {
    fetchProjects(1, 100);
  }, [fetchProjects]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await apiClient.get("/projects/home-dashboard");
        if (response.data?.status === "success") {
          const { total_projects, average_scores } = response.data;

          setKpis((prevKpis) =>
            prevKpis.map((kpi) => {
              switch (kpi.key) {
                case "total-projects":
                  return { ...kpi, value: total_projects.toString() };
                case "avg-safety":
                  return {
                    ...kpi,
                    value: average_scores.safety_score.toFixed(2),
                  };
                case "avg-beauty":
                  return {
                    ...kpi,
                    value: average_scores.beauty_score.toFixed(2),
                  };
                case "avg-comfort":
                  return {
                    ...kpi,
                    value: average_scores.comfort_score.toFixed(2),
                  };
                case "avg-uvi":
                  return {
                    ...kpi,
                    value: average_scores.uvi_score.toFixed(2),
                  };
                default:
                  return kpi;
              }
            }),
          );
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoadingLocations(true);
        const locations =
          await streetPhotosService.getLocations(selectedProjectId);
        setPhotoLocations(locations);
      } catch (error) {
        console.error("Failed to fetch street photo locations:", error);
      } finally {
        setLoadingLocations(false);
      }
    };

    fetchLocations();
  }, [selectedProjectId]);

  return (
    <div>
      {/* Title */}
      <div className="flex items-center gap-2 mb-5">
        <DashboardOutlined className="text-blue-500 text-xl" />
        <h1 className="text-lg font-bold text-gray-800">Dashboard Overview</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 mb-5">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.key} kpi={kpi} />
        ))}
      </div>

      {/* Middle Section */}
      <Row gutter={[16, 16]} className="mb-5">
        {/* UVI Heatmap map */}
        <Col xs={24} lg={14} className="flex flex-col">
          <Card
            className="dashboard-card rounded-xl shadow-sm h-full flex flex-col"
            styles={{ body: { padding: 0, flex: 1 } }}
            title={
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-800 text-sm">
                  PVI Heatmap
                </span>
              </div>
            }
          >
            <MapView
              height={310}
              locations={photoLocations}
              loading={loadingLocations}
              projects={projects}
              selectedProjectId={selectedProjectId}
              onProjectChange={(projectId) => setSelectedProjectId(projectId)}
              loadingProjects={loadingProjects}
            />
          </Card>
        </Col>

        {/* Recent Projects Card */}
        <Col xs={24} lg={10} className="flex flex-col">
          <RecentProjectsCard />
        </Col>
      </Row>
    </div>
  );
}
