import { useState, useEffect } from "react";
import { Card, Select, Table, Tag, Modal, Space, Button } from "antd";
import { PlaySquareOutlined, EyeOutlined } from "@ant-design/icons";
import { VideoSegmentationResultView } from "../components/VideoSegmentationResultView";
import { useStreetVideos } from "../hooks/useStreetVideos";
import { useProjects } from "../hooks/useProjects";
import type { StreetVideo } from "../api/street-videos.service";
import dayjs from "dayjs";

export default function StreetVideosPage() {
  const { data, loading, fetchStreetVideos } = useStreetVideos();
  const { projects, fetchProjects, loading: loadingProjects } = useProjects();

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [selectedVideoForResults, setSelectedVideoForResults] = useState<
    string | null
  >(null);

  useEffect(() => {
    fetchProjects(1, 100);
  }, [fetchProjects]);

  useEffect(() => {
    if (selectedProjectId) {
      fetchStreetVideos(selectedProjectId, currentPage, pageSize);
    }
  }, [selectedProjectId, currentPage, pageSize, fetchStreetVideos]);

  const columns = [
    {
      title: "File",
      dataIndex: "original_filename",
      key: "original_filename",
      render: (text: string, record: StreetVideo) => {
        const API_BASE_URL =
          import.meta.env.VITE_API_URL || "http://localhost:8000";
        const fileUrl = record.file_path.startsWith("http")
          ? record.file_path
          : `${API_BASE_URL}/${record.file_path}`;

        return (
          <div className="flex items-center gap-3">
            <div
              className="w-16 h-12 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center text-gray-400 cursor-pointer"
              onClick={() => {
                setPreviewVideoUrl(fileUrl);
                setIsPreviewVisible(true);
              }}
            >
              <PlaySquareOutlined className="text-2xl" />
            </div>
            <div className="flex flex-col">
              <span
                className="font-semibold text-blue-600 text-sm max-w-37.5 truncate hover:underline cursor-pointer"
                title={text}
                onClick={() => {
                  setPreviewVideoUrl(fileUrl);
                  setIsPreviewVisible(true);
                }}
              >
                {text}
              </span>
              <span className="text-xs text-gray-400">
                {(record.file_size_kb / 1024).toFixed(2)} MB
              </span>
            </div>
          </div>
        );
      },
    },
    {
      title: "Location",
      key: "location",
      render: (_: any, record: StreetVideo) => (
        <div className="flex flex-col">
          <span className="text-sm">{record.street_name || "Unknown"}</span>
          <span className="text-xs text-gray-400">
            Lat: {record.latitude.toFixed(5)}, Lng:{" "}
            {record.longitude.toFixed(5)}
          </span>
        </div>
      ),
    },
    {
      title: "Source",
      dataIndex: "source",
      key: "source",
    },
    {
      title: "Status",
      dataIndex: "processing_status",
      key: "processing_status",
      render: (status: string) => {
        let color = "default";
        if (status === "completed") color = "green";
        else if (status === "queued") color = "blue";
        else if (status === "processing") color = "orange";
        else if (status === "failed") color = "red";
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Captured At",
      dataIndex: "captured_at",
      key: "captured_at",
      render: (val: string) => (
        <span className="text-sm">
          {val ? dayjs(val).format("YYYY-MM-DD HH:mm") : "-"}
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: StreetVideo) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => setSelectedVideoForResults(record.id)}
            size="small"
            style={{ borderRadius: "6px" }}
          >
            Hasil
          </Button>
        </Space>
      ),
    },
  ];

  if (selectedVideoForResults) {
    return (
      <VideoSegmentationResultView
        videoId={selectedVideoForResults}
        onBack={() => setSelectedVideoForResults(null)}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-lg font-bold text-gray-800">
          Street Videos Management
        </h1>
        <div className="flex gap-3">
          <Select
            placeholder="Select a Project"
            style={{ width: 250 }}
            loading={loadingProjects}
            onChange={(val) => {
              setSelectedProjectId(val);
              setCurrentPage(1);
            }}
            options={projects.map((p) => ({ label: p.name, value: p.id }))}
            value={selectedProjectId}
          />
        </div>
      </div>

      {selectedProjectId ? (
        <Card
          className="rounded-xl shadow-sm overflow-hidden"
          styles={{ body: { padding: 0 } }}
        >
          <Table
            columns={columns}
            dataSource={data?.data || []}
            rowKey="id"
            loading={loading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: data?.total_data || 0,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
            }}
          />
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 bg-white/60 rounded-xl border-2 border-dashed border-gray-300">
          <div className="text-4xl mb-3">📁</div>
          <p className="text-gray-500 font-medium">
            Please select a project to view its street videos
          </p>
        </div>
      )}

      <Modal
        title="Video Preview"
        open={isPreviewVisible}
        onCancel={() => {
          setIsPreviewVisible(false);
          setPreviewVideoUrl(null);
        }}
        footer={null}
        width={800}
        destroyOnClose
      >
        {previewVideoUrl && (
          <video
            src={previewVideoUrl}
            controls
            autoPlay
            className="w-full h-1/2 bg-black rounded-lg"
          />
        )}
      </Modal>
    </div>
  );
}
