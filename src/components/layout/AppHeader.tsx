import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { Button } from "antd";
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
  return (
    <div className="flex items-center justify-between w-full h-full px-3 sm:px-4 bg-white">
      {/* Left side */}
      <div className="flex items-center gap-2.5">
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
          className="flex items-center justify-center h-9 w-9 text-gray-600 hover:text-blue-600"
        />
        {isMobile && (
          <img
            src={uvipLogo}
            alt="UrbanLens AI"
            className="h-8 w-auto object-contain"
          />
        )}
      </div>
    </div>
  );
}
