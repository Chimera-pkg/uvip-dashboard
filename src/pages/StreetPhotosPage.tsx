import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Button, Card, Select, Image, Pagination, message } from "antd";
import {
  EnvironmentOutlined,
  UserOutlined,
  MoreOutlined,
  ArrowRightOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { useStreetPhotos } from "../hooks/useStreetPhotos";
import { useProjects } from "../hooks/useProjects";
import { streetPhotosService } from "../api/street-photos.service";
import { evaluateUviScore, hexToRgba } from "../utils/uvi";
import dayjs from "dayjs";

export default function StreetPhotosPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data, fetchStreetPhotos } = useStreetPhotos();
  const { projects, fetchProjects, loading: loadingProjects } = useProjects();

  const locationState = (location.state as any) || {};

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    () => {
      return (
        locationState.projectId ||
        searchParams.get("projectId") ||
        sessionStorage.getItem("selected_street_photo_project_id") ||
        null
      );
    },
  );

  const [currentPage, setCurrentPage] = useState<number>(() => {
    const fromState = locationState.currentPage;
    const fromSearch = searchParams.get("page");
    const fromStorage = sessionStorage.getItem("selected_street_photo_page");
    return fromState
      ? Number(fromState)
      : fromSearch
        ? Number(fromSearch)
        : fromStorage
          ? Number(fromStorage)
          : 1;
  });

  const [pageSize, setPageSize] = useState(6);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchProjects(1, 100);
  }, [fetchProjects]);

  useEffect(() => {
    if (selectedProjectId) {
      fetchStreetPhotos(selectedProjectId, currentPage, pageSize);
      setSearchParams(
        (prev) => {
          const currentPid = prev.get("projectId");
          const currentPageStr = prev.get("page");
          if (
            currentPid !== selectedProjectId ||
            currentPageStr !== String(currentPage)
          ) {
            return { projectId: selectedProjectId, page: String(currentPage) };
          }
          return prev;
        },
        { replace: true },
      );
    }
  }, [
    selectedProjectId,
    currentPage,
    pageSize,
    fetchStreetPhotos,
    setSearchParams,
  ]);

  const handleProjectChange = (val: string | null) => {
    setSelectedProjectId(val || null);
    setCurrentPage(1);
    if (val) {
      sessionStorage.setItem("selected_street_photo_project_id", val);
      sessionStorage.setItem("selected_street_photo_page", "1");
      setSearchParams({ projectId: val, page: "1" }, { replace: true });
    } else {
      sessionStorage.removeItem("selected_street_photo_project_id");
      sessionStorage.removeItem("selected_street_photo_page");
      setSearchParams({}, { replace: true });
    }
  };

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
    sessionStorage.setItem("selected_street_photo_page", String(page));
    if (selectedProjectId) {
      setSearchParams(
        { projectId: selectedProjectId, page: String(page) },
        { replace: true },
      );
    }
  };

  const handleExport = async () => {
    if (!selectedProjectId) return;
    try {
      setIsExporting(true);
      const blob =
        await streetPhotosService.exportPhotosExcel(selectedProjectId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `StreetPhotos_Project_${selectedProjectId}_${dayjs().format(
        "YYYYMMDD",
      )}.xlsx`;
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

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">
            Galeri Foto
          </h1>
          <p className="text-gray-500 text-sm">
            Foto yang direkam melalui aplikasi Android atau diunggah dari galeri
            ponsel.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <Select
            placeholder="Silahkan Pilih Projek"
            className="w-full sm:w-56"
            loading={loadingProjects}
            onChange={handleProjectChange}
            options={projects.map((p) => ({ label: p.name, value: p.id }))}
            value={selectedProjectId}
            allowClear
          />
          {selectedProjectId && (
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleExport}
              loading={isExporting}
              className="w-full sm:w-auto"
            >
              Export ke Excel
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
                : `${API_BASE_URL.replace(/\/$/, "")}/${record.file_path.replace(
                    /^\//,
                    "",
                  )}`;

              return (
                <Card
                  key={record.id}
                  className="rounded-xl shadow-xs border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                  styles={{ body: { padding: "16px" } }}
                >
                  {/* Thumbnail container */}
                  <div className="relative rounded-lg overflow-hidden bg-gray-100 h-48 mb-4 [&_.ant-image]:w-full [&_.ant-image]:h-full">
                    <Image
                      src={fileUrl}
                      alt={record.original_filename}
                      style={{
                        objectFit: "cover",
                        width: "100%",
                        height: "100%",
                      }}
                      preview={{
                        cover: (
                          <div className="text-white font-medium">Preview</div>
                        ),
                      }}
                      fallback="https://via.placeholder.com/400x300?text=Error"
                    />

                    {/* Top Left: Aspect Ratio mock */}
                    <div className="absolute top-3 left-3 bg-gray-900/80 text-white text-xs px-2 py-1 rounded-md font-medium z-10 pointer-events-none">
                      Photo
                    </div>

                    {/* Top Right: Uvi Score */}
                    {record.prediction?.uvi_score !== null &&
                    record.prediction?.uvi_score !== undefined ? (
                      (() => {
                        const uviInfo = evaluateUviScore(
                          record.prediction.uvi_score,
                          (record as any).raw_score,
                        );
                        const displayScore =
                          Number(record.prediction.uvi_score) > 1
                            ? (Number(record.prediction.uvi_score) / 10).toFixed(2)
                            : Number(record.prediction.uvi_score).toFixed(2);
                        return (
                          <div
                            className="absolute top-3 right-3 text-xs px-2.5 py-1 rounded-md font-bold z-10 pointer-events-none border backdrop-blur-xs flex items-center gap-1.5"
                            style={{
                              backgroundColor: "rgba(17, 24, 39, 0.85)",
                              borderColor: hexToRgba(uviInfo.color, 0.4),
                            }}
                          >
                            <span className="text-gray-300 font-semibold">UVI:</span>
                            <span style={{ color: uviInfo.color }}>
                              {displayScore}
                            </span>
                          </div>
                        );
                      })()
                    ) : null}

                    {/* Bottom Right: Size */}
                    <div className="absolute bottom-3 right-3 bg-gray-900/80 text-white text-xs px-2 py-1 rounded-md font-medium z-10 pointer-events-none">
                      {(record.file_size_kb / 1024).toFixed(2)} MB
                    </div>
                  </div>

                  {/* File Info */}
                  <div className="flex justify-between items-start mb-3">
                    <h3
                      className="font-semibold text-gray-800 truncate text-base"
                      title={record.original_filename}
                    >
                      {record.original_filename}
                    </h3>
                    <Button
                      type="text"
                      icon={<MoreOutlined />}
                      size="small"
                      className="text-gray-500"
                    />
                  </div>

                  {/* Location & Source */}
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center text-gray-500 text-sm gap-1.5">
                      <EnvironmentOutlined />
                      <span className="truncate max-w-37.5">
                        {record.street_name || "Unknown Location"}
                      </span>
                    </div>
                    <div className="bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded text-xs font-medium border border-blue-100">
                      {record.source === "android"
                        ? "Android Camera"
                        : "Phone Gallery"}
                    </div>
                  </div>

                  {/* User & Date */}
                  <div className="flex items-center text-gray-400 text-xs gap-1.5 mb-5">
                    <UserOutlined />
                    <span className="truncate max-w-25">
                      {record.uploader?.name || "Unknown User"}
                    </span>
                    <span>•</span>
                    <span>
                      {record.captured_at
                        ? dayjs(record.captured_at).format("DD MMM YYYY")
                        : "-"}
                    </span>
                  </div>

                  {/* Action Link: Navigate to dedicated segmentation-result page */}
                  <div className="border-t border-gray-100 pt-3 flex justify-center">
                    <Button
                      type="link"
                      onClick={() =>
                        navigate(
                          `/street-photos/segmentation-result/${record.id}`,
                          {
                            state: {
                              originalPhotoUrl: fileUrl,
                              originalFilename: record.original_filename,
                              projectId: selectedProjectId,
                              currentPage,
                            },
                          },
                        )
                      }
                      className="font-semibold flex items-center gap-1.5 text-blue-600 hover:text-blue-700"
                    >
                      Lihat Hasil <ArrowRightOutlined />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {data?.data && data.data.length > 0 && (
            <div className="flex justify-center sm:justify-end mt-4 mb-8 overflow-x-auto max-w-full py-1">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={data?.total_data || 0}
                onChange={handlePageChange}
                showSizeChanger
                responsive
              />
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-48 bg-white rounded-xl border-2 border-dashed border-gray-300">
          <div className="text-4xl mb-3">📁</div>
          <p className="text-gray-500 font-medium">
            Silahkan pilih projek untuk menampilkan foto
          </p>
        </div>
      )}
    </div>
  );
}
