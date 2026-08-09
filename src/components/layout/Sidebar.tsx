import { Menu, Avatar } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { sidebarMenuItems } from "../../data/sidebarMenu";
import { useAuth } from "../../context/AuthContext";
import uvipLogo from "../../assets/uvip-logo.svg";

interface SidebarProps {
  collapsed: boolean;
}

export default function Sidebar({ collapsed }: SidebarProps) {
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col h-full">
      {/* Logo Section */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <img src={uvipLogo} alt="UVIP Logo" className="h-10 w-auto" />
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-[10px] text-blue-300/70 tracking-widest font-medium leading-tight">
              Urban Visual Intelligence
            </span>
            <span className="text-[10px] text-blue-300/70 tracking-widest font-medium leading-tight">
              Platform
            </span>
          </div>
        )}
      </div>

      {/* Menu */}
      <div className="flex-1 overflow-y-auto py-3">
        <Menu
          mode="inline"
          defaultSelectedKeys={["dashboard"]}
          defaultOpenKeys={collapsed ? [] : ["data-management", "ai-model-center"]}
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
              {user?.name?.charAt(0) || "H"}
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-semibold truncate">
                {user?.name || "Herry Santosa"}
              </div>
              <div className="text-blue-300/70 text-xs">
                {user?.role || "Super Admin"}
              </div>
            </div>
            <button
              onClick={logout}
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
