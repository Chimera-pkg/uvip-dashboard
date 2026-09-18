import {
  DashboardOutlined,
  ProjectOutlined,
  HeatMapOutlined,
  ExperimentOutlined,
  DatabaseOutlined,
  RobotOutlined,
  CompassOutlined,
  FileTextOutlined,
  TeamOutlined,
  SettingOutlined,
  MonitorOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { createElement } from "react";

type MenuItem = Required<MenuProps>["items"][number];

export const sidebarMenuItems: MenuItem[] = [
  {
    key: "dashboard",
    icon: createElement(DashboardOutlined),
    label: "Dashboard",
  },
  {
    key: "projects",
    icon: createElement(ProjectOutlined),
    label: "Projects",
  },
  {
    key: "spatial-analysis",
    icon: createElement(HeatMapOutlined),
    label: "Spatial Analysis",
  },
  {
    key: "predictive-simulation",
    icon: createElement(ExperimentOutlined),
    label: "Predictive Simulation",
  },
  {
    key: "data-management",
    icon: createElement(DatabaseOutlined),
    label: "Data Management",
    children: [
      { key: "data-upload", label: "Upload Data" },
      { key: "data-list", label: "Data List" },
    ],
  },
  {
    key: "ai-model-center",
    icon: createElement(RobotOutlined),
    label: "AI Model Center",
    children: [
      { key: "model-training", label: "Model Training" },
      { key: "model-results", label: "Results" },
    ],
  },
  {
    key: "surveys-missions",
    icon: createElement(CompassOutlined),
    label: "Surveys & Missions",
  },
  {
    key: "reports",
    icon: createElement(FileTextOutlined),
    label: "Reports",
  },
  {
    key: "users-roles",
    icon: createElement(TeamOutlined),
    label: "Users & Roles",
  },
  {
    key: "settings",
    icon: createElement(SettingOutlined),
    label: "Settings",
  },
  {
    key: "system-monitoring",
    icon: createElement(MonitorOutlined),
    label: "System Monitoring",
  },
];
