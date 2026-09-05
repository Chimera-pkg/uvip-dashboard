import { Card, Empty } from "antd";
import { ToolOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Temporary page for modules that are not yet built.
 * Renders a branded empty state so the layout & navigation remain
 * testable while the real page is in progress.
 */
export default function PlaceholderPage({ title }: { title: string }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Card className="rounded-xl shadow-sm">
      <Empty
        image={<ToolOutlined className="text-5xl text-gray-300" />}
        description={
          <div className="space-y-1">
            <div className="text-base font-semibold text-gray-700">{title}</div>
            <div className="text-xs text-gray-400">
              Module under construction. Active route:{" "}
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                {location.pathname}
              </code>
            </div>
          </div>
        }
      >
        <button
          onClick={() => navigate("/dashboard")}
          className="text-blue-500 text-sm font-medium hover:underline cursor-pointer bg-transparent border-none p-0"
        >
          Back to Dashboard
        </button>
      </Empty>
    </Card>
  );
}