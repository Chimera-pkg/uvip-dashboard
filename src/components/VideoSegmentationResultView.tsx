import React, { useEffect } from "react";
import { Button, Skeleton, Result } from "antd";
import { LeftOutlined, PlusCircleFilled, MinusCircleFilled, DownloadOutlined } from "@ant-design/icons";
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
  const p = data.prediction;
  const seg = data.segmentation || {};

  const segmentationIcons = [
    { label: "Building", value: seg.building_pct, color: "#f97316", isPct: true },
    { label: "Vegetation", value: seg.vegetation_pct, color: "#22c55e", isPct: true },
    { label: "Sky", value: seg.sky_pct, color: "#3b82f6", isPct: true },
    { label: "Ground", value: seg.visual_clutter_index, color: "#a855f7", isPct: false },
    { label: "Heritage", value: seg.building_pct, color: "#ec4899", isPct: true },
  ];

  const envIndicators = [
    { label: "Building Visibility Index", value: seg.building_pct, display: seg.building_pct != null ? `${seg.building_pct.toFixed(0)}%` : "-" },
    { label: "Vegetation Coverage Index", value: seg.vegetation_pct, display: seg.vegetation_pct != null ? `${seg.vegetation_pct.toFixed(1)}%` : "-" },
    { label: "Sky Openness Index", value: seg.sky_pct, display: seg.sky_pct != null ? `${seg.sky_pct.toFixed(0)}%` : "-" },
    { label: "Ground Accessibility Index", value: seg.visual_clutter_index, display: seg.visual_clutter_index != null ? `${seg.visual_clutter_index.toFixed(0)} / 100` : "-" },
    { label: "Heritage Dominance Index", value: seg.building_pct, display: seg.building_pct != null ? `${seg.building_pct.toFixed(0)} / 100` : "-" },
  ];

  const positiveFactors = [
    {
      label: "Cakupan Vegetasi",
      value:
        seg.green_coverage_pct != null
          ? `+${(seg.green_coverage_pct / 100).toFixed(2)}`
          : "-",
    },
    {
      label: "Lebar Trotoar",
      value:
        seg.sidewalk_pct != null ? `+${seg.sidewalk_pct.toFixed(2)}` : "-",
    },
    {
      label: "Keterbukaan Langit",
      value:
        seg.sky_visibility_pct != null
          ? `+${(seg.sky_visibility_pct / 100).toFixed(2)}`
          : "-",
    },
  ];

  const negativeFactors = [
    {
      label: "Kepadatan Reklame",
      value:
        seg.signage_pct != null
          ? `-${(seg.signage_pct / 100).toFixed(2)}`
          : seg.visual_clutter_index != null
            ? `-${seg.visual_clutter_index.toFixed(2)}`
            : "-",
    },
    {
      label: "Kepadatan Kendaraan",
      value:
        seg.vehicle_pct != null
          ? `-${(seg.vehicle_pct / 100).toFixed(2)}`
          : "-",
    },
    {
      label: "Bangunan Tinggi",
      value:
        seg.building_coverage_pct != null
          ? `-${(seg.building_coverage_pct / 100).toFixed(2)}`
          : "-",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl relative">
      <div className="flex items-center gap-2 mb-6 cursor-pointer text-gray-500 hover:text-gray-800 transition-colors w-fit" onClick={onBack}>
        <LeftOutlined />
        <span className="font-medium text-sm">Back</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Left Column: AI Segmentation */}
        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800 m-0">AI Segmentation</h2>
            {videoUrl && (
              <Button
                icon={<DownloadOutlined />}
                size="small"
                href={videoUrl}
                target="_blank"
                download
              >
                Download
              </Button>
            )}
          </div>
          <div className="relative rounded-xl overflow-hidden flex-1 min-h-75 w-full bg-black">
            {videoUrl ? (
              <video
                src={videoUrl}
                controls
                autoPlay
                loop
                muted
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 text-gray-400">Video not available</div>
            )}
          </div>
          
          <div className="flex justify-between items-center mt-6 px-2">
            {segmentationIcons.map((icon) => (
              <div key={icon.label} className="flex flex-col items-center">
                <div 
                  className="w-6 h-6 rounded mb-2" 
                  style={{ backgroundColor: icon.color }}
                ></div>
                <div className="text-[10px] text-gray-500 font-semibold mb-1">{icon.label}</div>
                <div className="text-xs font-bold text-gray-800">
                  {icon.value != null ? (icon.isPct ? `${icon.value.toFixed(1)}%` : icon.value.toFixed(0)) : "-"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Urban Visual Index */}
        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Urban Visual Index</h2>
          
          <div className="bg-[#f2fbf5] border border-[#e5f6eb] rounded-xl p-6 text-center mb-6">
            <div className="text-5xl font-bold text-[#20a161] mb-1">
              {p?.uvi_score?.toFixed(2) || "-"} <span className="text-2xl text-[#6fc999] font-medium">/ 1</span>
            </div>
            <div className="text-xs text-[#419468] font-medium">Model prediction</div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="border border-gray-100 rounded-xl p-4 text-center shadow-sm">
              <div className="text-xs text-gray-500 mb-1">Safety</div>
              <div className="text-xl font-bold text-gray-800">
                {p?.safety_score?.toFixed(1) || "-"} <span className="text-xs text-gray-400 font-normal">/ 10</span>
              </div>
            </div>
            <div className="border border-gray-100 rounded-xl p-4 text-center shadow-sm">
              <div className="text-xs text-gray-500 mb-1">Beauty</div>
              <div className="text-xl font-bold text-gray-800">
                {p?.beauty_score?.toFixed(1) || "-"} <span className="text-xs text-gray-400 font-normal">/ 10</span>
              </div>
            </div>
            <div className="border border-gray-100 rounded-xl p-4 text-center shadow-sm">
              <div className="text-xs text-gray-500 mb-1">Comfort</div>
              <div className="text-xl font-bold text-gray-800">
                {p?.comfort_score?.toFixed(1) || "-"} <span className="text-xs text-gray-400 font-normal">/ 10</span>
              </div>
            </div>
          </div>

          <h3 className="text-sm font-bold text-gray-800 mb-4">Visual Environment Indicators</h3>
          <div className="space-y-4">
            {envIndicators.map((ind) => (
              <div key={ind.label}>
                <div className="flex justify-between text-xs font-semibold mb-2 text-gray-700">
                  <span>{ind.label}</span>
                  <span>{ind.display}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ width: `${ind.value || 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Column: Faktor Pengaruh */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-1">Faktor Pengaruh terhadap UVI</h2>
        <div className="text-xs text-gray-500 mb-6">SHAP · Contribution to model prediction</div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Positive Factors */}
          <div className="border border-green-100 bg-green-50/30 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4 text-green-600 font-semibold text-sm">
              <PlusCircleFilled /> Faktor Pengaruh Positif
            </div>
            <div className="space-y-4">
              {positiveFactors.map((factor) => (
                <div key={factor.label} className="flex justify-between items-center text-sm">
                  <span className="text-gray-700">{factor.label}</span>
                  <span className="font-bold text-green-600">{factor.value}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Negative Factors */}
          <div className="border border-red-100 bg-red-50/30 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4 text-red-600 font-semibold text-sm">
              <MinusCircleFilled /> Faktor Pengaruh Negatif
            </div>
            <div className="space-y-4">
              {negativeFactors.map((factor) => (
                <div key={factor.label} className="flex justify-between items-center text-sm">
                  <span className="text-gray-700">{factor.label}</span>
                  <span className="font-bold text-red-600">{factor.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
