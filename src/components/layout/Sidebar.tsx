import { Menu, Avatar } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { sidebarMenuItems } from "../../data/sidebarMenu";
import { useAuth } from "../../context/AuthContext";
import { resolveMediaUrl } from "../SegmentationResultView";
import uvipLogo from "../../assets/urbanlens_dark_logo.png";
import uvipLogoSmall from "../../assets/urbanlens_logo_small.png";

interface SidebarProps {
  collapsed: boolean;
  onItemClick?: () => void;
}

/**
 * Menu key -> route path (single source of truth for navigation).
 * Matches the keys used in src/data/sidebarMenu.ts.
 */
const menuKeyToPath: Record<string, string> = {
  dashboard: "/dashboard",
  projects: "/projects",
  "street-photos": "/street-photos",
  "street-videos": "/street-videos",
  "visual-analysis": "/visual-analysis",
  "semantic-segmentation": "/semantic-segmentation",
  "uvi-analysis": "/uvi-analysis",
  "analisis-uvi": "/uvi-analysis",
  "ai-recommendations": "/ai-recommendations",
  "uvi-heatmap": "/uvi-heatmap",
  "peta-panas-uvi": "/uvi-heatmap",
  "corridor-comparison": "/corridor-comparison",
  "perbandingan-koridor": "/corridor-comparison",
  "project-team": "/project-team",
  "tim-proyek": "/project-team",
  profile: "/profile",
  "user-profile": "/profile",
  "spatial-analysis": "/spatial-analysis",
  "predictive-simulation": "/predictive-simulation",
  "data-upload": "/data-management/upload",
  "data-list": "/data-management/list",
  "model-training": "/ai-model-center/training",
  "model-results": "/ai-model-center/results",
  "surveys-missions": "/surveys-missions",
  reports: "/reports",
  "users-roles": "/users-roles",
  settings: "/settings",
  "system-monitoring": "/system-monitoring",
};

export default function Sidebar({ collapsed, onItemClick }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get active key from pathname (e.g. "/projects" -> "projects")
  const activeKey = location.pathname.split("/")[1] || "dashboard";

  return (
    <div className="flex flex-col h-full">
      {/* Logo Section */}
      <div
        className="flex items-center gap-3 px-5 py-5 border-b border-white/10 cursor-pointer"
        onClick={() => {
          navigate("/dashboard");
          onItemClick?.();
        }}
      >
        <img
          src={collapsed ? uvipLogoSmall : uvipLogo}
          alt="UVIP Logo"
          className={collapsed ? "h-14 w-auto" : "h-24 w-auto"}
        />
      </div>

      {/* Menu */}
      <div className="flex-1 overflow-y-auto py-3">
        <Menu
          mode="inline"
          selectedKeys={[activeKey]}
          defaultOpenKeys={
            collapsed ? [] : ["data-management", "ai-model-center"]
          }
          onClick={({ key }) => {
            const target = menuKeyToPath[key];
            if (target) {
              navigate(target);
              onItemClick?.();
            }
          }}
          items={sidebarMenuItems}
          className="sidebar-menu border-r-0"
          style={{ background: "transparent" }}
          inlineCollapsed={collapsed}
        />
      </div>

      {/* User Profile */}
      {!collapsed ? (
        <div
          onClick={() => {
            navigate("/profile");
            onItemClick?.();
          }}
          className={`mx-3 mb-4 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200 cursor-pointer group ${
            activeKey === "profile" || activeKey === "user-profile"
              ? "bg-white/15 border-blue-400/50 shadow-sm"
              : ""
          }`}
          title="Lihat Profil Pengguna"
        >
          <div className="flex items-center gap-3">
            <Avatar
              size={40}
              src={
                user?.profile_file_path
                  ? resolveMediaUrl(user.profile_file_path)
                  : undefined
              }
              style={{
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                fontWeight: 600,
              }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-semibold truncate capitalize group-hover:text-blue-300 transition-colors">
                {user?.name || "User"}
              </div>
              <div className="text-blue-300/70 text-xs capitalize">
                {user?.role || "Admin"}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                logout();
                onItemClick?.();
              }}
              className="text-slate-400 hover:text-red-400 transition-colors cursor-pointer bg-transparent border-none p-1.5 rounded-lg hover:bg-white/10"
              title="Logout"
            >
              <LogoutOutlined />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => {
            navigate("/profile");
            onItemClick?.();
          }}
          className={`mx-auto mb-4 p-2 rounded-xl cursor-pointer hover:bg-white/10 transition-all ${
            activeKey === "profile" || activeKey === "user-profile"
              ? "bg-white/15"
              : ""
          }`}
          title="Lihat Profil Pengguna"
        >
          <Avatar
            size={38}
            src={
              user?.profile_file_path
                ? resolveMediaUrl(user.profile_file_path)
                : undefined
            }
            style={{
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              fontWeight: 600,
            }}
          >
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </Avatar>
        </div>
      )}
    </div>
  );
}
