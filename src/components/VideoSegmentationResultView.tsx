import React, { useEffect } from "react";
import { Button, Skeleton, Result } from "antd";
import { LeftOutlined } from "@ant-design/icons";
import { useVideoSegmentationResult } from "../hooks/useVideoSegmentationResult";

interface Props {
  videoId: string;
  onBack: () => void;
}

export const VideoSegmentationResultView: React.FC<Props> = ({
  videoId,
  onBack,
}) => {
  const { data, loading, error, fetchVideoSegmentationResult } =
    useVideoSegmentationResult();

  useEffect(() => {
    fetchVideoSegmentationResult(videoId);
  }, [videoId, fetchVideoSegmentationResult]);

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-xl shadow-sm h-full w-full max-w-lg mx-auto">
        <Skeleton active />
        <Skeleton active className="mt-4" />
      </div>
    );
  }

  if (error) {
    return (
      <Result
        status="error"
        title="Failed to Load"
        subTitle={error}
        extra={[
          <Button type="primary" onClick={onBack} key="back">
            Back to Videos
          </Button>,
          <Button
            onClick={() => fetchVideoSegmentationResult(videoId)}
            key="retry"
          >
            Retry
          </Button>,
        ]}
      />
    );
  }

  if (!data) return null;

  const videoUrl = data.video_url || data.segmentation?.segmentation_overlay_url || data.segmentation?.segmentation_url;

  // Prepare scores
  const p = data.prediction;
  const scores = [
    {
      label: "UVI",
      value: p?.uvi_score?.toFixed(2) || "-",
      bg: "#e5f8b4",
      color: "#688e14",
    },
    {
      label: "Safety",
      value: p?.safety_score?.toFixed(2) || "-",
      bg: "#e5d1f8",
      color: "#652a9f",
    },
    {
      label: "Beauty",
      value: p?.beauty_score?.toFixed(2) || "-",
      bg: "#ffd6e0",
      color: "#d81b49",
    },
    {
      label: "Comfort",
      value: p?.comfort_score?.toFixed(2) || "-",
      bg: "#ffe5c8",
      color: "#c45e00",
    },
    {
      label: "GVI",
      value: p?.gvi_score ? `${p.gvi_score.toFixed(1)}%` : "-",
      bg: "#dff69b",
      color: "#567a0d",
    },
  ];

  const seg = data.segmentation || {};
  const positiveFactors = [
    {
      label: "Cakupan Vegetasi",
      value:
        seg.green_coverage_pct != null
          ? `+ ${(seg.green_coverage_pct / 100).toFixed(2)}`
          : "-",
      score:
        seg.green_coverage_pct != null ? seg.green_coverage_pct / 100 : 0,
    },
    {
      label: "Lebar Trotoar",
      value:
        seg.sidewalk_pct != null ? `+ ${seg.sidewalk_pct.toFixed(2)}` : "-",
      score: seg.sidewalk_pct != null ? seg.sidewalk_pct : 0,
    },
    {
      label: "Keterbukaan Langit",
      value:
        seg.sky_visibility_pct != null
          ? `+ ${(seg.sky_visibility_pct / 100).toFixed(2)}`
          : "-",
      score:
        seg.sky_visibility_pct != null ? seg.sky_visibility_pct / 100 : 0,
    },
  ];

  const negativeFactors = [
    {
      label: "Kepadatan Reklame",
      value:
        seg.signage_pct != null
          ? `- ${(seg.signage_pct / 100).toFixed(2)}`
          : seg.visual_clutter_index != null
            ? `- ${seg.visual_clutter_index.toFixed(2)}`
            : "-",
      score:
        seg.signage_pct != null
          ? seg.signage_pct / 100
          : seg.visual_clutter_index != null
            ? seg.visual_clutter_index
            : 0,
    },
    {
      label: "Kepadatan Kendaraan",
      value:
        seg.vehicle_pct != null
          ? `- ${(seg.vehicle_pct / 100).toFixed(2)}`
          : "-",
      score: seg.vehicle_pct != null ? seg.vehicle_pct / 100 : 0,
    },
    {
      label: "Bangunan Tinggi",
      value:
        seg.building_coverage_pct != null
          ? `- ${(seg.building_coverage_pct / 100).toFixed(2)}`
          : "-",
      score:
        seg.building_coverage_pct != null
          ? seg.building_coverage_pct / 100
          : 0,
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mx-auto w-full max-w-2xl relative">
      <div className="flex justify-between items-center mb-6">
        <Button
          type="text"
          icon={<LeftOutlined />}
          onClick={onBack}
          className="text-xl"
        />
        <h2 className="text-xl font-bold m-0 text-gray-800">
          Hasil Segmentasi
        </h2>
      </div>

      <div className="relative rounded-2xl overflow-hidden mb-6 border border-gray-100 bg-gray-50 flex items-center justify-center">
        {videoUrl ? (
          <video
            src={videoUrl}
            controls
            autoPlay
            loop
            muted
            className="w-full h-auto max-h-100 bg-black"
          />
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-400">
            Video not available
          </div>
        )}

        {/* Fake Legend as overlay (optional, but keep it for consistency) */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full flex gap-3 text-[10px] shadow-sm font-medium z-10 pointer-events-none">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#8fb339]"></span>
            Vegetation
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#7a309f]"></span>Building
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#4bb1d6]"></span>Sky
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#ffe347]"></span>Sidewalk
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#e84855]"></span>Vehicles
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#52525b]"></span>Road
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Skor Prediksi</h3>
        <div className="grid grid-cols-5 gap-3">
          {scores.map((score) => (
            <div
              key={score.label}
              className="flex flex-col items-center justify-center py-2 rounded-xl"
              style={{ backgroundColor: score.bg }}
            >
              <span
                className="text-[10px] font-semibold mb-1"
                style={{ color: score.color, opacity: 0.8 }}
              >
                {score.label}
              </span>
              <span
                className="text-lg font-bold"
                style={{ color: score.color }}
              >
                {score.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Faktor Pengaruh (SHAP)
        </h3>

        {/* Positive Factors */}
        <div className="border border-gray-200 rounded-xl overflow-hidden mb-4 shadow-sm">
          <div className="bg-[#d3efe2] px-4 py-2 border-b border-gray-100">
            <h4 className="text-[#3b9f82] font-semibold m-0">Faktor Positif</h4>
          </div>
          <div className="bg-white p-4">
            {positiveFactors.map((factor, index) => (
              <div
                key={factor.label}
                className={`flex items-center ${index !== positiveFactors.length - 1 ? "mb-4" : ""}`}
              >
                <span className="w-36 text-xs font-semibold text-gray-700">
                  {factor.label}
                </span>
                <span className="w-12 text-xs font-semibold text-[#3b9f82] text-left mx-2">
                  {factor.value}
                </span>
                <div className="flex-1 h-2.5 bg-white rounded-full overflow-hidden flex items-center justify-start">
                  <div
                    className="h-full bg-[#46b596] rounded-full"
                    style={{ width: `${factor.score * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Negative Factors */}
        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-[#fcdde1] px-4 py-2 border-b border-gray-100">
            <h4 className="text-[#e62e45] font-semibold m-0">Faktor Negatif</h4>
          </div>
          <div className="bg-white p-4">
            {negativeFactors.map((factor, index) => (
              <div
                key={factor.label}
                className={`flex items-center ${index !== negativeFactors.length - 1 ? "mb-4" : ""}`}
              >
                <span className="w-36 text-xs font-semibold text-gray-700">
                  {factor.label}
                </span>
                <span className="w-12 text-xs font-semibold text-[#e62e45] text-left mx-2">
                  {factor.value}
                </span>
                <div className="flex-1 h-2.5 bg-white rounded-full overflow-hidden flex items-center justify-start">
                  <div
                    className="h-full bg-[#fa0525] rounded-full"
                    style={{ width: `${factor.score * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
