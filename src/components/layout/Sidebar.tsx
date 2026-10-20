import { Menu, Avatar } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { sidebarMenuItems } from "../../data/sidebarMenu";
import { useAuth } from "../../context/AuthContext";
import uvipLogo from "../../assets/urbanlens_logo.png";
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
      {!collapsed && (
        <div className="mx-3 mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3">
            <Avatar
              size={40}
              style={{
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                fontWeight: 600,
              }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-semibold truncate capitalize">
                {user?.name || "User"}
              </div>
              <div className="text-blue-300/70 text-xs capitalize">
                {user?.role || "Admin"}
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                onItemClick?.();
              }}
              className="text-slate-400 hover:text-red-400 transition-colors cursor-pointer bg-transparent border-none"
              title="Logout"
            >
              <LogoutOutlined />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
