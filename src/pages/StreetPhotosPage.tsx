import { useState, useEffect } from "react";
import { Button, Card, Select, Image, Pagination, message } from "antd";
import { EnvironmentOutlined, UserOutlined, MoreOutlined, ArrowRightOutlined, DownloadOutlined } from "@ant-design/icons";
import { useStreetPhotos } from "../hooks/useStreetPhotos";
import { useProjects } from "../hooks/useProjects";
import { streetPhotosService } from "../api/street-photos.service";
import dayjs from "dayjs";
import { SegmentationResultView } from "../components/SegmentationResultView";

export default function StreetPhotosPage() {
  const { data, fetchStreetPhotos } = useStreetPhotos();
  const { projects, fetchProjects, loading: loadingProjects } = useProjects();

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const [selectedPhotoForResults, setSelectedPhotoForResults] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects(1, 100);
  }, [fetchProjects]);

  useEffect(() => {
    if (selectedProjectId) {
      fetchStreetPhotos(selectedProjectId, currentPage, pageSize);
    }
  }, [selectedProjectId, currentPage, pageSize, fetchStreetPhotos]);

  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!selectedProjectId) return;
    try {
      setIsExporting(true);
      const blob = await streetPhotosService.exportPhotosExcel(selectedProjectId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `StreetPhotos_Project_${selectedProjectId}_${dayjs().format("YYYYMMDD")}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      message.success("Export successful!");
    } catch (error) {
      console.error("Export failed:", error);
      message.error("Failed to export photos");
    } finally {
      setIsExporting(false);
    }
  };

  if (selectedPhotoForResults) {
    return (
      <SegmentationResultView
        photoId={selectedPhotoForResults}
        onBack={() => setSelectedPhotoForResults(null)}
      />
    );
  }

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Street Photos</h1>
          <p className="text-gray-500">Recorded in the Android app or uploaded from your phone gallery.</p>
        </div>
        <div className="flex gap-3">
          <Select
            placeholder="Select a Project"
            style={{ width: 200 }}
            loading={loadingProjects}
            onChange={(val) => {
              setSelectedProjectId(val);
              setCurrentPage(1);
            }}
            options={projects.map((p) => ({ label: p.name, value: p.id }))}
            value={selectedProjectId}
          />
          {selectedProjectId && (
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleExport}
              loading={isExporting}
            >
              Export to Excel
            </Button>
          )}
        </div>
      </div>

      {selectedProjectId ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {data?.data.map((record) => {
              const fileUrl = record.file_path.startsWith("http")
                ? record.file_path
                : `${API_BASE_URL.replace(/\/$/, '')}/${record.file_path.replace(/^\//, '')}`;

              return (
                <Card
                  key={record.id}
                  className="rounded-xl shadow-sm border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                  styles={{ body: { padding: '16px' } }}
                >
                  {/* Thumbnail container */}
                  <div className="relative rounded-lg overflow-hidden bg-gray-100 h-48 mb-4 [&_.ant-image]:w-full [&_.ant-image]:h-full">
                    <Image
                      src={fileUrl}
                      alt={record.original_filename}
                      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                      preview={{ mask: <div className="text-white font-medium">Preview</div> }}
                      fallback="https://via.placeholder.com/400x300?text=Error"
                    />
                    
                    {/* Top Left: Aspect Ratio mock */}
                    <div className="absolute top-3 left-3 bg-gray-900/80 text-white text-xs px-2 py-1 rounded-md font-medium z-10 pointer-events-none">
                      Photo
                    </div>

                    {/* Bottom Right: Size */}
                    <div className="absolute bottom-3 right-3 bg-gray-900/80 text-white text-xs px-2 py-1 rounded-md font-medium z-10 pointer-events-none">
                      {(record.file_size_kb / 1024).toFixed(2)} MB
                    </div>
                  </div>

                  {/* File Info */}
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-800 truncate text-base" title={record.original_filename}>
                      {record.original_filename}
                    </h3>
                    <Button type="text" icon={<MoreOutlined />} size="small" className="text-gray-500" />
                  </div>

                  {/* Location & Source */}
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center text-gray-500 text-sm gap-1.5">
                      <EnvironmentOutlined />
                      <span className="truncate max-w-37.5">{record.street_name || "Unknown Location"}</span>
                    </div>
                    <div className="bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded text-xs font-medium border border-blue-100">
                      {record.source === 'android' ? 'Android Camera' : 'Phone Gallery'}
                    </div>
                  </div>

                  {/* User & Date */}
                  <div className="flex items-center text-gray-400 text-xs gap-1.5 mb-5">
                    <UserOutlined />
                    <span className="truncate max-w-25">{record.uploaded_by || "Unknown User"}</span>
                    <span>•</span>
                    <span>{record.captured_at ? dayjs(record.captured_at).format("DD MMM YYYY") : "-"}</span>
                  </div>

                  {/* Action Link */}
                  <div className="border-t border-gray-100 pt-3 flex justify-center">
                    <Button 
                      type="link" 
                      onClick={() => setSelectedPhotoForResults(record.id)} 
                      className="font-semibold flex items-center gap-1.5 text-blue-600 hover:text-blue-700"
                    >
                      View Photo <ArrowRightOutlined />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
          
          {data?.data && data.data.length > 0 && (
            <div className="flex justify-end mt-4 mb-8">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={data?.total_data || 0}
                onChange={(page, size) => {
                  setCurrentPage(page);
                  setPageSize(size);
                }}
                showSizeChanger
              />
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border-2 border-dashed border-gray-300">
          <div className="text-4xl mb-3">📁</div>
          <p className="text-gray-500 font-medium">
            Please select a project to view its street photos
          </p>
        </div>
      )}
    </div>
  );
}
