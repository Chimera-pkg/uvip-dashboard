import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button, Skeleton, Result, Image } from "antd";
import {
  LeftOutlined,
  HeartFilled,
  SafetyCertificateFilled,
  SmileFilled,
  InfoCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  segmentationResultsService,
  type SegmentationResult,
  type LLMAdviceContent,
  type LLMAdviceRecommendation,
} from "../api/segmentation-results.service";
import { resolveMediaUrl } from "../components/SegmentationResultView";

export default function AiRecommendationDetailPage() {
  const { photoId } = useParams<{ photoId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const stateData = (location.state as any) || {};

  const [data, setData] = useState<SegmentationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await segmentationResultsService.getByPhotoId(id);
      setData(result);
    } catch (err: any) {
      console.error("Failed to fetch recommendation detail:", err);
      const msg =
        err.response?.data?.detail ||
        "Gagal memuat rekomendasi AI untuk foto ini.";
      setError(msg);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (photoId) {
      fetchDetail(photoId);
    }
  }, [photoId]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <Skeleton.Button active shape="round" style={{ width: 140 }} />
        <Skeleton.Input active block style={{ height: 36 }} />
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 space-y-4">
          <Skeleton.Image active style={{ width: "100%", height: 320 }} />
          <Skeleton active paragraph={{ rows: 3 }} />
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 space-y-4">
          <Skeleton active paragraph={{ rows: 4 }} />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <Result
          status="warning"
          title="Rekomendasi AI Belum Tersedia"
          subTitle={error || "Data rekomendasi tidak ditemukan untuk foto ini."}
          extra={[
            <Button
              type="primary"
              key="back"
              onClick={() => navigate("/ai-recommendations")}
              className="bg-[#00bcd4] hover:bg-[#00acc1] border-none"
            >
              Kembali ke Daftar Rekomendasi
            </Button>,
            <Button
              key="retry"
              icon={<ReloadOutlined />}
              onClick={() => photoId && fetchDetail(photoId)}
            >
              Coba Lagi
            </Button>,
          ]}
        />
      </div>
    );
  }

  const rawData: any = data;
  const prediction = rawData?.prediction || null;
  const llmGen = prediction?.llm_generate_response || null;
  const project = rawData?.project || null;

  // Media URLs:
  const rawImageUrl = resolveMediaUrl(
    llmGen?.raw_image_url ||
      stateData?.originalPhotoUrl ||
      rawData?.privacy_masked_url ||
      rawData?.file_path,
  );

  const generatedImageUrl = llmGen?.generated_image_url
    ? resolveMediaUrl(llmGen.generated_image_url)
    : "";

  // Metadata
  const fileName =
    stateData?.originalFilename ||
    rawData?.original_filename ||
    llmGen?.photo_path?.split("/").pop() ||
    "Foto";
  const projectName =
    stateData?.projectName ||
    project?.name ||
    rawData?.project_name ||
    stateData?.locationName ||
    "Proyek";

  // Score metrics
  const uviScore: number | null =
    prediction?.uvi_score ?? rawData?.uvi_score ?? null;
  const displayUviNumber =
    uviScore != null
      ? uviScore <= 1 && uviScore > 0
        ? uviScore.toFixed(2)
        : (uviScore / 10).toFixed(2)
      : null;

  const beautyScore: number | null = prediction?.beauty_score ?? null;
  const safetyScore: number | null = prediction?.safety_score ?? null;
  const comfortScore: number | null = prediction?.comfort_score ?? null;
  const hasPredictionScores =
    beautyScore != null || safetyScore != null || comfortScore != null;

  // Extract adviceData from llm_advice_response
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

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 pb-16 font-sans space-y-6">
      {/* Top Navigation & Title Bar (Matching Image 2) */}
      <div className="space-y-1">
        <button
          type="button"
          onClick={() => navigate("/ai-recommendations")}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-500 hover:text-[#00bcd4] transition-colors cursor-pointer bg-transparent border-none p-0 mb-2"
        >
          <LeftOutlined className="text-xs" />
          <span>Rekomendasi AI</span>
        </button>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 m-0 tracking-tight">
          {fileName}
        </h1>
        <p className="text-gray-400 text-xs sm:text-sm m-0">
          Konsep perbaikan visual · {projectName}
        </p>
      </div>

      {/* SECTION 1: Visual Comparison Sebelum & Sesudah (Matching Image 2) */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-5 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Sebelum (Foto Asli) */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm font-bold text-gray-800">
              <span>Sebelum</span>
              <span className="text-xs text-gray-400 font-medium">Foto Asli</span>
            </div>
            <div className="relative rounded-2xl overflow-hidden bg-gray-900 border border-gray-100 shadow-inner h-64 sm:h-80 flex items-center justify-center">
              {rawImageUrl ? (
                <Image
                  src={rawImageUrl}
                  alt="Foto Asli (Sebelum)"
                  rootClassName="w-full h-full"
                  className="w-full h-full object-cover"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div className="text-gray-400 text-xs">Foto asli tidak tersedia</div>
              )}
            </div>
          </div>

          {/* Sesudah (Konsep perbaikan hasil AI) */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm font-bold text-gray-800">
              <span>Sesudah</span>
              <span className="text-xs text-gray-400 font-medium">
                Konsep perbaikan hasil AI
              </span>
            </div>
            <div className="relative rounded-2xl overflow-hidden bg-gray-900 border border-gray-100 shadow-inner h-64 sm:h-80 flex items-center justify-center">
              {generatedImageUrl ? (
                <Image
                  src={generatedImageUrl}
                  alt="Konsep Perbaikan AI (Sesudah)"
                  rootClassName="w-full h-full"
                  className="w-full h-full object-cover"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div className="text-gray-400 text-xs text-center px-4">
                  Visualisasi prediktif AI belum dievaluasi untuk foto ini.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* UVI Comparison Footer Note */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 pt-3 border-t border-gray-100 text-xs text-gray-500">
          {displayUviNumber && (
            <span className="bg-cyan-50 text-[#00acc1] border border-cyan-200/80 font-bold px-2.5 py-0.5 rounded-full text-[11px] shrink-0">
              UVI saat ini {displayUviNumber}
            </span>
          )}
          <span>
            UVI sesudah: belum dievaluasi. Analisis ulang dan validasi lapangan diperlukan untuk menilai perubahan skor.
          </span>
        </div>
      </div>

      {/* SECTION 2: Skor Prediksi / Persepsi Kualitas Lingkungan (Matching SegmentationResultView & Image 2) */}
      {hasPredictionScores && (
        <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-5 sm:p-6 space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-gray-800 m-0">
            Persepsi Kualitas Lingkungan
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {/* Beauty Card */}
            {beautyScore != null && (
              <div className="rounded-2xl p-4 text-white shadow-xs bg-linear-to-br from-pink-500 to-rose-600 flex flex-col justify-between min-h-24">
                <div className="flex items-center gap-1.5 text-xs font-semibold opacity-95">
                  <HeartFilled />
                  <span>Skor Keindahan</span>
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
              <div className="rounded-2xl p-4 text-white shadow-xs bg-linear-to-br from-emerald-500 to-teal-600 flex flex-col justify-between min-h-24">
                <div className="flex items-center gap-1.5 text-xs font-semibold opacity-95">
                  <SafetyCertificateFilled />
                  <span>Skor Keamanan</span>
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
              <div className="rounded-2xl p-4 text-white shadow-xs bg-linear-to-br from-amber-500 to-orange-500 flex flex-col justify-between min-h-24">
                <div className="flex items-center gap-1.5 text-xs font-semibold opacity-95">
                  <SmileFilled />
                  <span>Skor Kenyamanan</span>
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

      {/* SECTION 3: Diagnosis (Matching existing bottom sheet) */}
      {diagnosis && (
        <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-5 sm:p-6 space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-gray-800 m-0">
            Diagnosis
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed m-0 text-justify">
            {diagnosis}
          </p>
        </div>
      )}

      {/* SECTION 4: Tindakan Rekomendasi (Matching existing bottom sheet) */}
      {recommendations.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-5 sm:p-6 space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-gray-800 m-0">
            Tindakan Rekomendasi
          </h2>
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
                    <span className="font-semibold">Dampak:</span> {rec.dampak}
                  </p>
                )}
                {rec.standar && (
                  <p className="text-xs text-gray-400 m-0">
                    <span className="font-semibold">Standar:</span> {rec.standar}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 5: Saran Perbaikan Visual (Matching existing bottom sheet) */}
      {visualSuggestions.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-5 sm:p-6 space-y-3.5">
          <h2 className="text-base sm:text-lg font-bold text-gray-800 m-0">
            Saran Perbaikan Visual
          </h2>
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

      {/* SECTION 6: Caveat / Disclaimer (Matching existing bottom sheet) */}
      {caveatText && (
        <div className="bg-[#fefce8] border border-amber-200/90 rounded-2xl p-4 flex items-start gap-3 text-amber-800 text-xs sm:text-[13px] leading-relaxed">
          <InfoCircleOutlined className="text-amber-500 text-base shrink-0 mt-0.5" />
          <span>{caveatText}</span>
        </div>
      )}
    </div>
  );
}

