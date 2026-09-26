import { useState, useEffect } from "react";
import { Button, Space, Card, Select, Image, Table } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { useStreetPhotos } from "../hooks/useStreetPhotos";
import { useProjects } from "../hooks/useProjects";
import type { StreetPhoto } from "../api/street-photos.service";
import dayjs from "dayjs";
import { SegmentationResultView } from "../components/SegmentationResultView";

export default function StreetPhotosPage() {
  const { data, loading, fetchStreetPhotos } = useStreetPhotos();
  const { projects, fetchProjects, loading: loadingProjects } = useProjects();

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [selectedPhotoForResults, setSelectedPhotoForResults] = useState<
    string | null
  >(null);

  useEffect(() => {
    fetchProjects(1, 100);
  }, [fetchProjects]);

  useEffect(() => {
    if (selectedProjectId) {
      fetchStreetPhotos(selectedProjectId, currentPage, pageSize);
    }
  }, [selectedProjectId, currentPage, pageSize, fetchStreetPhotos]);

  const columns = [
    {
      title: "File",
      dataIndex: "original_filename",
      key: "original_filename",
      render: (text: string, record: StreetPhoto) => {
        const API_BASE_URL =
          import.meta.env.VITE_API_URL || "http://localhost:8000";
        // Assuming file_path doesn't have a leading slash
        const fileUrl = record.file_path.startsWith("http")
          ? record.file_path
          : `${API_BASE_URL}/${record.file_path}`;

        return (
          <div className="flex items-center gap-3">
            <Image
              src={fileUrl}
              alt={text}
              width={64}
              height={48}
              className="object-cover rounded-md border border-gray-200 cursor-pointer"
              fallback="https://via.placeholder.com/64x48?text=Error"
            />
            <div className="flex flex-col">
              <span
                className="font-semibold text-gray-800 text-sm max-w-37.5 truncate"
                title={text}
              >
                {text}
              </span>
              <span className="text-xs text-gray-400">
                {record.file_size_kb} KB
              </span>
            </div>
          </div>
        );
      },
    },
    {
      title: "Location",
      key: "location",
      render: (_: any, record: StreetPhoto) => (
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
    },
    {
      title: "Captured At",
      dataIndex: "captured_at",
      key: "captured_at",
      render: (val: string) => (
        <span className="text-sm">{dayjs(val).format("YYYY-MM-DD HH:mm")}</span>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: StreetPhoto) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => setSelectedPhotoForResults(record.id)}
            size="small"
            style={{ borderRadius: "6px" }}
          >
            Hasil
          </Button>
        </Space>
      ),
    },
  ];

  if (selectedPhotoForResults) {
    return (
      <SegmentationResultView
        photoId={selectedPhotoForResults}
        onBack={() => setSelectedPhotoForResults(null)}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-lg font-bold text-gray-800">
          Street Photos Management
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
            Please select a project to view its street photos
          </p>
        </div>
      )}
    </div>
  );
}
