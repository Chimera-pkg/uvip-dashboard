import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Select, Skeleton, message, Table } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";
import {
  streetPhotosService,
  type StreetPhoto,
} from "../api/street-photos.service";
import {
  segmentationResultsService,
  type SegmentationResult,
} from "../api/segmentation-results.service";

export default function UviAnalysisPage() {
  const navigate = useNavigate();

  // Photos list state
  const [photos, setPhotos] = useState<StreetPhoto[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState<boolean>(false);

  // Selected photo & segmentation result state
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [resultData, setResultData] = useState<SegmentationResult | null>(null);
  const [loadingResult, setLoadingResult] = useState<boolean>(false);

  // 1. Fetch photo list on mount
  const fetchPhotosList = useCallback(async () => {
    setLoadingPhotos(true);
    try {
      const response = await streetPhotosService.getStreetPhotos(
        undefined,
        1,
        100,
      );
      const list = response?.data || [];
      setPhotos(list);

      // Default select the first photo if none is selected
      if (list.length > 0 && !selectedPhotoId) {
        setSelectedPhotoId(list[0].id);
      }
    } catch (err: any) {
      console.error("Failed to fetch street photos:", err);
      message.error(
        err.response?.data?.detail || "Gagal memuat daftar foto jalan",
      );
    } finally {
      setLoadingPhotos(false);
    }
  }, [selectedPhotoId]);

  useEffect(() => {
    fetchPhotosList();
  }, [fetchPhotosList]);

  // 2. Fetch segmentation result when selectedPhotoId changes
  useEffect(() => {
    if (!selectedPhotoId) {
      setResultData(null);
      return;
    }

    let isMounted = true;
    const fetchSegmentation = async () => {
      setLoadingResult(true);
      try {
        const result =
          await segmentationResultsService.getByPhotoId(selectedPhotoId);
        if (isMounted) setResultData(result);
      } catch (err: any) {
        console.error("Failed to fetch segmentation result:", err);
        if (isMounted) {
          setResultData(null);
        }
      } finally {
        if (isMounted) setLoadingResult(false);
      }
    };

    fetchSegmentation();
    return () => {
      isMounted = false;
    };
  }, [selectedPhotoId]);

  // Selected photo object from photos list
  const currentPhoto = photos.find((p) => p.id === selectedPhotoId) || null;

  // Extract UVI Score
  const rawUvi =
    resultData?.prediction?.uvi_score ??
    resultData?.prediction?.llm_generate_response?.target?.perception_prediction
      ?.uvi_score ??
    currentPhoto?.prediction?.uvi_score ??
    currentPhoto?.uvi_score ??
    null;

  const uviNumber =
    rawUvi !== null && rawUvi !== undefined && !isNaN(Number(rawUvi))
      ? Number(rawUvi) > 1
        ? Number(rawUvi) / 10
        : Number(rawUvi)
      : null;

  const displayUvi = uviNumber !== null ? uviNumber.toFixed(2) : "0.00";

  // Extract Beauty, Safety, Comfort scores
  const beautyScore =
    resultData?.prediction?.beauty_score ??
    currentPhoto?.prediction?.beauty_score ??
    null;
  const safetyScore =
    resultData?.prediction?.safety_score ??
    currentPhoto?.prediction?.safety_score ??
    null;
  const comfortScore =
    resultData?.prediction?.comfort_score ??
    currentPhoto?.prediction?.comfort_score ??
    null;

  // Table columns for "Lokasi yang Dianalisis"
  const tableColumns = [
    {
      title: "BERKAS SUMBER",
      dataIndex: "original_filename",
      key: "original_filename",
      render: (text: string) => (
        <span className="font-medium text-slate-700 text-xs sm:text-sm">
          {text}
        </span>
      ),
    },
    {
      title: "PROYEK",
      dataIndex: "project",
      key: "project",
      render: (proj: any) => (
        <span className="text-slate-600 text-xs sm:text-sm">
          {proj?.name || "Tanpa Proyek"}
        </span>
      ),
    },
    {
      title: "UVI",
      key: "uvi",
      render: (_: any, record: StreetPhoto) => {
        const uvi = record.prediction?.uvi_score ?? record.uvi_score;
        const formatted =
          uvi !== null && uvi !== undefined && !isNaN(Number(uvi))
            ? (Number(uvi) > 1 ? Number(uvi) / 10 : Number(uvi)).toFixed(2)
            : "-";

        return (
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
            {formatted}
          </span>
        );
      },
    },
    {
      title: "STATUS",
      dataIndex: "processing_status",
      key: "processing_status",
      render: (status: string) => {
        const isCompleted = status === "completed";
        return (
          <span
            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              isCompleted
                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                : "bg-slate-50 text-slate-600 border border-slate-200"
            }`}
          >
            {isCompleted ? "Selesai" : status || "Diproses"}
          </span>
        );
      },
    },
    {
      title: "",
      key: "action",
      render: (_: any, record: StreetPhoto) => (
        <button
          type="button"
          onClick={() => {
            navigate(`/street-photos/segmentation-result/${record.id}`);
          }}
          className="text-blue-600 hover:text-blue-700 font-semibold text-xs cursor-pointer bg-transparent border-none p-0 transition-colors"
        >
          Lihat Hasil Analisis
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-1">
            Analisis UVI
          </h1>
          <p className="text-slate-500 text-sm m-0">
            Tinjau kualitas visual perkotaan di berbagai lokasi yang telah
            dianalisis.
          </p>
        </div>
      </div>

      {/* Filter Bar: Berkas sumber */}
      <div className="flex items-center gap-3">
        <label className="text-xs sm:text-sm font-semibold text-slate-600 shrink-0">
          Berkas sumber
        </label>
        <Select
          placeholder="Pilih berkas sumber..."
          value={selectedPhotoId}
          onChange={(val) => setSelectedPhotoId(val)}
          loading={loadingPhotos}
          showSearch
          optionFilterProp="label"
          className="w-64 sm:w-72"
          options={photos.map((p) => ({
            value: p.id,
            label: p.original_filename,
          }))}
        />
      </div>

      {/* Card 1: Indeks Visual Perkotaan (Full Width, UVI per lokasi removed) */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-xs">
        {loadingResult ? (
          <div className="space-y-6">
            <Skeleton.Input active size="small" style={{ width: "20%" }} />
            <Skeleton.Input
              active
              size="large"
              style={{ width: "30%", height: 50 }}
            />
            <Skeleton.Input active block style={{ height: 120 }} />
            <Skeleton.Input active block style={{ height: 60 }} />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Title */}
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800 m-0">
                Indeks Visual Perkotaan
              </h2>
            </div>

            {/* Big UVI Score Display */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl sm:text-6xl font-black text-[#16a34a] tracking-tight">
                  {displayUvi}
                </span>
                <span className="text-xl sm:text-2xl font-bold text-slate-400">
                  / 1
                </span>
              </div>
            </div>

            {/* Sub-card: Persepsi Kualitas Lingkungan (Beauty, Safety, Comfort from SegmentationResultView) */}
            <div className="bg-slate-50/70 rounded-2xl p-5 sm:p-6 border border-gray-100">
              <h3 className="text-sm sm:text-base font-bold text-slate-800 mb-4">
                Persepsi Kualitas Lingkungan
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
                {/* Skor Keindahan */}
                <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-100 shadow-xs flex flex-col justify-between">
                  <div className="text-xs text-slate-500 font-medium mb-2">
                    Skor Keindahan
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                      {beautyScore !== null
                        ? Number(beautyScore).toFixed(1)
                        : "-"}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      / 10
                    </span>
                  </div>
                </div>

                {/* Skor Keamanan */}
                <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-100 shadow-xs flex flex-col justify-between">
                  <div className="text-xs text-slate-500 font-medium mb-2">
                    Skor Keamanan
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                      {safetyScore !== null
                        ? Number(safetyScore).toFixed(1)
                        : "-"}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      / 10
                    </span>
                  </div>
                </div>

                {/* Skor Kenyamanan */}
                <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-100 shadow-xs flex flex-col justify-between">
                  <div className="text-xs text-slate-500 font-medium mb-2">
                    Skor Kenyamanan
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                      {comfortScore !== null
                        ? Number(comfortScore).toFixed(1)
                        : "-"}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      / 10
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Gradient Slider Bar */}
            <div className="space-y-2 pt-2">
              <div className="relative h-2.5 w-full rounded-full bg-slate-100">
                <div
                  className="h-full w-full rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, #ef4444 0%, #f97316 25%, #eab308 50%, #84cc16 75%, #16a34a 100%)",
                  }}
                />
                {/* Needle Indicator */}
                {uviNumber !== null && (
                  <div
                    className="absolute -top-0.75 -bottom-0.75 w-1 bg-slate-900 shadow-sm rounded-full -translate-x-1/2 transition-all duration-300"
                    style={{
                      left: `${Math.min(100, Math.max(0, uviNumber * 100))}%`,
                    }}
                  />
                )}
              </div>

              <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                <span>0 · UVI lebih rendah</span>
                <span>1 · UVI lebih tinggi</span>
              </div>
            </div>

            {/* Photo filename & project label */}
            {currentPhoto && (
              <div className="text-xs text-slate-500 font-medium pt-1">
                {currentPhoto.original_filename} ·{" "}
                {currentPhoto.project?.name ||
                  currentPhoto.street_name ||
                  "Lokasi"}
              </div>
            )}

            {/* Box: Segmentasi Semantik - Informasi model */}
            {/* <div className="bg-slate-50/70 rounded-2xl p-5 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-white shadow-xs border border-gray-100 flex items-center justify-center text-purple-600">
                  <ApartmentOutlined />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800 m-0 leading-tight">
                    Segmentasi Semantik
                  </h4>
                  <p className="text-[11px] text-slate-400 m-0">
                    Informasi model
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <div className="text-slate-400 text-[11px] mb-0.5">Model</div>
                  <div className="font-bold text-slate-800">{modelName}</div>
                  <div className="text-[10px] text-slate-400">
                    encoder MiT-B5 + decoder all-MLP
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 text-[11px] mb-0.5">
                    Publikasi
                  </div>
                  <div className="font-bold text-slate-800">NeurIPS 2021</div>
                </div>

                <div>
                  <div className="text-slate-400 text-[11px] mb-0.5">mIoU</div>
                  <div className="font-bold text-blue-600">84.0%</div>
                  <div className="text-[10px] text-slate-400">
                    Skor referensi
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 text-[11px] mb-0.5">
                    Inferensi
                  </div>
                  <div className="font-bold text-slate-800">
                    {inferenceSeconds} detik
                  </div>
                </div>
              </div>
            </div> */}
          </div>
        )}
      </div>

      {/* Card 2: Lokasi yang Dianalisis (Table) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="p-5 sm:px-6 flex items-center justify-between border-b border-gray-100">
          <h3 className="text-base sm:text-lg font-bold text-slate-800 m-0">
            Lokasi yang Dianalisis
          </h3>
          <button
            type="button"
            onClick={() => navigate("/uvi-heatmap")}
            className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-transparent border-none cursor-pointer transition-colors"
          >
            <span>Lihat Peta</span>
            <EnvironmentOutlined />
          </button>
        </div>

        <div className="overflow-x-auto">
          <Table
            columns={tableColumns}
            dataSource={photos}
            rowKey="id"
            loading={loadingPhotos}
            pagination={{
              pageSize: 6,
              showSizeChanger: false,
              className: "px-5 py-3",
            }}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
