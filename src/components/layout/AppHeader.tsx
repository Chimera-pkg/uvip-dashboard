import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  EnvironmentOutlined,
  FilterOutlined,
  BellOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import { Button, Select, DatePicker, Badge, Space } from "antd";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

interface AppHeaderProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function AppHeader({ collapsed, onToggle }: AppHeaderProps) {
  return (
    <div className="flex items-center justify-between w-full h-full px-4">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggle}
          className="text-lg text-gray-600"
        />

        <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-200">
          <EnvironmentOutlined className="text-blue-500" />
          <Select
            defaultValue="kota-malang"
            variant="borderless"
            className="min-w-[130px]"
            options={[
              { value: "kota-malang", label: "Kota Malang" },
              { value: "kota-batu", label: "Kota Batu" },
              { value: "kab-malang", label: "Kab. Malang" },
            ]}
          />
        </div>

        <RangePicker
          defaultValue={[dayjs("2026-06-01"), dayjs("2026-06-16")]}
          format="DD MMM YYYY"
          className="border-gray-200"
        />

        <Button
          icon={<FilterOutlined />}
          className="border-gray-200 text-gray-600"
        >
          Filter
        </Button>
      </div>

      {/* Right side */}
      <Space size={12}>
        <Badge count={5} size="small">
          <Button
            type="text"
            icon={<BellOutlined className="text-lg" />}
            className="text-gray-600"
          />
        </Badge>

        <Button
          type="primary"
          icon={<ExportOutlined />}
          className="bg-red-500 hover:bg-red-600 border-none shadow-md shadow-red-500/20"
        >
          Export
        </Button>
      </Space>
    </div>
  );
}
