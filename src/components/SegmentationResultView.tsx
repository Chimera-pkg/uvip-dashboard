import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button, Skeleton, Result, Image, Progress, Drawer } from "antd";
import {
  LeftOutlined,
  ShareAltOutlined,
  FolderOpenOutlined,
  FileImageOutlined,
  VideoCameraOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  CompassOutlined,
  StarFilled,
  HeartFilled,
  SafetyCertificateFilled,
  SmileFilled,
  ThunderboltFilled,
  EyeOutlined,
  CheckCircleFilled,
  SwapOutlined,
  DownloadOutlined,
  ApartmentOutlined,
  CarOutlined,
  InfoCircleOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useSegmentationResult } from "../hooks/useSegmentationResult";
import { useVideoSegmentationResult } from "../hooks/useVideoSegmentationResult";
import { streetVideosService } from "../api/street-videos.service";
import type {
  LLMAdviceContent,
  LLMAdviceRecommendation,
} from "../api/segmentation-results.service";

const CLOUDFLARE_BASE =
  "https://auctions-chemicals-latitude-typing.trycloudflare.com";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function resolveMediaUrl(
  pathOrUrl?: string | null,
  fallbackBase = CLOUDFLARE_BASE,
): string {
  if (!pathOrUrl) return "";
  const trimmed = pathOrUrl.trim();
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }
  const cleanBase = fallbackBase.replace(/\/$/, "");
  const cleanPath = trimmed.replace(/^\//, "");
  return `${cleanBase}/${cleanPath}`;
}

export interface SegmentationResultViewProps {
  photoId?: string;
  videoId?: string;
  type?: "photo" | "video";
  onBack?: () => void;
}

export const SegmentationResultView: React.FC<SegmentationResultViewProps> = ({
  photoId: propPhotoId,
  videoId: propVideoId,
  type: propType,
  onBack: propOnBack,
}) => {
  // All React Hooks MUST be called unconditionally at top level
  const params = useParams<{ photoId?: string; videoId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const stateData = (location.state as any) || {};

  const isVideo =
    propType === "video" ||
    Boolean(propVideoId) ||
    Boolean(params.videoId) ||
    window.location.pathname.includes("/street-videos/");

  const effectivePhotoId = propPhotoId || params.photoId;
  const effectiveVideoId = propVideoId || params.videoId;

  const {
    data: photoData,
    loading: photoLoading,
    error: photoError,
    fetchSegmentationResult,
  } = useSegmentationResult();

  const {
    data: videoData,
    loading: videoLoading,
    error: videoError,
    fetchVideoSegmentationResult,
  } = useVideoSegmentationResult();

  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  // Original video state (from route navigation state or fetched via streetVideosService)
  const [originalVideoUrl, setOriginalVideoUrl] = useState<string | null>(
    stateData.originalVideoUrl || null,
  );
  const [originalVideoFilename, setOriginalVideoFilename] = useState<
    string | null
  >(stateData.originalFilename || null);

  useEffect(() => {
    if (isVideo && effectiveVideoId) {
      fetchVideoSegmentationResult(effectiveVideoId);

      // If original video was not passed in location.state (e.g. direct URL or page reload),
      // fetch street video details to get the original video path
      if (!originalVideoUrl) {
        streetVideosService
          .getStreetVideoById(effectiveVideoId)
          .then((video) => {
            if (video.file_path) {
              const fullUrl = video.file_path.startsWith("http")
                ? video.file_path
                : `${API_BASE_URL.replace(/\/$/, "")}/${video.file_path.replace(
                    /^\//,
                    "",
                  )}`;
              setOriginalVideoUrl(fullUrl);
            }
            if (video.original_filename) {
              setOriginalVideoFilename(video.original_filename);
            }
          })
          .catch((err) => {
            console.error("Failed to load original street video details:", err);
          });
      }
    } else if (!isVideo && effectivePhotoId) {
      fetchSegmentationResult(effectivePhotoId);
    }
  }, [
    isVideo,
    effectivePhotoId,
    effectiveVideoId,
    fetchSegmentationResult,
    fetchVideoSegmentationResult,
    originalVideoUrl,
  ]);

  const handleBack = () => {
    if (propOnBack) {
      propOnBack();
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(isVideo ? "/street-videos" : "/street-photos");
    }
  };

  const handleGoHome = () => {
    navigate("/dashboard");
  };

  const loading = isVideo ? videoLoading : photoLoading;
  const error = isVideo ? videoError : photoError;
  const rawData: any = isVideo ? videoData : photoData;

  // Render loading state
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton.Button active shape="round" style={{ width: 100 }} />
          <Skeleton.Input active style={{ width: 220 }} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-xs space-y-4">
            <Skeleton.Image active style={{ width: "100%", height: 320 }} />
            <Skeleton active paragraph={{ rows: 3 }} />
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-xs space-y-4">
            <Skeleton active paragraph={{ rows: 6 }} />
            <Skeleton.Button active block style={{ height: 60 }} />
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <Result
          status="error"
          title="Gagal Memuat Hasil Segmentasi"
          subTitle={error}
          extra={[
            <Button
              type="primary"
              key="back"
              onClick={handleBack}
              className="bg-[#00bcd4] hover:bg-[#00acc1] border-none"
            >
              Kembali ke Daftar
            </Button>,
            <Button
              key="retry"
              onClick={() => {
                if (isVideo && effectiveVideoId) {
                  fetchVideoSegmentationResult(effectiveVideoId);
                } else if (!isVideo && effectivePhotoId) {
                  fetchSegmentationResult(effectivePhotoId);
                }
              }}
            >
              Coba Lagi
            </Button>,
          ]}
        />
      </div>
    );
  }

  if (!rawData) {
    return null;
  }

  // Normalized data extraction directly from API response
  const seg = rawData.segmentation || {};
  const prediction = rawData.prediction || null;
  const llmGen = prediction?.llm_generate_response || null;
  const project = rawData.project || null;

  // Extract adviceData from llm_advice_response (either direct advice object or parsed choices[0].message.content)
  const adviceData: LLMAdviceContent | null = (() => {
    if (
      rawData?.llm_advice_response?.advice &&
      typeof rawData.llm_advice_response.advice === "object"
    ) {
      return rawData.llm_advice_response.advice;
    }
    if (
      prediction?.llm_advice_response?.advice &&
      typeof prediction.llm_advice_response.advice === "object"
    ) {
      return prediction.llm_advice_response.advice;
    }
    if (rawData?.advice && typeof rawData.advice === "object") {
      return rawData.advice;
    }
    const contentStr =
      rawData?.llm_advice_response?.choices?.[0]?.message?.content ||
      prediction?.llm_advice_response?.choices?.[0]?.message?.content;
    if (contentStr && typeof contentStr === "string") {
      try {
        const parsed = JSON.parse(contentStr);
        if (parsed && typeof parsed === "object") {
          return parsed;
        }
      } catch {
        // Not a JSON string
      }
    }
    return null;
  })();

  const diagnosis: string | null = adviceData?.diagnosis || null;
  const recommendations: LLMAdviceRecommendation[] = Array.isArray(
    adviceData?.rekomendasi,
  )
    ? adviceData.rekomendasi
    : [];
  const visualSuggestions: string[] = Array.isArray(llmGen?.suggestions)
    ? llmGen.suggestions
    : [];
  const caveatText: string | null = adviceData?.caveat || null;

  // Exact metrics from response (null if absent)
  const vegetationPct: number | null =
    rawData.vegetation_pct ??
    seg.vegetation_pct ??
    rawData.green_coverage_pct ??
    seg.green_coverage_pct ??
    null;

  const buildingPct: number | null =
    rawData.building_pct ??
    seg.building_pct ??
    rawData.building_coverage_pct ??
    seg.building_coverage_pct ??
    null;

  const roadPct: number | null = rawData.road_pct ?? seg.road_pct ?? null;
  const sidewalkPct: number | null =
    rawData.sidewalk_pct ?? seg.sidewalk_pct ?? null;
  const skyPct: number | null =
    rawData.sky_pct ??
    seg.sky_pct ??
    rawData.sky_visibility_pct ??
    seg.sky_visibility_pct ??
    null;
  const vehiclePct: number | null =
    rawData.vehicle_pct ?? seg.vehicle_pct ?? null;
  const signagePct: number | null =
    rawData.signage_pct ?? seg.signage_pct ?? null;
  const visualClutterIndex: number | null =
    rawData.visual_clutter_index ?? seg.visual_clutter_index ?? null;
  const walkabilityRatio: number | null =
    rawData.walkability_ratio ?? seg.walkability_ratio ?? null;

  // Prediction scores (null if absent)
  const beautyScore: number | null = prediction?.beauty_score ?? null;
  const safetyScore: number | null = prediction?.safety_score ?? null;
  const comfortScore: number | null = prediction?.comfort_score ?? null;
  const uviScore: number | null =
    prediction?.uvi_score ?? rawData?.uvi_score ?? null;

  // Media URLs:
  // 1. Original Photo URL (only for photo)
  const rawImageUrl = resolveMediaUrl(
    llmGen?.raw_image_url ||
      stateData.originalPhotoUrl ||
      rawData.privacy_masked_url ||
      rawData.file_path,
  );

  // 2. Original Video URL (only for video, from street video page state or API)
  const resolvedOriginalVideo =
    originalVideoUrl ||
    stateData.originalVideoUrl ||
    (rawData.original_video_url
      ? resolveMediaUrl(rawData.original_video_url)
      : null);

  // 3. Segmented Video URL (from video segmentation endpoint)
  const segmentedVideoUrl = resolveMediaUrl(
    rawData.video_url ||
      rawData.segmentation_overlay_url ||
      seg.segmentation_overlay_url ||
      rawData.segmentation_url ||
      seg.segmentation_url,
  );

  // 4. Photo Segmentation Overlay URL
  const overlayUrl = resolveMediaUrl(
    rawData.segmentation_overlay_url ||
      seg.segmentation_overlay_url ||
      rawData.segmentation_url ||
      seg.segmentation_url,
  );

  // 5. Generated predictive image URL (from prediction->llm_generate_response->generated_image_url)
  const generatedImageUrl = llmGen?.generated_image_url
    ? resolveMediaUrl(llmGen.generated_image_url)
    : "";

  // Requirement 4: Text for Urban Visual Index & Rekomendasi AI taken from prediction->llm_generate_response->suggestions[0]
  const aiSuggestionText: string | null = llmGen?.suggestions?.[0] || null;

  // Rekomendasi AI is strictly for Photo, and only when advice or suggestions/generated_image exists
  const hasAdviceOrSuggestions = Boolean(
    !isVideo &&
    (Boolean(diagnosis) ||
      recommendations.length > 0 ||
      visualSuggestions.length > 0 ||
      Boolean(generatedImageUrl)),
  );

  // Project & file details
  const projectName: string | null =
    project?.name || rawData.project_name || null;
  const fileName: string | null =
    (isVideo ? originalVideoFilename : null) ||
    stateData.originalFilename ||
    llmGen?.photo_path?.split("/").pop() ||
    rawData.original_filename ||
    null;
  const hasProjectOrFileInfo = Boolean(projectName || fileName);

  // Location info (street_name, latitude, longitude from response)
  const locationName: string | null =
    rawData.street_name || project?.location || null;
  const formattedDate: string | null = rawData.created_at
    ? dayjs(rawData.created_at).format("D MMMM YYYY, HH:mm [WIB]")
    : null;
  const coordinatesText: string | null =
    rawData.latitude != null && rawData.longitude != null
      ? `Lat/Long: ${Number(rawData.latitude).toFixed(4)}, ${Number(rawData.longitude).toFixed(4)}`
      : null;
  const hasLocationInfo = Boolean(
    locationName || formattedDate || coordinatesText,
  );

  // Model name badge
  const modelName: string | null = rawData.model_name || seg.model_name || null;

  // UVI score badge evaluation
  const getUviBadge = (score: number) => {
    if (score >= 0.75 || score >= 7.5) {
      return {
        text: "Sangat Tinggi",
        color: "bg-[#00bcd4]/10 text-[#00acc1] border-[#00bcd4]/30",
      };
    }
    if (score >= 0.5 || score >= 5.0) {
      return {
        text: "Tinggi",
        color: "bg-emerald-50 text-emerald-600 border-emerald-200",
      };
    }
    if (score >= 0.3 || score >= 3.0) {
      return {
        text: "Sedang",
        color: "bg-amber-50 text-amber-600 border-amber-200",
      };
    }
    return {
      text: "Rendah",
      color: "bg-rose-50 text-rose-600 border-rose-200",
    };
  };

  const uviBadge = uviScore != null ? getUviBadge(uviScore) : null;

  const displayUviNumber =
    uviScore != null
      ? uviScore <= 1 && uviScore > 0
        ? (uviScore * 10).toFixed(1)
        : uviScore.toFixed(1)
      : null;

  const uviOffset =
    uviScore != null
      ? 2 *
        Math.PI *
        50 *
        (1 - Math.min(1, Math.max(0, uviScore > 1 ? uviScore / 10 : uviScore)))
      : 2 * Math.PI * 50;

  // Dynamic legend items: only include items with non-null values from the response
  const candidateLegends = [
    { label: "Vegetasi", color: "#22c55e", val: vegetationPct },
    { label: "Sky", color: "#00b4d8", val: skyPct },
    { label: "Vehicles", color: "#ef4444", val: vehiclePct },
    { label: "Building", color: "#8b5cf6", val: buildingPct },
    { label: "Sidewalk", color: "#eab308", val: sidewalkPct },
    { label: "Road", color: "#334155", val: roadPct },
  ];
  const legendItems = candidateLegends.filter((item) => item.val != null);

  // Dynamic Visual Environment Indicators: only include indicators with non-null values
  const rawEnvIndicators = [
    {
      title: "Indeks Visibilitas Bangunan",
      subtitle: "Visibilitas bangunan di sekitar jalan",
      icon: <ApartmentOutlined className="text-purple-500 text-lg" />,
      pct: buildingPct != null ? Math.min(100, Math.round(buildingPct)) : null,
      color: "#8b5cf6",
    },
    {
      title: "Indeks Tutupan Vegetasi",
      subtitle: "Persentase tutupan kanopi dan tanaman",
      icon: <span className="text-emerald-500 text-lg">🌿</span>,
      pct:
        vegetationPct != null ? Math.min(100, Math.round(vegetationPct)) : null,
      color: "#22c55e",
    },
    {
      title: "Indeks Keterbukaan Langit",
      subtitle: "Keterbukaan pandangan langit bebas halangan",
      icon: <span className="text-sky-500 text-lg">☀️</span>,
      pct: skyPct != null ? Math.min(100, Math.round(skyPct)) : null,
      color: "#00b4d8",
    },
    {
      title: "Indeks Aksesibilitas Area",
      subtitle: "Kenyamanan dan kelayakan trotoar pejalan kaki",
      icon: <span className="text-amber-500 text-lg">🚶</span>,
      pct:
        walkabilityRatio != null
          ? Math.min(
              100,
              Math.round(
                walkabilityRatio <= 1
                  ? walkabilityRatio * 100
                  : walkabilityRatio,
              ),
            )
          : null,
      color: "#f59e0b",
    },
    {
      title: "Indeks Kesemrawutan Visual",
      subtitle: "Tingkat kesemrawutan objek dan signage",
      icon: <EyeOutlined className="text-rose-500 text-lg" />,
      pct:
        visualClutterIndex != null
          ? Math.min(
              100,
              Math.round(
                visualClutterIndex <= 1
                  ? visualClutterIndex * 100
                  : visualClutterIndex,
              ),
            )
          : null,
      color: "#ef4444",
    },
  ];
  const envIndicators = rawEnvIndicators.filter((item) => item.pct != null);

  // Prediction scores: only render if at least one score exists
  const hasPredictionScores =
    beautyScore != null || safetyScore != null || comfortScore != null;

  // Dynamic positive & negative factors: only render rows with present values
  const positiveFactors = [
    vegetationPct != null && {
      label: "Cakupan Vegetasi",
      icon: "🌿",
      val: vegetationPct,
      pct: Math.min(100, Math.round(vegetationPct)),
    },
    buildingPct != null && {
      label: "Kepadatan Bangunan",
      icon: "🏢",
      val: buildingPct,
      pct: Math.min(100, Math.round(buildingPct)),
    },
    sidewalkPct != null && {
      label: "Lebar Trotoar",
      icon: "🚶",
      val: sidewalkPct,
      pct: Math.min(100, Math.round(sidewalkPct)),
    },
    skyPct != null && {
      label: "Kondisi Langit Terbuka",
      icon: "☀️",
      val: skyPct,
      pct: Math.min(100, Math.round(skyPct)),
    },
  ].filter(Boolean) as Array<{
    label: string;
    icon: string;
    val: number;
    pct: number;
  }>;

  const negativeFactors = [
    signagePct != null && {
      label: "Kepadatan Reklame",
      icon: <span>🪧</span>,
      val: signagePct,
      pct: Math.min(100, Math.round(signagePct)),
    },
    vehiclePct != null && {
      label: "Kepadatan Kendaraan",
      icon: <CarOutlined className="text-red-500" />,
      val: vehiclePct,
      pct: Math.min(100, Math.round(vehiclePct)),
    },
    visualClutterIndex != null && {
      label: "Kesemrawutan Visual",
      icon: <EyeOutlined className="text-red-500" />,
      val:
        visualClutterIndex <= 1 ? visualClutterIndex * 100 : visualClutterIndex,
      pct: Math.min(
        100,
        Math.round(
          visualClutterIndex <= 1
            ? visualClutterIndex * 100
            : visualClutterIndex,
        ),
      ),
    },
  ].filter(Boolean) as Array<{
    label: string;
    icon: React.ReactNode;
    val: number;
    pct: number;
  }>;

  const hasUviFactors =
    positiveFactors.length > 0 || negativeFactors.length > 0;

  const downloadUrl = isVideo ? segmentedVideoUrl : overlayUrl;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 pb-16 font-sans">
      {/* Top Header Navigation Bar */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            type="text"
            icon={<LeftOutlined />}
            onClick={handleBack}
            className="flex items-center justify-center text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100"
          >
            Kembali
          </Button>
          <div className="h-5 w-px bg-gray-200" />
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 m-0">
            Hasil Segmentasi
          </h1>
          {isVideo && (
            <span className="bg-purple-50 text-purple-600 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-purple-200">
              Video Mode
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {hasAdviceOrSuggestions && (
            <Button
              icon={<ThunderboltFilled className="text-amber-400" />}
              onClick={() => setIsBottomSheetOpen(true)}
              className="bg-[#00bcd4] text-white hover:bg-[#00acc1] border-none rounded-xl font-semibold shadow-xs flex items-center"
            >
              Rekomendasi AI
            </Button>
          )}

          {downloadUrl && (
            <Button
              icon={<DownloadOutlined />}
              size="middle"
              href={downloadUrl}
              target="_blank"
              download
              className="rounded-xl"
            >
              Download
            </Button>
          )}
          <Button
            icon={<ShareAltOutlined />}
            size="middle"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: projectName || "Hasil Segmentasi",
                  url: window.location.href,
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
              }
            }}
            className="rounded-xl"
          />
        </div>
      </div>

      {/* MAIN VIEW */}
      <div className="space-y-6">
        {/* Top Section: 2 Columns on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left Column: Media Information & AI Overlay */}
          <div className="space-y-6">
            {/* Card 1: Project & File Details + Original Media Preview */}
            <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-5 overflow-hidden">
              {hasProjectOrFileInfo && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-sm text-gray-600">
                  {projectName && (
                    <div className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <FolderOpenOutlined className="text-blue-500 text-base shrink-0" />
                      <div className="truncate">
                        <span className="text-xs text-gray-400 block font-medium">
                          Proyek
                        </span>
                        <span className="font-semibold text-gray-800 truncate block">
                          {projectName}
                        </span>
                      </div>
                    </div>
                  )}
                  {fileName && (
                    <div className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      {isVideo ? (
                        <VideoCameraOutlined className="text-purple-500 text-base shrink-0" />
                      ) : (
                        <FileImageOutlined className="text-emerald-500 text-base shrink-0" />
                      )}
                      <div className="truncate">
                        <span className="text-xs text-gray-400 block font-medium">
                          Nama File
                        </span>
                        <span className="font-semibold text-gray-800 truncate block">
                          {fileName}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Original Media Preview (Video Asli / Foto Asli) */}
              <div className="relative rounded-xl overflow-hidden bg-gray-900 border border-gray-100 shadow-inner max-h-80 flex items-center justify-center">
                {isVideo ? (
                  resolvedOriginalVideo ? (
                    <video
                      key={resolvedOriginalVideo}
                      src={resolvedOriginalVideo}
                      controls
                      autoPlay
                      muted
                      loop
                      className="w-full h-72 sm:h-80 object-cover"
                    />
                  ) : (
                    <div className="h-72 flex items-center justify-center text-gray-400">
                      Video asli tidak tersedia
                    </div>
                  )
                ) : rawImageUrl ? (
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
                  <div className="h-72 flex items-center justify-center text-gray-400">
                    Foto asli tidak tersedia
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded-md font-medium pointer-events-none">
                  {isVideo ? "Video Asli" : "Foto Asli"}
                </div>
              </div>
            </div>

            {/* Card 2: Segmentasi AI (Foto Overlay AI) */}
            <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-5">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h3 className="text-base font-bold text-gray-800 m-0">
                    Segmentasi AI
                  </h3>
                  <p className="text-xs text-gray-400 m-0">Foto Overlay AI</p>
                </div>
                {modelName && (
                  <span className="text-xs bg-[#00bcd4]/10 text-[#00bcd4] font-semibold px-2.5 py-1 rounded-full">
                    {modelName}
                  </span>
                )}
              </div>

              {/* Segmented Media Preview: Video Segmentasi AI or Photo Overlay Mask */}
              <div className="relative rounded-xl overflow-hidden bg-gray-900 border border-gray-100 shadow-inner mb-4 flex items-center justify-center">
                {isVideo ? (
                  segmentedVideoUrl ? (
                    <video
                      key={segmentedVideoUrl}
                      src={segmentedVideoUrl}
                      controls
                      autoPlay
                      muted
                      loop
                      className="w-full h-72 sm:h-80 object-cover"
                    />
                  ) : (
                    <div className="h-72 flex items-center justify-center text-gray-400">
                      Overlay video tidak tersedia
                    </div>
                  )
                ) : overlayUrl ? (
                  <Image
                    src={overlayUrl}
                    alt="Foto Overlay AI"
                    rootClassName="w-full h-72 sm:h-80"
                    className="w-full h-72 sm:h-80 object-cover"
                    style={{
                      width: "100%",
                      height: "320px",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div className="h-72 flex items-center justify-center text-gray-400">
                    Overlay gambar tidak tersedia
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-[#00bcd4]/80 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded-md font-medium pointer-events-none">
                  Overlay Mask
                </div>
              </div>

              {/* Color Legend: Only render legend items with non-null values */}
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
          </div>

          {/* Right Column: Index, Skor Prediksi, & Visual Indicators */}
          <div className="space-y-6">
            {/* Card 3: Urban Visual Index / Proportional Vegetation Index */}
            <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6">
              <h3 className="text-base font-bold text-gray-800 mb-4">
                Proportional Vegetation Index
              </h3>

              <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
                {/* Circular Score Gauge (rendered if uviScore is available) */}
                {displayUviNumber != null ? (
                  <div className="relative shrink-0 flex items-center justify-center w-32 h-32">
                    <svg
                      className="w-full h-full transform -rotate-90"
                      viewBox="0 0 120 120"
                    >
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        className="text-gray-100"
                        strokeWidth="10"
                        stroke="currentColor"
                        fill="transparent"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        className="text-[#00bcd4]"
                        strokeWidth="10"
                        strokeDasharray={2 * Math.PI * 50}
                        strokeDashoffset={uviOffset}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black text-[#00bcd4]">
                        {displayUviNumber}
                      </span>
                      <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
                        Skor Indeks
                      </span>
                    </div>
                  </div>
                ) : null}

                {/* Rating Badge & AI Suggestion Paragraph */}
                <div className="flex-1 space-y-2 text-center sm:text-left">
                  {uviBadge && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-cyan-200 bg-cyan-50 text-cyan-700">
                      <StarFilled className="text-cyan-500" />
                      {uviBadge.text}
                    </div>
                  )}

                  {/* Requirement 4: Text from prediction->llm_generate_response->suggestions[0] */}
                  {aiSuggestionText && (
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed m-0 line-clamp-4">
                      {aiSuggestionText}
                    </p>
                  )}
                </div>
              </div>

              {/* Location Information Divider: Only render non-empty fields */}
              {hasLocationInfo && (
                <div className="pt-4 border-t border-gray-100">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                    Informasi Lokasi
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-600">
                    {locationName && (
                      <div className="flex items-center gap-2">
                        <EnvironmentOutlined className="text-[#00bcd4] text-sm shrink-0" />
                        <span className="truncate" title={locationName}>
                          {locationName}
                        </span>
                      </div>
                    )}
                    {formattedDate && (
                      <div className="flex items-center gap-2">
                        <CalendarOutlined className="text-[#00bcd4] text-sm shrink-0" />
                        <span className="truncate">{formattedDate}</span>
                      </div>
                    )}
                    {coordinatesText && (
                      <div className="flex items-center gap-2">
                        <CompassOutlined className="text-[#00bcd4] text-sm shrink-0" />
                        <span className="truncate">{coordinatesText}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Card 4: Skor Prediksi (Beauty, Safety, Comfort) - Only if at least one score exists */}
            {hasPredictionScores && (
              <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6">
                <h3 className="text-base font-bold text-gray-800 mb-4">
                  Skor Prediksi
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  {/* Beauty Card */}
                  {beautyScore != null && (
                    <div className="rounded-2xl p-4 text-white shadow-xs bg-linear-to-br from-pink-500 to-rose-600 flex flex-col justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-semibold opacity-95">
                        <HeartFilled />
                        <span>Beauty</span>
                      </div>
                      <div className="mt-3">
                        <span className="text-2xl sm:text-3xl font-black">
                          {beautyScore.toFixed(1)}
                        </span>
                        <span className="text-xs opacity-80 ml-1">/ 10</span>
                      </div>
                    </div>
                  )}

                  {/* Safety Card */}
                  {safetyScore != null && (
                    <div className="rounded-2xl p-4 text-white shadow-xs bg-linear-to-br from-emerald-500 to-teal-600 flex flex-col justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-semibold opacity-95">
                        <SafetyCertificateFilled />
                        <span>Safety</span>
                      </div>
                      <div className="mt-3">
                        <span className="text-2xl sm:text-3xl font-black">
                          {safetyScore.toFixed(1)}
                        </span>
                        <span className="text-xs opacity-80 ml-1">/ 10</span>
                      </div>
                    </div>
                  )}

                  {/* Comfort Card */}
                  {comfortScore != null && (
                    <div className="rounded-2xl p-4 text-white shadow-xs bg-linear-to-br from-amber-500 to-orange-500 flex flex-col justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-semibold opacity-95">
                        <SmileFilled />
                        <span>Comfort</span>
                      </div>
                      <div className="mt-3">
                        <span className="text-2xl sm:text-3xl font-black">
                          {comfortScore.toFixed(1)}
                        </span>
                        <span className="text-xs opacity-80 ml-1">/ 10</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Card 5: Visual Environment Indicators - Only render if indicators exist */}
            {envIndicators.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6">
                <h3 className="text-base font-bold text-gray-800 mb-4">
                  Visual Environment Indicators
                </h3>
                <div className="space-y-3.5">
                  {envIndicators.map((ind) => (
                    <div
                      key={ind.title}
                      className="flex items-center justify-between p-3 rounded-xl bg-gray-50/70 border border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white shadow-xs flex items-center justify-center shrink-0 border border-gray-100">
                          {ind.icon}
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-gray-800 m-0">
                            {ind.title}
                          </h4>
                          <p className="text-[11px] text-gray-400 m-0">
                            {ind.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="w-10 h-10 shrink-0">
                        <Progress
                          type="circle"
                          percent={ind.pct!}
                          size={40}
                          strokeColor={ind.color}
                          format={(percent) => (
                            <span className="text-[10px] font-bold text-gray-700">
                              {percent}%
                            </span>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section: Faktor Pengaruh UVI / PVI - Only render if factors exist */}
        {hasUviFactors && (
          <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6">
            <div className="mb-4">
              <h3 className="text-base sm:text-lg font-bold text-gray-800 m-0">
                Faktor Pengaruh PVI
              </h3>
              <p className="text-xs text-gray-400 m-0">
                Kontribusi elemen visual yang mempengaruhi indeks vegetasi dan
                kenyamanan koridor
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Faktor Positif */}
              {positiveFactors.length > 0 && (
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
                          <span className="text-[#00bcd4] font-bold">
                            {factor.val.toFixed(1)}%
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
              )}

              {/* Faktor Negatif */}
              {negativeFactors.length > 0 && (
                <div className="rounded-2xl border border-red-100 overflow-hidden bg-rose-50/20">
                  <div className="bg-[#ef4444] text-white px-4 py-2.5 font-bold text-xs sm:text-sm flex items-center gap-2">
                    <span className="text-white">✕</span>
                    <span>Faktor Negatif</span>
                  </div>
                  <div className="p-4 space-y-3.5">
                    {negativeFactors.map((factor) => (
                      <div key={factor.label}>
                        <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                          <span className="flex items-center gap-1.5">
                            {factor.icon} {factor.label}
                          </span>
                          <span className="text-red-500 font-bold">
                            {factor.val.toFixed(1)}%
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
              )}
            </div>
          </div>
        )}

        {/* Section Rekomendasi AI (Photo Only, matching Image 1) */}
        {hasAdviceOrSuggestions && (
          <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <ThunderboltFilled className="text-cyan-500 text-lg" />
                <h3 className="text-base sm:text-lg font-bold text-gray-800 m-0">
                  Rekomendasi AI
                </h3>
              </div>
              <Button
                type="primary"
                onClick={() => setIsBottomSheetOpen(true)}
                className="bg-[#00bcd4] hover:bg-[#00acc1] border-none rounded-xl font-semibold shadow-xs"
              >
                Buka Analisis & Perbandingan
              </Button>
            </div>

            {/* Suggestion Bubble */}
            {aiSuggestionText && (
              <div className="bg-cyan-50/50 border border-cyan-100 rounded-2xl p-4 mb-4 flex items-start gap-3">
                <ThunderboltFilled className="text-[#00bcd4] text-lg shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed m-0">
                  {aiSuggestionText}
                </p>
              </div>
            )}

            {/* Visualisasi prediktif berbasis AI with generated_image_url */}
            {generatedImageUrl && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Visualisasi prediktif berbasis AI
                </div>

                <div className="relative rounded-2xl overflow-hidden bg-gray-900 border border-gray-100 max-h-96 flex items-center justify-center">
                  <Image
                    src={generatedImageUrl}
                    alt="Visualisasi prediktif berbasis AI"
                    rootClassName="w-full h-80 sm:h-96"
                    className="w-full h-80 sm:h-96 object-cover"
                    style={{
                      width: "100%",
                      height: "384px",
                      objectFit: "cover",
                    }}
                  />
                  <div className="absolute top-3 left-3 bg-[#00bcd4]/90 backdrop-blur-xs text-white text-xs px-3 py-1 rounded-md font-semibold pointer-events-none">
                    ✨ AI Generated Redesign
                  </div>
                </div>

                {/* Disclaimer banner */}
                <div className="bg-sky-50 border border-sky-100 rounded-xl p-3 text-xs text-sky-800 flex items-start gap-2">
                  <InfoCircleOutlined className="text-sky-500 shrink-0 mt-0.5" />
                  <span>
                    Gambar ini menunjukkan rekomendasi berbasis AI tentang
                    potensi peningkatan kawasan perkotaan berdasarkan
                    optimalisasi UVI, bukan representasi mutlak / prediksi yang
                    memiliki akurasi 100%.
                  </span>
                </div>

                <div className="pt-2 flex justify-center">
                  <Button
                    onClick={() => setIsBottomSheetOpen(true)}
                    className="w-full sm:w-auto px-8 py-2.5 h-auto text-sm font-semibold rounded-xl bg-[#00bcd4] text-white hover:bg-[#00acc1] border-none shadow-xs"
                  >
                    Lihat Rekomendasi AI & Perbandingan
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bottom Action Buttons (Unduh Laporan & Kembali ke Beranda & Buka Rekomendasi) */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {hasAdviceOrSuggestions && (
            <Button
              type="primary"
              size="large"
              icon={<ThunderboltFilled className="text-amber-300" />}
              onClick={() => setIsBottomSheetOpen(true)}
              className="flex-1 h-12 rounded-xl bg-gray-900 hover:bg-gray-800 text-white border-none font-bold text-sm shadow-xs"
            >
              Lihat Rekomendasi & Perbandingan
            </Button>
          )}
          <Button
            type="primary"
            size="large"
            onClick={() => window.print()}
            className="flex-1 h-12 rounded-xl bg-[#00bcd4] hover:bg-[#00acc1] border-none font-bold text-sm shadow-xs"
          >
            Unduh Laporan
          </Button>
          <Button
            size="large"
            onClick={handleGoHome}
            className="flex-1 h-12 rounded-xl border border-gray-200 text-gray-700 hover:text-gray-900 font-bold text-sm"
          >
            Kembali ke Beranda
          </Button>
        </div>
      </div>

      {/* BOTTOM SHEET: Rekomendasi & Analisis AI + Perbandingan Visual Sebelum & Sesudah */}
      <Drawer
        placement="bottom"
        open={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
        height="88vh"
        destroyOnClose
        closable={false}
        styles={{
          content: {
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            overflow: "hidden",
            backgroundColor: "#ffffff",
            boxShadow: "0 -10px 40px rgba(0, 0, 0, 0.12)",
          },
          body: {
            padding: 0,
            overflowY: "auto",
          },
          mask: {
            backgroundColor: "rgba(0, 0, 0, 0.45)",
            backdropFilter: "blur(4px)",
          },
        }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-3 pb-12">
          {/* Handle Bar (Drag Indicator) */}
          <div className="flex justify-center pt-1 pb-3">
            <div
              onClick={() => setIsBottomSheetOpen(false)}
              className="w-12 h-1.5 bg-gray-300 rounded-full cursor-pointer hover:bg-gray-400 transition-colors"
              title="Tutup Bottom Sheet"
            />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 mb-6">
            <div className="flex items-center gap-2.5">
              <ThunderboltFilled className="text-[#00bcd4] text-xl" />
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 m-0">
                Rekomendasi & Analisis AI
              </h2>
            </div>
            <Button
              type="text"
              shape="circle"
              icon={
                <CloseOutlined className="text-gray-400 hover:text-gray-700 text-base" />
              }
              onClick={() => setIsBottomSheetOpen(false)}
              className="flex items-center justify-center hover:bg-gray-100 rounded-full"
            />
          </div>

          {/* PERBANDINGAN VISUAL SEBELUM & SESUDAH (Langsung di dalam Bottom Sheet, tanpa modal terpisah) */}
          {rawImageUrl && generatedImageUrl && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm sm:text-base font-bold text-gray-800 m-0 flex items-center gap-2">
                  <SwapOutlined className="text-[#00bcd4]" />
                  <span>Perbandingan Visual Sebelum & Sesudah</span>
                </h3>
                <span className="text-[11px] text-gray-400 font-medium hidden sm:inline">
                  Klik gambar untuk melihat resolusi penuh
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Sebelum (Foto Asli) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                    <span>Sebelum (Foto Asli)</span>
                    {displayUviNumber && (
                      <span className="text-[11px] text-gray-400 font-semibold">
                        Skor Indeks: {displayUviNumber}
                      </span>
                    )}
                  </div>
                  <div className="relative rounded-2xl overflow-hidden bg-gray-900 border border-gray-200 h-64 sm:h-72 shadow-xs">
                    <Image
                      src={rawImageUrl}
                      alt="Sebelum (Foto Asli)"
                      rootClassName="w-full h-full"
                      className="w-full h-full object-cover"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-white text-[11px] px-2.5 py-0.5 rounded-md font-semibold pointer-events-none">
                      Foto Asli
                    </div>
                  </div>
                </div>

                {/* Sesudah (Optimalisasi AI) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#00bcd4]">
                    <span>Sesudah (Optimalisasi AI)</span>
                    <span className="text-[11px] bg-cyan-100 text-cyan-800 px-2.5 py-0.5 rounded-full font-bold">
                      ✨ Rekomendasi AI
                    </span>
                  </div>
                  <div className="relative rounded-2xl overflow-hidden bg-gray-900 border border-[#00bcd4]/50 h-64 sm:h-72 shadow-xs">
                    <Image
                      src={generatedImageUrl}
                      alt="Sesudah (Optimalisasi AI)"
                      rootClassName="w-full h-full"
                      className="w-full h-full object-cover"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <div className="absolute top-2.5 left-2.5 bg-[#00bcd4]/90 backdrop-blur-xs text-white text-[11px] px-2.5 py-0.5 rounded-md font-semibold pointer-events-none">
                      Hasil Redesign AI
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Divider if visual comparison exists and diagnosis/rekomendasi follows */}
          {rawImageUrl &&
            generatedImageUrl &&
            (diagnosis ||
              recommendations.length > 0 ||
              visualSuggestions.length > 0) && (
              <div className="h-px bg-gray-100 my-5" />
            )}

          {/* 1. Diagnosis Section */}
          {diagnosis && (
            <div className="mb-6">
              <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-2">
                Diagnosis
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed m-0 text-justify">
                {diagnosis}
              </p>
            </div>
          )}

          {/* Divider */}
          {diagnosis && recommendations.length > 0 && (
            <div className="h-px bg-gray-100 my-5" />
          )}

          {/* 2. Tindakan Rekomendasi Section */}
          {recommendations.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-3.5">
                Tindakan Rekomendasi
              </h3>
              <div className="space-y-3.5">
                {recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-cyan-100/90 bg-[#f0fdfa]/40 p-4 sm:p-5 space-y-2 hover:border-[#00bcd4]/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="bg-[#00bcd4] text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {rec.peran ? rec.peran.replace(/_/g, " ") : "UMUM"}
                      </span>
                      <span className="text-xs font-semibold text-gray-400">
                        Prioritas {rec.prioritas ?? idx + 1}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-800 font-medium leading-relaxed m-0">
                      {rec.tindakan}
                    </p>
                    {rec.dampak && (
                      <p className="text-xs text-[#00acc1] font-medium m-0">
                        <span className="font-semibold">Dampak:</span>{" "}
                        {rec.dampak}
                      </p>
                    )}
                    {rec.standar && (
                      <p className="text-xs text-gray-400 m-0">
                        <span className="font-semibold">Standar:</span>{" "}
                        {rec.standar}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Divider */}
          {(diagnosis || recommendations.length > 0) &&
            visualSuggestions.length > 0 && (
              <div className="h-px bg-gray-100 my-5" />
            )}

          {/* 3. Saran Perbaikan Visual Section */}
          {visualSuggestions.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-3.5">
                Saran Perbaikan Visual
              </h3>
              <ul className="space-y-3 pl-0 list-none m-0">
                {visualSuggestions.map((sug, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-700 leading-relaxed"
                  >
                    <span className="text-[#00bcd4] font-black text-base shrink-0 leading-none mt-0.5">
                      •
                    </span>
                    <span>{sug}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 4. Caveat / Disclaimer box */}
          {caveatText && (
            <div className="bg-[#fefce8] border border-amber-200/90 rounded-2xl p-4 flex items-start gap-3 text-amber-800 text-xs sm:text-[13px] leading-relaxed mt-6">
              <InfoCircleOutlined className="text-amber-500 text-base shrink-0 mt-0.5" />
              <span>{caveatText}</span>
            </div>
          )}

          {/* Action buttons inside Bottom Sheet */}
          <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end">
            <Button
              type="primary"
              onClick={() => setIsBottomSheetOpen(false)}
              className="w-full sm:w-36 h-11 rounded-xl bg-[#00bcd4] hover:bg-[#00acc1] border-none font-semibold text-sm shadow-xs"
            >
              Tutup
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default SegmentationResultView;
