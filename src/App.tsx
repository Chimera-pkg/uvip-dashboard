import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import MainLayout from "./components/layout/MainLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProjectsPage from "./pages/ProjectsPage";
import StreetPhotosPage from "./pages/StreetPhotosPage";
import StreetVideosPage from "./pages/StreetVideosPage";
import SpatialAnalysisPage from "./pages/SpatialAnalysisPage";
import PredictiveSimulationPage from "./pages/PredictiveSimulationPage";
import SegmentationResultPage from "./pages/SegmentationResultPage";
import VisualAnalysisPage from "./pages/VisualAnalysisPage";
import SemanticSegmentationPage from "./pages/SemanticSegmentationPage";
import UviAnalysisPage from "./pages/UviAnalysisPage";
import AiRecommendationsPage from "./pages/AiRecommendationsPage";
import AiRecommendationDetailPage from "./pages/AiRecommendationDetailPage";
import UviHeatmapPage from "./pages/UviHeatmapPage";
import CorridorComparisonPage from "./pages/CorridorComparisonPage";
import ProjectTeamPage from "./pages/ProjectTeamPage";
import PlaceholderPage from "./pages/PlaceholderPage";

/**
 * Route table of the still-unbuilt modules (single source of truth for
 * the placeholder pages). Real pages replace the placeholder entry by
 * registering an explicit <Route> below it.
 */
const placeholderRoutes: Array<{ title: string; path: string }> = [
  { title: "Upload Data", path: "/data-management/upload" },
  { title: "Data List", path: "/data-management/list" },
  { title: "Model Training", path: "/ai-model-center/training" },
  { title: "Results", path: "/ai-model-center/results" },
  { title: "Surveys & Missions", path: "/surveys-missions" },
  { title: "Reports", path: "/reports" },
  { title: "Users & Roles", path: "/users-roles" },
  { title: "Settings", path: "/settings" },
  { title: "System Monitoring", path: "/system-monitoring" },
];

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
        }
      />
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/street-photos" element={<StreetPhotosPage />} />
        <Route
          path="/street-photos/segmentation-result/:photoId"
          element={<SegmentationResultPage type="photo" />}
        />
        <Route path="/street-videos" element={<StreetVideosPage />} />
        <Route
          path="/street-videos/segmentation-result/:videoId"
          element={<SegmentationResultPage type="video" />}
        />
        <Route path="/visual-analysis" element={<VisualAnalysisPage />} />
        <Route
          path="/semantic-segmentation"
          element={<SemanticSegmentationPage />}
        />
        <Route path="/uvi-analysis" element={<UviAnalysisPage />} />
        <Route
          path="/analisis-uvi"
          element={<Navigate to="/uvi-analysis" replace />}
        />
        <Route
          path="/ai-recommendations"
          element={<AiRecommendationsPage />}
        />
        <Route
          path="/ai-recommendations/:photoId"
          element={<AiRecommendationDetailPage />}
        />
        <Route path="/uvi-heatmap" element={<UviHeatmapPage />} />
        <Route
          path="/peta-panas-uvi"
          element={<Navigate to="/uvi-heatmap" replace />}
        />
        <Route
          path="/corridor-comparison"
          element={<CorridorComparisonPage />}
        />
        <Route
          path="/perbandingan-koridor"
          element={<Navigate to="/corridor-comparison" replace />}
        />
        <Route path="/project-team" element={<ProjectTeamPage />} />
        <Route
          path="/tim-proyek"
          element={<Navigate to="/project-team" replace />}
        />
        <Route path="/spatial-analysis" element={<SpatialAnalysisPage />} />
        <Route
          path="/predictive-simulation"
          element={<PredictiveSimulationPage />}
        />
        {placeholderRoutes.map(({ title, path }) => (
          <Route
            key={path}
            path={path}
            element={<PlaceholderPage title={title} />}
          />
        ))}
      </Route>

      <Route
        path="*"
        element={
          <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
        }
      />
    </Routes>
  );
}
