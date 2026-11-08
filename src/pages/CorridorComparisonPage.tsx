import { useState, useEffect, useCallback } from "react";
import { Select, Skeleton, message } from "antd";
import { PictureOutlined } from "@ant-design/icons";
import {
  streetPhotosService,
  type StreetPhoto,
} from "../api/street-photos.service";
import {
  segmentationResultsService,
  type SegmentationResult,
} from "../api/segmentation-results.service";
import { resolveMediaUrl } from "../components/SegmentationResultView";

interface CorridorIndicator {
  key: string;
  title: string;
  value: number | null;
  color: string;
}

export default function CorridorComparisonPage() {
  // Photos list state (same as Visual Analysis)
  const [photos, setPhotos] = useState<StreetPhoto[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState<boolean>(false);

  // Selected photo IDs for Corridor 1 & Corridor 2
  const [photoId1, setPhotoId1] = useState<string | null>(null);
  const [photoId2, setPhotoId2] = useState<string | null>(null);

  // Segmentation analysis results
  const [result1, setResult1] = useState<SegmentationResult | null>(null);
  const [loadingResult1, setLoadingResult1] = useState<boolean>(false);
  const [error1, setError1] = useState<string | null>(null);

  const [result2, setResult2] = useState<SegmentationResult | null>(null);
  const [loadingResult2, setLoadingResult2] = useState<boolean>(false);
  const [error2, setError2] = useState<string | null>(null);

  // 1. Fetch photo list on mount (same source as Analisis Visual)
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

      // Default select first photo for corridor 1 and second (or first) for corridor 2
      if (list.length > 0) {
        setPhotoId1(list[0].id);
        setPhotoId2(list.length > 1 ? list[1].id : list[0].id);
      }
    } catch (err: any) {
      console.error("Failed to fetch street photos:", err);
      message.error(
        err.response?.data?.detail || "Gagal memuat daftar foto jalan",
      );
    } finally {
      setLoadingPhotos(false);
    }
  }, []);

  useEffect(() => {
    fetchPhotosList();
  }, [fetchPhotosList]);

  // 2. Fetch segmentation result for Corridor 1
  useEffect(() => {
    if (!photoId1) {
      setResult1(null);
      setError1(null);
      return;
    }

    let isMounted = true;
    const fetchResult1 = async () => {
      setLoadingResult1(true);
      setError1(null);
      try {
        const data = await segmentationResultsService.getByPhotoId(photoId1);
        if (isMounted) setResult1(data);
      } catch (err: any) {
        console.error("Failed to fetch segmentation result 1:", err);
        if (isMounted) {
          setError1(
            err.response?.data?.detail ||
              "Hasil segmentasi belum tersedia untuk foto ini.",
          );
          setResult1(null);
        }
      } finally {
        if (isMounted) setLoadingResult1(false);
      }
    };

    fetchResult1();
    return () => {
      isMounted = false;
    };
  }, [photoId1]);

  // 3. Fetch segmentation result for Corridor 2
  useEffect(() => {
    if (!photoId2) {
      setResult2(null);
      setError2(null);
      return;
    }

    let isMounted = true;
    const fetchResult2 = async () => {
      setLoadingResult2(true);
      setError2(null);
      try {
        const data = await segmentationResultsService.getByPhotoId(photoId2);
        if (isMounted) setResult2(data);
      } catch (err: any) {
        console.error("Failed to fetch segmentation result 2:", err);
        if (isMounted) {
          setError2(
            err.response?.data?.detail ||
              "Hasil segmentasi belum tersedia untuk foto ini.",
          );
          setResult2(null);
        }
      } finally {
        if (isMounted) setLoadingResult2(false);
      }
    };

    fetchResult2();
    return () => {
      isMounted = false;
    };
  }, [photoId2]);

  // Helper to extract indicators from segmentation result
  const extractIndicators = (
    result: SegmentationResult | null,
  ): CorridorIndicator[] => {
    if (!result) return [];

    const buildingVal = result.building_pct ?? result.building_coverage_pct;
    const vegVal = result.vegetation_pct ?? result.green_coverage_pct;
    const skyVal = result.sky_pct ?? result.sky_visibility_pct;
    const walkVal = result.walkability_ratio ?? result.sidewalk_pct;
    const clutterVal = result.visual_clutter_index ?? result.signage_pct;

    const toPct = (val: number | null | undefined) => {
      if (val === null || val === undefined) return null;
      return val <= 1 ? val * 100 : val;
    };

    return [
      {
        key: "building",
        title: "Indeks Keterlihatan Bangunan",
        value: toPct(buildingVal),
        color: "#f97316", // Orange
      },
      {
        key: "vegetation",
        title: "Indeks Cakupan Vegetasi",
        value: toPct(vegVal),
        color: "#10b981", // Teal / Emerald
      },
      {
        key: "sky",
        title: "Indeks Keterbukaan Langit",
        value: toPct(skyVal),
        color: "#0ea5e9", // Sky blue
      },
      {
        key: "walkability",
        title: "Indeks Aksesibilitas Permukaan",
        value: toPct(walkVal),
        color: "#8b5cf6", // Purple
      },
      {
        key: "clutter",
        title: "Indeks Dominasi Visual",
        value: toPct(clutterVal),
        color: "#eab308", // Yellow / Amber
      },
    ];
  };

  // Helper to get formatted UVI score
  const getUviScore = (result: SegmentationResult | null): string => {
    if (!result) return "-";
    const uvi =
      result.prediction?.uvi_score ??
      result.prediction?.llm_generate_response?.target?.perception_prediction
        ?.uvi_score ??
      (result as any).uvi_score;

    if (uvi === null || uvi === undefined || isNaN(uvi)) return "-";
    const val = Number(uvi);
    const normalized = val > 1 ? val / 10 : val;
    return normalized.toFixed(2);
  };

  // Render individual Corridor Card
  const renderCorridorCard = (
    photoId: string | null,
    result: SegmentationResult | null,
    loading: boolean,
    error: string | null,
    corridorTitle: string,
  ) => {
    const photo = photos.find((p) => p.id === photoId);
    const indicators = extractIndicators(result);
    const uviScore = getUviScore(result);

    // Resolve thumbnail image URL
    const photoUrl = resolveMediaUrl(
      result?.privacy_masked_url ||
        result?.segmentation_url ||
        photo?.file_path,
    );

    return (
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-100 shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between min-h-110">
        {loading ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton.Avatar
                active
                size={64}
                shape="square"
                className="rounded-xl"
              />
              <div className="flex-1 space-y-2">
                <Skeleton.Input active size="small" style={{ width: "60%" }} />
                <Skeleton.Input active size="small" style={{ width: "40%" }} />
              </div>
            </div>
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <Skeleton.Input active block style={{ height: 32 }} />
              <Skeleton.Input active block style={{ height: 20 }} />
              <Skeleton.Input active block style={{ height: 20 }} />
              <Skeleton.Input active block style={{ height: 20 }} />
              <Skeleton.Input active block style={{ height: 20 }} />
            </div>
          </div>
        ) : error || !result ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center mb-3 text-xl border border-gray-100">
              <PictureOutlined />
            </div>
            <h4 className="text-sm font-bold text-gray-700 mb-1">
              {photo?.original_filename || corridorTitle}
            </h4>
            <p className="text-xs text-gray-400 max-w-xs m-0">
              {error ||
                "Silakan pilih foto untuk melihat data indikator lingkungan visual."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header: Photo Thumbnail + Title & Location */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100 shadow-xs">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={photo?.original_filename || "Corridor"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <PictureOutlined className="text-2xl" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3
                  className="text-base sm:text-lg font-bold text-slate-800 truncate m-0 leading-tight"
                  title={photo?.original_filename || "Foto Koridor"}
                >
                  {photo?.original_filename || "Foto Koridor"}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 truncate mt-1 mb-0">
                  {photo?.street_name ||
                    result?.street_name ||
                    result?.project?.location ||
                    "Malang"}
                </p>
              </div>
            </div>

            {/* Rata-rata UVI Score */}
            <div className="flex items-baseline justify-between pt-2">
              <span className="text-xs sm:text-sm font-medium text-slate-500">
                Rata-rata UVI
              </span>
              <span className="text-3xl sm:text-4xl font-extrabold text-[#16a34a] tracking-tight">
                {uviScore}
              </span>
            </div>

            {/* Visual Environment Indicators Progress Bars */}
            <div className="space-y-4 pt-1">
              {indicators.map((ind) => {
                const pct =
                  ind.value != null ? Math.min(100, Math.max(0, ind.value)) : 0;
                const displayVal =
                  ind.value != null
                    ? `${ind.value.toFixed(ind.value % 1 === 0 ? 0 : 1)}%`
                    : "-";

                return (
                  <div key={ind.key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-semibold text-slate-700">
                        {ind.title}
                      </span>
                      <span className="font-bold text-slate-800">
                        {displayVal}
                      </span>
                    </div>

                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: ind.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-1">
            Perbandingan Koridor
          </h1>
          <p className="text-slate-500 text-sm m-0">
            Bandingkan dua koridor jalan menggunakan indikator yang konsisten.
          </p>
        </div>
      </div>

      {/* Corridor Selectors Bar */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm">
        {/* Koridor Pertama */}
        <div className="flex items-center gap-2.5">
          <span className="font-semibold text-slate-700 shrink-0">
            Koridor pertama
          </span>
          <Select
            placeholder="Pilih koridor 1..."
            value={photoId1}
            onChange={(val) => setPhotoId1(val)}
            loading={loadingPhotos}
            showSearch
            optionFilterProp="label"
            className="w-48 sm:w-56"
            options={photos.map((p) => ({
              value: p.id,
              label: p.original_filename,
            }))}
          />
        </div>

        {/* Separator */}
        <span className="text-slate-400 font-medium hidden sm:inline">vs.</span>

        {/* Koridor Kedua */}
        <div className="flex items-center gap-2.5">
          <span className="font-semibold text-slate-700 shrink-0">
            Koridor kedua
          </span>
          <Select
            placeholder="Pilih koridor 2..."
            value={photoId2}
            onChange={(val) => setPhotoId2(val)}
            loading={loadingPhotos}
            showSearch
            optionFilterProp="label"
            className="w-48 sm:w-56"
            options={photos.map((p) => ({
              value: p.id,
              label: p.original_filename,
            }))}
          />
        </div>
      </div>

      {/* Comparison Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderCorridorCard(
          photoId1,
          result1,
          loadingResult1,
          error1,
          "Koridor Pertama",
        )}
        {renderCorridorCard(
          photoId2,
          result2,
          loadingResult2,
          error2,
          "Koridor Kedua",
        )}
      </div>
    </div>
  );
}
