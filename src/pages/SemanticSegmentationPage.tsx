import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Select,
  Button,
  Skeleton,
  Result,
  Image,
  Progress,
  message,
} from "antd";
import {
  CheckCircleFilled,
  PictureOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  streetPhotosService,
  type StreetPhoto,
} from "../api/street-photos.service";
import {
  segmentationResultsService,
  type SegmentationResult,
} from "../api/segmentation-results.service";
import { resolveMediaUrl } from "../components/SegmentationResultView";

export default function SemanticSegmentationPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlPhotoId = searchParams.get("photoId");

  // Photos list state
  const [photos, setPhotos] = useState<StreetPhoto[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState<boolean>(false);

  // Selected photo & analysis result state
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(
    urlPhotoId || null,
  );
  const [selectedPhoto, setSelectedPhoto] = useState<StreetPhoto | null>(null);

  const [resultData, setResultData] = useState<SegmentationResult | null>(null);
  const [loadingResult, setLoadingResult] = useState<boolean>(false);
  const [resultError, setResultError] = useState<string | null>(null);

  // Image tab mode: "asli" | "segmentasi" | "keduanya"
  const [activeTab, setActiveTab] = useState<
    "asli" | "segmentasi" | "keduanya"
  >("asli");

  // 1. Fetch photo list without projectId on mount
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

      if (urlPhotoId) {
        const found = list.find((p) => p.id === urlPhotoId);
        if (found) {
          setSelectedPhoto(found);
        }
      }
    } catch (err: any) {
      console.error("Failed to fetch street photos:", err);
      message.error(
        err.response?.data?.detail || "Gagal memuat daftar foto jalan",
      );
    } finally {
      setLoadingPhotos(false);
    }
  }, [urlPhotoId]);

  useEffect(() => {
    fetchPhotosList();
  }, [fetchPhotosList]);

  // 2. Fetch segmentation result by photoId
  const loadAnalysis = useCallback(async (photoId: string) => {
    setLoadingResult(true);
    setResultError(null);
    try {
      const result = await segmentationResultsService.getByPhotoId(photoId);
      setResultData(result);
    } catch (err: any) {
      console.error("Failed to fetch segmentation result:", err);
      const errMsg =
        err.response?.data?.detail ||
        "Gagal memuat hasil segmentasi untuk foto ini.";
      setResultError(errMsg);
      setResultData(null);
    } finally {
      setLoadingResult(false);
    }
  }, []);

  // When selectedPhotoId changes, load analysis and sync search params
  useEffect(() => {
    if (selectedPhotoId) {
      loadAnalysis(selectedPhotoId);
      setSearchParams({ photoId: selectedPhotoId }, { replace: true });
    } else {
      setResultData(null);
      setResultError(null);
    }
  }, [selectedPhotoId, loadAnalysis, setSearchParams]);

  const handlePhotoSelect = (photoId: string) => {
    setSelectedPhotoId(photoId);
    const photo = photos.find((p) => p.id === photoId) || null;
    setSelectedPhoto(photo);
  };

  // Normalization of metrics exactly as in SegmentationResultView
  const rawData: any = resultData;
  const seg = rawData?.segmentation || {};
  const prediction = rawData?.prediction || null;
  const llmGen = prediction?.llm_generate_response || null;
  const project = rawData?.project || null;

  const vegetationPct: number | null =
    rawData?.vegetation_pct ??
    seg.vegetation_pct ??
    rawData?.green_coverage_pct ??
    seg.green_coverage_pct ??
    null;

  const buildingPct: number | null =
    rawData?.building_pct ??
    seg.building_pct ??
    rawData?.building_coverage_pct ??
    seg.building_coverage_pct ??
    null;

  const roadPct: number | null = rawData?.road_pct ?? seg.road_pct ?? null;
  const sidewalkPct: number | null =
    rawData?.sidewalk_pct ?? seg.sidewalk_pct ?? null;
  const skyPct: number | null =
    rawData?.sky_pct ??
    seg.sky_pct ??
    rawData?.sky_visibility_pct ??
    seg.sky_visibility_pct ??
    null;
  const vehiclePct: number | null =
    rawData?.vehicle_pct ?? seg.vehicle_pct ?? null;
  const pedestrianPct: number | null =
    rawData?.pedestrian_pct ?? seg.pedestrian_pct ?? null;
  const signagePct: number | null =
    rawData?.signage_pct ?? seg.signage_pct ?? null;
  const visualClutterIndex: number | null =
    rawData?.visual_clutter_index ?? seg.visual_clutter_index ?? null;

  // Media URLs:
  const rawImageUrl = resolveMediaUrl(
    llmGen?.raw_image_url ||
      selectedPhoto?.file_path ||
      rawData?.privacy_masked_url ||
      rawData?.file_path,
  );

  const overlayUrl = resolveMediaUrl(
    rawData?.segmentation_overlay_url ||
      seg.segmentation_overlay_url ||
      rawData?.segmentation_url ||
      seg.segmentation_url,
  );

  // Metadata information
  const fileName =
    selectedPhoto?.original_filename || rawData?.original_filename || "Foto";
  const projectName = project?.name || rawData?.project_name || "Proyek";
  const locationName =
    rawData?.street_name ||
    project?.location ||
    selectedPhoto?.street_name ||
    "Lokasi Jalan";

  // Visual Composition Progress Bars (Bangunan, Vegetasi, Langit, Permukaan/Trotoar, Jalan, Manusia, Kendaraan)
  const visualCompositionItems = [
    {
      label: "Bangunan",
      // color: "#f97316",
      color: "#8b5cf6",
      val: buildingPct,
    },
    {
      label: "Vegetasi",
      color: "#22c55e",
      val: vegetationPct,
    },
    {
      label: "Langit",
      color: "#00b4d8",
      val: skyPct,
    },
    {
      label: "Permukaan / Trotoar",
      // color: "#8b5cf6",
      color: "#eab308",
      val: sidewalkPct ?? (roadPct != null ? roadPct : null),
    },
    ...(roadPct != null && sidewalkPct != null
      ? [
          {
            label: "Jalan",
            color: "#6366f1",
            val: roadPct,
          },
        ]
      : []),
    {
      label: "Manusia",
      color: "#ec4899",
      val: pedestrianPct ?? 0.3,
    },
    {
      label: "Kendaraan",
      color: "#ef4444",
      val: vehiclePct ?? 0.2,
    },
  ];

  // Dynamic legends for the segmented preview (identical to SegmentationResultView)
  const candidateLegends = [
    { label: "Vegetasi", color: "#22c55e", val: vegetationPct },
    { label: "Sky", color: "#00b4d8", val: skyPct },
    { label: "Vehicles", color: "#ef4444", val: vehiclePct },
    { label: "Building", color: "#8b5cf6", val: buildingPct },
    { label: "Sidewalk", color: "#eab308", val: sidewalkPct },
    { label: "Road", color: "#334155", val: roadPct },
  ];
  const legendItems = candidateLegends.filter((item) => item.val != null);

  // Positive & Negative factors (from SegmentationResultView & matching Image 2)
  const positiveFactors = [
    {
      label: "Cakupan Vegetasi",
      icon: "🌿",
      val: vegetationPct,
      pct: vegetationPct != null ? Math.min(100, Math.round(vegetationPct)) : 0,
    },
    {
      label: "Kepadatan Bangunan",
      icon: "🏢",
      val: buildingPct,
      pct: buildingPct != null ? Math.min(100, Math.round(buildingPct)) : 0,
    },
    {
      label: "Lebar Trotoar",
      icon: "🚶",
      val: sidewalkPct,
      pct: sidewalkPct != null ? Math.min(100, Math.round(sidewalkPct)) : 0,
    },
    {
      label: "Keterbukaan Langit",
      icon: "☀️",
      val: skyPct,
      pct: skyPct != null ? Math.min(100, Math.round(skyPct)) : 0,
    },
  ];

  const negativeFactors = [
    {
      label: "Kepadatan Reklame",
      icon: "🪧",
      val: signagePct ?? visualClutterIndex,
      pct:
        signagePct != null
          ? Math.min(100, Math.round(signagePct))
          : visualClutterIndex != null
            ? Math.min(
                100,
                Math.round(
                  visualClutterIndex <= 1
                    ? visualClutterIndex * 100
                    : visualClutterIndex,
                ),
              )
            : 0,
    },
    {
      label: "Kepadatan Kendaraan",
      icon: "🚗",
      val: vehiclePct,
      pct: vehiclePct != null ? Math.min(100, Math.round(vehiclePct)) : 0,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 pb-16 font-sans space-y-6">
      {/* Top Header & Dropdown Filter Bar */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">
              Segmentasi Semantik
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm m-0">
              Periksa kelas visual dan proporsinya dalam pemandangan jalan.
            </p>
          </div>
        </div>

        {/* Dropdown Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-4 border-t border-gray-100">
          <label className="text-xs sm:text-sm font-semibold text-gray-600 shrink-0">
            Berkas sumber
          </label>
          <div className="w-full sm:w-80">
            <Select
              placeholder="Pilih berkas foto..."
              value={selectedPhotoId}
              onChange={handlePhotoSelect}
              loading={loadingPhotos}
              className="w-full"
              showSearch
              allowClear
              optionFilterProp="label"
              options={photos.map((photo) => ({
                value: photo.id,
                label: photo.original_filename,
              }))}
            />
          </div>
          {selectedPhoto?.street_name && (
            <span className="text-xs text-gray-400 truncate hidden md:inline-block">
              Lokasi: {selectedPhoto.street_name}
            </span>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {!selectedPhotoId ? (
        // Prompt user to select a photo first
        <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-cyan-50 text-[#00bcd4] flex items-center justify-center mx-auto mb-4 text-2xl border border-cyan-100">
            <PictureOutlined />
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">
            Pilih Foto untuk Memulai
          </h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto m-0 leading-relaxed">
            Silakan pilih foto dari menu dropdown <strong>Berkas sumber</strong>{" "}
            di atas untuk melihat gambar asli, hasil segmentasi AI, komposisi
            visual, dan faktor pengaruh UVI.
          </p>
        </div>
      ) : loadingResult ? (
        // Loading state
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 space-y-4">
              <Skeleton.Input active block style={{ height: 28 }} />
              <Skeleton.Image active style={{ width: "100%", height: 320 }} />
              <Skeleton active paragraph={{ rows: 3 }} />
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 space-y-4">
              <Skeleton.Input active block style={{ height: 28 }} />
              <Skeleton active paragraph={{ rows: 6 }} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 space-y-4">
            <Skeleton.Input active style={{ width: 150, height: 28 }} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Skeleton.Button active block style={{ height: 140 }} />
              <Skeleton.Button active block style={{ height: 140 }} />
            </div>
          </div>
        </div>
      ) : resultError ? (
        // Error state
        <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-8">
          <Result
            status="warning"
            title="Hasil Segmentasi Belum Tersedia"
            subTitle={resultError}
            extra={[
              <Button
                type="primary"
                key="retry"
                icon={<ReloadOutlined />}
                onClick={() => selectedPhotoId && loadAnalysis(selectedPhotoId)}
                className="bg-[#00bcd4] hover:bg-[#00acc1] border-none"
              >
                Coba Lagi
              </Button>,
            ]}
          />
        </div>
      ) : resultData ? (
        // Results Layout
        <div className="space-y-6">
          {/* Top Row: 2 Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* LEFT COLUMN: Foto Asli & Hasil Segmentasi AI */}
            <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-5 space-y-4">
              {/* Card Header: Filename & Status Badge */}
              <div className="flex justify-between items-center">
                <h3
                  className="text-base font-bold text-gray-800 m-0 truncate max-w-xs sm:max-w-md"
                  title={fileName}
                >
                  {fileName}
                </h3>
                <span className="bg-emerald-50 text-emerald-600 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200">
                  Selesai
                </span>
              </div>

              {/* Tab Selector: [ Asli ] [ Segmentasi ] [ Keduanya ] */}
              <div className="bg-gray-100 p-1 rounded-xl inline-flex gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("asli")}
                  className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer border-none ${
                    activeTab === "asli"
                      ? "bg-white text-gray-800 shadow-xs"
                      : "text-gray-500 hover:text-gray-700 bg-transparent"
                  }`}
                >
                  Asli
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("segmentasi")}
                  className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer border-none ${
                    activeTab === "segmentasi"
                      ? "bg-white text-gray-800 shadow-xs"
                      : "text-gray-500 hover:text-gray-700 bg-transparent"
                  }`}
                >
                  Segmentasi
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("keduanya")}
                  className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer border-none ${
                    activeTab === "keduanya"
                      ? "bg-white text-gray-800 shadow-xs"
                      : "text-gray-500 hover:text-gray-700 bg-transparent"
                  }`}
                >
                  Keduanya
                </button>
              </div>

              {/* Photo View Container */}
              {activeTab === "asli" && (
                <div className="relative rounded-xl overflow-hidden bg-gray-900 border border-gray-100 shadow-inner flex items-center justify-center min-h-72 sm:min-h-80">
                  {rawImageUrl ? (
                    <Image
                      src={rawImageUrl}
                      alt="Foto Asli"
                      rootClassName="w-full h-72 sm:h-80"
                      className="w-full h-72 sm:h-80 object-cover"
                      style={{
                        width: "100%",
                        height: "320px",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div className="h-72 flex items-center justify-center text-gray-400 text-sm">
                      Foto asli tidak tersedia
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded-md font-medium pointer-events-none">
                    Foto Asli
                  </div>
                </div>
              )}

              {activeTab === "segmentasi" && (
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden bg-gray-900 border border-gray-100 shadow-inner flex items-center justify-center min-h-72 sm:min-h-80">
                    {overlayUrl ? (
                      <Image
                        src={overlayUrl}
                        alt="Segmentasi AI"
                        rootClassName="w-full h-72 sm:h-80"
                        className="w-full h-72 sm:h-80 object-cover"
                        style={{
                          width: "100%",
                          height: "320px",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div className="h-72 flex items-center justify-center text-gray-400 text-sm">
                        Overlay segmentasi tidak tersedia
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-[#00bcd4]/80 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded-md font-medium pointer-events-none">
                      Segmentasi AI
                    </div>
                  </div>

                  {/* Color Legend (Identical to SegmentationResultView) */}
                  {legendItems.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2 border-t border-gray-100">
                      {legendItems.map((item) => (
                        <div
                          key={item.label}
                          className="flex flex-col items-center p-2 rounded-xl bg-gray-50/70 border border-gray-100"
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-xs font-medium text-gray-600 truncate">
                              {item.label}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-gray-900">
                            {item.val != null ? `${item.val.toFixed(1)}%` : "-"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "keduanya" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Foto Asli */}
                    <div className="relative rounded-xl overflow-hidden bg-gray-900 border border-gray-100 shadow-inner h-60 flex items-center justify-center">
                      {rawImageUrl ? (
                        <Image
                          src={rawImageUrl}
                          alt="Foto Asli"
                          rootClassName="w-full h-full"
                          className="w-full h-full object-cover"
                          style={{
                            width: "100%",
                            height: "240px",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <span className="text-gray-400 text-xs">Tidak ada</span>
                      )}
                      <div className="absolute top-2 left-2 bg-black/60 text-white text-[11px] px-2 py-0.5 rounded font-medium pointer-events-none">
                        Foto Asli
                      </div>
                    </div>

                    {/* Segmentasi AI */}
                    <div className="relative rounded-xl overflow-hidden bg-gray-900 border border-gray-100 shadow-inner h-60 flex items-center justify-center">
                      {overlayUrl ? (
                        <Image
                          src={overlayUrl}
                          alt="Segmentasi AI"
                          rootClassName="w-full h-full"
                          className="w-full h-full object-cover"
                          style={{
                            width: "100%",
                            height: "240px",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <span className="text-gray-400 text-xs">Tidak ada</span>
                      )}
                      <div className="absolute top-2 left-2 bg-[#00bcd4]/80 text-white text-[11px] px-2 py-0.5 rounded font-medium pointer-events-none">
                        Segmentasi AI
                      </div>
                    </div>
                  </div>

                  {/* Color Legend */}
                  {legendItems.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2 border-t border-gray-100">
                      {legendItems.map((item) => (
                        <div
                          key={item.label}
                          className="flex flex-col items-center p-2 rounded-xl bg-gray-50/70 border border-gray-100"
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-xs font-medium text-gray-600 truncate">
                              {item.label}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-gray-900">
                            {item.val != null ? `${item.val.toFixed(1)}%` : "-"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Semantic Segmentation Model Information Box (Matching Image 1) */}
              <div className="bg-gray-50/70 border border-gray-100 rounded-2xl p-4 mt-4 space-y-3">
                {(projectName || locationName) && (
                  <div className="pt-2 border-t border-gray-100 text-[11px] text-gray-500">
                    {projectName && <span>Proyek: {projectName}</span>}
                    {projectName && locationName && <span> · </span>}
                    {locationName && <span>Lokasi: {locationName}</span>}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Komposisi Visual (Matching Image 1) */}
            <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6 space-y-4">
              <h3 className="text-base font-bold text-gray-800 m-0">
                Komposisi Visual
              </h3>

              {/* Reference Score Box (mIoU) */}
              {/* <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3.5 flex justify-between items-center">
                <div>
                  <span className="text-xs text-blue-500 font-medium block">
                    Segmentasi Semantik
                  </span>
                  <span className="text-xl sm:text-2xl font-bold text-blue-600 block">
                    mIoU: {r2Score}
                  </span>
                </div>
                <span className="text-xs text-blue-400 font-medium self-start">
                  Skor referensi
                </span>
              </div> */}

              {/* Visual Classes Horizontal Progress Bars */}
              <div className="space-y-4 pt-1">
                {visualCompositionItems.map((item) => {
                  const displayPct =
                    item.val != null ? Number(item.val).toFixed(1) : "0";
                  const pctNum =
                    item.val != null ? Math.min(100, Math.max(0, item.val)) : 0;

                  return (
                    <div key={item.label} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-semibold text-gray-700">
                        <span>{item.label}</span>
                        <span className="font-bold text-gray-800">
                          {displayPct}%
                        </span>
                      </div>
                      <Progress
                        percent={pctNum}
                        showInfo={false}
                        strokeColor={item.color}
                        className="m-0"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* BOTTOM SECTION: Faktor Pengaruh UVI (Matching Image 2 & SegmentationResultView) */}
          <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6 space-y-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-800 m-0">
                Faktor Pengaruh UVI
              </h3>
              <p className="text-xs text-gray-400 m-0 mt-0.5">
                Faktor positif dan negatif yang dipertimbangkan dalam
                interpretasi Indeks Visual Perkotaan untuk {fileName}.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Faktor Positif */}
              <div className="rounded-2xl border border-cyan-100 overflow-hidden bg-cyan-50/20">
                <div className="bg-[#00bcd4] text-white px-4 py-2.5 font-bold text-xs sm:text-sm flex items-center gap-2">
                  <CheckCircleFilled className="text-white" />
                  <span>Faktor Positif</span>
                </div>
                <div className="p-4 space-y-3.5">
                  {positiveFactors.map((factor) => (
                    <div key={factor.label}>
                      <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                        <span className="flex items-center gap-1.5">
                          <span>{factor.icon}</span> {factor.label}
                        </span>
                        <span
                          className={`font-bold ${
                            factor.val != null
                              ? "text-[#00bcd4]"
                              : "text-red-500 font-normal"
                          }`}
                        >
                          {factor.val != null
                            ? `${factor.val.toFixed(1)}%`
                            : "Belum tersedia"}
                        </span>
                      </div>
                      <Progress
                        percent={factor.pct}
                        showInfo={false}
                        strokeColor="#00bcd4"
                        className="m-0"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Faktor Negatif */}
              <div className="rounded-2xl border border-red-100 overflow-hidden bg-rose-50/20">
                <div className="bg-[#ef4444] text-white px-4 py-2.5 font-bold text-xs sm:text-sm flex items-center gap-2">
                  <span className="text-white font-bold">✕</span>
                  <span>Faktor Negatif</span>
                </div>
                <div className="p-4 space-y-3.5">
                  {negativeFactors.map((factor) => (
                    <div key={factor.label}>
                      <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                        <span className="flex items-center gap-1.5">
                          <span>{factor.icon}</span> {factor.label}
                        </span>
                        <span
                          className={`font-bold ${
                            factor.val != null
                              ? "text-red-500"
                              : "text-red-500 font-normal"
                          }`}
                        >
                          {factor.val != null
                            ? `${factor.val.toFixed(1)}%`
                            : "Belum tersedia"}
                        </span>
                      </div>
                      <Progress
                        percent={factor.pct}
                        showInfo={false}
                        strokeColor="#ef4444"
                        className="m-0"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
