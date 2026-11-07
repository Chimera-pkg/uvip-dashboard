import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Select, Button, Image, Skeleton } from "antd";
import {
  ThunderboltFilled,
  FolderOpenOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import { useProjects } from "../hooks/useProjects";
import { useStreetPhotos } from "../hooks/useStreetPhotos";

export default function AiRecommendationsPage() {
  const navigate = useNavigate();
  const { projects, fetchProjects, loading: loadingProjects } = useProjects();
  const { data, fetchStreetPhotos, loading: loadingPhotos } = useStreetPhotos();

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects(1, 100);
  }, [fetchProjects]);

  // Fetch photos when project changes
  useEffect(() => {
    if (selectedProjectId) {
      fetchStreetPhotos(selectedProjectId, 1, 100);
    }
  }, [selectedProjectId, fetchStreetPhotos]);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const photosList = data?.data || [];

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 pb-16 font-sans space-y-6">
      {/* Top Header & Search Bar (Matching Image 1) */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-5 sm:p-6">
        <div className="mb-5">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">
            Rekomendasi AI
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm m-0">
            Jelajahi konsep perbaikan visual untuk foto yang telah selesai
            dianalisis.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t border-gray-100">
          {/* Project Selector */}
          <div className="w-full sm:w-60">
            <Select
              placeholder="Pilih proyek..."
              value={selectedProjectId}
              onChange={(val) => setSelectedProjectId(val)}
              loading={loadingProjects}
              className="w-full h-10"
              showSearch
              allowClear
              optionFilterProp="label"
              options={projects.map((p) => ({
                value: p.id,
                label: p.name,
              }))}
            />
          </div>

          {/* Green Tag: Hanya foto yang selesai dianalisis */}
          <div className="inline-flex items-center text-xs text-emerald-600 bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-full font-medium shrink-0 self-start sm:self-auto">
            Hanya foto yang selesai dianalisis
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {!selectedProjectId ? (
        // Prompt user to select project first
        <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-cyan-50 text-[#00bcd4] flex items-center justify-center mx-auto mb-4 text-2xl border border-cyan-100">
            <FolderOpenOutlined />
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">
            Pilih Proyek untuk Melihat Rekomendasi AI
          </h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto m-0 leading-relaxed">
            Silakan pilih proyek terlebih dahulu melalui dropdown di atas untuk
            menampilkan daftar foto jalan dan konsep rekomendasi perbaikan
            visual.
          </p>
        </div>
      ) : loadingPhotos ? (
        // Loading skeleton cards
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-xs border border-gray-100 p-4 space-y-3"
            >
              <Skeleton.Image active style={{ width: "100%", height: 180 }} />
              <Skeleton active paragraph={{ rows: 2 }} />
              <Skeleton.Button active block style={{ height: 40 }} />
            </div>
          ))}
        </div>
      ) : photosList.length === 0 ? (
        // Empty photos in project
        <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center mx-auto mb-4 text-2xl border border-gray-100">
            <PictureOutlined />
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">
            Tidak Ada Foto Ditemukan
          </h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto m-0">
            Belum ada foto jalan yang diunggah untuk proyek ini.
          </p>
        </div>
      ) : (
        // Photo Cards Grid (Matching Image 1)
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photosList.map((photo) => {
            const rawImageUrl = photo.file_path.startsWith("http")
              ? photo.file_path
              : `${API_BASE_URL.replace(/\/$/, "")}/${photo.file_path.replace(
                  /^\//,
                  "",
                )}`;
            const uviScore =
              photo.uvi_score ?? (photo as any).raw_score ?? null;
            const displayUvi =
              uviScore != null ? Number(uviScore).toFixed(2) : null;

            return (
              <div
                key={photo.id}
                className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Photo Thumbnail */}
                  <div className="relative h-48 bg-gray-900 overflow-hidden flex items-center justify-center">
                    {rawImageUrl ? (
                      <Image
                        src={rawImageUrl}
                        alt={photo.original_filename}
                        rootClassName="w-full h-full"
                        className="w-full h-full object-cover"
                        style={{
                          width: "100%",
                          height: "192px",
                          objectFit: "cover",
                        }}
                        preview={false}
                      />
                    ) : (
                      <div className="text-gray-400 text-xs">
                        Foto tidak tersedia
                      </div>
                    )}
                  </div>

                  {/* Card Info */}
                  <div className="p-4 space-y-2">
                    {/* Badges: Selesai and UVI */}
                    <div className="flex justify-between items-center">
                      <span className="bg-emerald-50 text-emerald-600 text-[11px] px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200">
                        Selesai
                      </span>
                      {displayUvi && (
                        <span className="bg-blue-50 text-blue-600 text-[11px] px-2.5 py-0.5 rounded-full font-semibold border border-blue-200">
                          UVI {displayUvi}
                        </span>
                      )}
                    </div>

                    {/* Filename & Project */}
                    <div>
                      <h3
                        className="font-bold text-gray-800 text-sm truncate m-0"
                        title={photo.original_filename}
                      >
                        {photo.original_filename}
                      </h3>
                      <p className="text-xs text-gray-400 m-0 truncate mt-0.5">
                        {photo.street_name ||
                          selectedProject?.name ||
                          "Lokasi Jalan"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Button: Lihat Rekomendasi AI */}
                <div className="p-4 pt-0">
                  <Button
                    type="primary"
                    icon={<ThunderboltFilled className="text-amber-300" />}
                    onClick={() =>
                      navigate(`/ai-recommendations/${photo.id}`, {
                        state: {
                          originalPhotoUrl: rawImageUrl,
                          originalFilename: photo.original_filename,
                          projectName: selectedProject?.name,
                          locationName: photo.street_name,
                        },
                      })
                    }
                    className="w-full bg-[#00bcd4] hover:bg-[#00acc1] border-none rounded-xl font-semibold h-10 shadow-xs flex items-center justify-center gap-1.5"
                  >
                    Lihat Rekomendasi AI
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
