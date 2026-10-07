import { useState, useEffect } from "react";
import { Card, Select, Pagination, Modal, Button } from "antd";
import { PlayCircleFilled, EnvironmentOutlined, UserOutlined, MoreOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { VideoSegmentationResultView } from "../components/VideoSegmentationResultView";
import { useStreetVideos } from "../hooks/useStreetVideos";
import { useProjects } from "../hooks/useProjects";
import dayjs from "dayjs";

export default function StreetVideosPage() {
  const { data, fetchStreetVideos } = useStreetVideos();
  const { projects, fetchProjects, loading: loadingProjects } = useProjects();

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [selectedVideoForResults, setSelectedVideoForResults] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects(1, 100);
  }, [fetchProjects]);

  useEffect(() => {
    if (selectedProjectId) {
      fetchStreetVideos(selectedProjectId, currentPage, pageSize);
    }
  }, [selectedProjectId, currentPage, pageSize, fetchStreetVideos]);

  if (selectedVideoForResults) {
    return (
      <VideoSegmentationResultView
        videoId={selectedVideoForResults}
        onBack={() => setSelectedVideoForResults(null)}
      />
    );
  }

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Street Videos</h1>
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
                  <div 
                    className="relative rounded-lg overflow-hidden bg-gray-900 h-48 mb-4 cursor-pointer group"
                    onClick={() => {
                      setPreviewVideoUrl(fileUrl);
                      setIsPreviewVisible(true);
                    }}
                  >
                    <video 
                      src={fileUrl} 
                      className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity"
                    />
                    
                    {/* Top Left: Aspect Ratio mock */}
                    <div className="absolute top-3 left-3 bg-gray-900/80 text-white text-xs px-2 py-1 rounded-md font-medium">
                      16:9
                    </div>

                    {/* Center Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                        <PlayCircleFilled className="text-3xl text-gray-800" />
                      </div>
                    </div>

                    {/* Bottom Right: Duration mock */}
                    <div className="absolute bottom-3 right-3 bg-gray-900/80 text-white text-xs px-2 py-1 rounded-md font-medium">
                      01:18
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
                      onClick={() => setSelectedVideoForResults(record.id)} 
                      className="font-semibold flex items-center gap-1.5 text-blue-600 hover:text-blue-700"
                    >
                      View Video <ArrowRightOutlined />
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
            className="w-full bg-black rounded-lg max-h-[70vh]"
          />
        )}
      </Modal>
    </div>
  );
}
