import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import MainLayout from "./components/layout/MainLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProjectsPage from "./pages/ProjectsPage";
import StreetPhotosPage from "./pages/StreetPhotosPage";
import SpatialAnalysisPage from "./pages/SpatialAnalysisPage";
import PredictiveSimulationPage from "./pages/PredictiveSimulationPage";
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
