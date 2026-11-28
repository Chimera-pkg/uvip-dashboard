import React, { useRef, useState, useCallback } from "react";
import { SwapOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import { evaluateUviScore, hexToRgba } from "../utils/uvi";

export interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  beforeUvi?: number | string | null;
  afterUvi?: number | string | null;
  metaText?: string | null;
}

function formatUviDisplay(val: number | string) {
  const num = Number(val);
  if (Number.isNaN(num)) return String(val);
  return num > 1 ? (num / 10).toFixed(2) : num.toFixed(2);
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = "Sebelum",
  afterLabel = "Sesudah · Konsep AI",
  beforeUvi,
  afterUvi,
  metaText,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const updatePositionFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return;
    const rawPct = ((clientX - rect.left) / rect.width) * 100;
    const clampedPct = Math.max(0, Math.min(100, rawPct));
    setSliderPos(clampedPct);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    updatePositionFromClientX(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updatePositionFromClientX(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setSliderPos((prev) => Math.max(0, prev - 5));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setSliderPos((prev) => Math.min(100, prev + 5));
    } else if (e.key === "Home") {
      e.preventDefault();
      setSliderPos(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setSliderPos(100);
    }
  };

  const hasBeforeUvi = beforeUvi !== null && beforeUvi !== undefined;
  const hasAfterUvi = afterUvi !== null && afterUvi !== undefined;
  const beforeUviInfo = hasBeforeUvi ? evaluateUviScore(beforeUvi) : null;
  const afterUviInfo = hasAfterUvi ? evaluateUviScore(afterUvi) : null;

  return (
    <div className="space-y-2.5 select-none">
      {/* Top Hint & Meta */}
      <div className="flex items-center justify-between text-xs text-gray-500 px-0.5">
        <span className="inline-flex items-center gap-1.5 font-medium text-gray-600">
          <SwapOutlined className="text-[#00bcd4]" />
          <span>Geser untuk membandingkan</span>
        </span>
        {metaText && (
          <span className="text-[11px] text-gray-400 font-medium truncate max-w-[55%]">
            {metaText}
          </span>
        )}
      </div>

      {/* Interactive Slider Frame */}
      <div
        ref={containerRef}
        role="slider"
        tabIndex={0}
        aria-label="Perbandingan visual sebelum dan sesudah"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(sliderPos)}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
        className="relative w-full h-72 sm:h-96 rounded-2xl overflow-hidden bg-gray-900 border-2 border-[#00bcd4]/30 shadow-sm cursor-ew-resize touch-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00bcd4]"
      >
        {/* Right / Bottom Layer: Sesudah (Hasil Generate AI) */}
        <img
          src={afterImage}
          alt={afterLabel}
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
        />

        {/* Top-Right Badge for Sesudah */}
        <div
          className={`absolute top-3 right-3 z-10 flex flex-col items-end gap-1.5 pointer-events-none transition-opacity duration-200 ${
            sliderPos > 92 ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="bg-white/90 backdrop-blur-xs text-gray-800 text-[11px] px-2.5 py-1 rounded-lg font-semibold shadow-sm border border-gray-200/70">
            {afterLabel}
          </div>
          {afterUviInfo && hasAfterUvi && (
            <div
              className="text-[11px] px-2.5 py-0.5 rounded-md font-bold border backdrop-blur-xs flex items-center gap-1 shadow-sm"
              style={{
                backgroundColor: "rgba(17, 24, 39, 0.85)",
                borderColor: hexToRgba(afterUviInfo.color, 0.45),
              }}
            >
              <span className="text-gray-300 font-semibold">UVI:</span>
              <span style={{ color: afterUviInfo.color }}>
                {formatUviDisplay(afterUvi)}
              </span>
            </div>
          )}
        </div>

        {/* Left / Top Layer: Sebelum (Foto Asli), clipped to sliderPos% */}
        <div
          className={`absolute inset-0 pointer-events-none ${
            isDragging ? "" : "transition-[clip-path] duration-200 ease-out"
          }`}
          style={{
            clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
          }}
        >
          <img
            src={beforeImage}
            alt={beforeLabel}
            draggable={false}
            className="w-full h-full object-cover pointer-events-none select-none"
          />

          {/* Top-Left Badge for Sebelum */}
          <div
            className={`absolute top-3 left-3 flex flex-col items-start gap-1.5 transition-opacity duration-200 ${
              sliderPos < 8 ? "opacity-0" : "opacity-100"
            }`}
          >
            <div className="bg-gray-900/80 backdrop-blur-xs text-white text-[11px] px-2.5 py-1 rounded-lg font-semibold shadow-sm border border-white/15">
              {beforeLabel}
            </div>
            {beforeUviInfo && hasBeforeUvi && (
              <div
                className="text-[11px] px-2.5 py-0.5 rounded-md font-bold border backdrop-blur-xs flex items-center gap-1 shadow-sm"
                style={{
                  backgroundColor: "rgba(17, 24, 39, 0.85)",
                  borderColor: hexToRgba(beforeUviInfo.color, 0.45),
                }}
              >
                <span className="text-gray-300 font-semibold">UVI:</span>
                <span style={{ color: beforeUviInfo.color }}>
                  {formatUviDisplay(beforeUvi)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Vertical Divider Line + Circular Drag Handle */}
        <div
          className={`absolute top-0 bottom-0 z-20 -translate-x-1/2 pointer-events-none ${
            isDragging ? "" : "transition-[left] duration-200 ease-out"
          }`}
          style={{ left: `${sliderPos}%` }}
        >
          <div className="w-0.5 h-full bg-white shadow-[0_0_8px_rgba(0,0,0,0.45)] mx-auto" />
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.28)] border border-gray-200 flex items-center justify-center gap-1 text-gray-700 transition-transform duration-150 ${
              isDragging ? "scale-110 ring-4 ring-[#00bcd4]/25" : ""
            }`}
          >
            <LeftOutlined className="text-[10px]" />
            <RightOutlined className="text-[10px]" />
          </div>
        </div>
      </div>

      {/* Bottom Quick-Action Bar */}
      <div className="flex items-center justify-between text-xs px-0.5 pt-0.5">
        <button
          type="button"
          onClick={() => setSliderPos(100)}
          className={`cursor-pointer bg-transparent border-none p-0 font-medium transition-colors ${
            sliderPos >= 98
              ? "text-[#00bcd4] font-semibold"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          Lihat foto asli
        </button>

        <button
          type="button"
          onClick={() => setSliderPos(50)}
          title="Reset posisi tengah (50:50)"
          className="cursor-pointer bg-transparent border-none px-2 py-0.5 rounded text-gray-400 hover:text-[#00bcd4] hover:bg-cyan-50 transition-colors"
        >
          <SwapOutlined />
        </button>

        <button
          type="button"
          onClick={() => setSliderPos(0)}
          className={`cursor-pointer bg-transparent border-none p-0 font-medium transition-colors ${
            sliderPos <= 2
              ? "text-[#00bcd4] font-semibold"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          Lihat konsep AI
        </button>
      </div>
    </div>
  );
};

export default BeforeAfterSlider;
