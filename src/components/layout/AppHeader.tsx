import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MenuOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Avatar } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import uvipLogo from "../../assets/urbanlens_logo.png";

interface AppHeaderProps {
  collapsed: boolean;
  isMobile?: boolean;
  onToggle: () => void;
}

export default function AppHeader({
  collapsed,
  isMobile = false,
  onToggle,
}: AppHeaderProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  function resolveMediaUrl(
    pathOrUrl?: string | null,
    fallbackBase = API_BASE_URL,
  ): string {
    if (!pathOrUrl) return "";
    const trimmed = pathOrUrl.trim();
    if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("data:") ||
      trimmed.startsWith("blob:")
    ) {
      return trimmed;
    }
    const cleanBase = fallbackBase.replace(/\/$/, "");
    const cleanPath = trimmed.replace(/^\//, "");
    return `${cleanBase}/${cleanPath}`;
  }

  return (
    <div className="flex items-center justify-between w-full h-full px-3 sm:px-5 bg-white">
      {/* Left side: Menu toggle + Logo */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Button
          type="text"
          icon={
            isMobile ? (
              <MenuOutlined className="text-lg text-gray-700" />
            ) : collapsed ? (
              <MenuUnfoldOutlined className="text-lg text-gray-600" />
            ) : (
              <MenuFoldOutlined className="text-lg text-gray-600" />
            )
          }
          onClick={onToggle}
          className="flex items-center justify-center h-9 w-9 text-gray-600 hover:text-blue-600 rounded-lg hover:bg-gray-100"
          aria-label="Toggle navigation menu"
        />
        {isMobile && (
          <img
            src={uvipLogo}
            alt="UrbanLens AI"
            className="h-8 sm:h-9 w-auto object-contain cursor-pointer"
            onClick={() => navigate("/dashboard")}
          />
        )}
      </div>

      {/* Right side: User profile shortcut */}
      <div className="flex items-center gap-2">
        <div
          onClick={() => navigate("/profile")}
          className="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors group"
          title="Lihat Profil"
        >
          <Avatar
            size={32}
            src={
              user?.profile_file_path
                ? resolveMediaUrl(user.profile_file_path)
                : undefined
            }
            icon={<UserOutlined />}
            style={{
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              fontWeight: 600,
            }}
          >
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </Avatar>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-semibold text-gray-800 leading-tight group-hover:text-blue-600 transition-colors">
              {user?.name || "User"}
            </span>
            <span className="text-[10px] text-gray-400 capitalize leading-tight">
              {user?.role || "Admin"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
