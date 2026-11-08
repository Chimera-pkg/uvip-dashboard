import { useState, useEffect, useMemo, useCallback } from "react";
import { Button, Checkbox, Select, message } from "antd";
import {
  ExportOutlined,
  ReloadOutlined,
  CompassOutlined,
  FolderOutlined,
} from "@ant-design/icons";
import UviHeatmapMap from "../components/charts/UviHeatmapMap";
import {
  streetPhotosService,
  type StreetPhotoLocation,
} from "../api/street-photos.service";
import { useProjects } from "../hooks/useProjects";
import type { PositionedLocationItem } from "../components/charts/MapView";

export default function UviHeatmapPage() {
  const [photoLocations, setPhotoLocations] = useState<StreetPhotoLocation[]>(
    [],
  );
  const [loadingLocations, setLoadingLocations] = useState<boolean>(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );

  // Layer toggles
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [showPoints, setShowPoints] = useState<boolean>(true);

  // Reset view trigger counter
  const [resetTrigger, setResetTrigger] = useState<number>(0);

  // Visible points inside current viewport
  const [visibleLocations, setVisibleLocations] = useState<
    PositionedLocationItem[]
  >([]);

  // Project selector options from hook
  const { projects, fetchProjects, loading: loadingProjects } = useProjects();

  useEffect(() => {
    fetchProjects(1, 100);
  }, [fetchProjects]);

  const fetchLocations = useCallback(async () => {
    try {
      setLoadingLocations(true);
      const locations =
        await streetPhotosService.getLocations(selectedProjectId);
      setPhotoLocations(locations);
    } catch (error) {
      console.error("Failed to fetch street photo locations:", error);
      message.error("Gagal memuat data lokasi foto.");
    } finally {
      setLoadingLocations(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  // Handle Viewport Changes
  const handleViewportChange = useCallback(
    (visible: PositionedLocationItem[]) => {
      setVisibleLocations(visible);
    },
    [],
  );

  // Calculate visible metrics for the 3 cards below the map
  const { visibleCount, maxUvi, minUvi } = useMemo(() => {
    // If visibleLocations is empty and we are still loading, fallback to 0
    const count = visibleLocations.length;
    const scores = visibleLocations
      .map((item) => item.uviScore)
      .filter((s): s is number => s !== null && s !== undefined && !isNaN(s));

    if (scores.length === 0) {
      return {
        visibleCount: count,
        maxUvi: "-",
        minUvi: "-",
      };
    }

    const max = Math.max(...scores).toFixed(2);
    const min = Math.min(...scores).toFixed(2);

    return {
      visibleCount: count,
      maxUvi: max,
      minUvi: min,
    };
  }, [visibleLocations]);

  // Handle Tampilan Awal
  const handleResetView = () => {
    setResetTrigger((prev) => prev + 1);
  };

  // Handle Muat Ulang
  const handleReload = () => {
    fetchLocations();
    message.info("Memperbarui data peta...");
  };

  // Handle Export Lokasi
  const handleExport = () => {
    const listToExport =
      visibleLocations.length > 0 ? visibleLocations : photoLocations;

    if (!listToExport || listToExport.length === 0) {
      message.warning("Tidak ada data lokasi untuk diekspor.");
      return;
    }

    try {
      const csvHeader =
        "ID,Nama File,Latitude,Longitude,Skor UVI,Kategori UVI\r\n";
      const csvRows = listToExport.map((item) => {
        const id = item.id || "";
        const name = `"${(item.filename || item.original_filename || "Photo").replace(/"/g, '""')}"`;
        const lat = item.lat ?? item.latitude ?? "";
        const lng = item.lng ?? item.longitude ?? "";
        const uvi =
          item.uviScore !== null && item.uviScore !== undefined
            ? Number(item.uviScore).toFixed(4)
            : (item.uvi_score ?? "");
        const category = item.uviInfo?.category || "";

        return `${id},${name},${lat},${lng},${uvi},${category}`;
      });

      const blob = new Blob([csvHeader + csvRows.join("\r\n")], {
        type: "text/csv;charset=utf-8;",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `peta_panas_uvi_lokasi_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      message.success("Berhasil mengekspor data lokasi!");
    } catch (err) {
      console.error("Export error:", err);
      message.error("Gagal mengekspor data lokasi.");
    }
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Peta Panas UVI
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Jelajahi nilai UVI berdasarkan koordinat foto. Geser atau perbesar
            peta untuk melihat area lain.
          </p>
          <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
            Klik titik untuk melihat foto dan nilai UVI. Area berwarna merupakan
            visualisasi lokal, bukan prediksi untuk lokasi yang belum disurvei.
          </p>
        </div>

        <div className="shrink-0">
          <Button
            type="default"
            icon={<ExportOutlined />}
            onClick={handleExport}
            className="rounded-lg font-medium text-slate-700 shadow-xs hover:border-blue-500 hover:text-blue-600 transition-colors h-9 px-4"
          >
            Ekspor Lokasi
          </Button>
        </div>
      </div>

      {/* Main Map Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Controls Bar */}
        <div className="p-4 sm:px-5 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            {/* Heatmap UVI Checkbox */}
            <Checkbox
              checked={showHeatmap}
              onChange={(e) => setShowHeatmap(e.target.checked)}
              className="font-medium text-slate-700 select-none text-xs sm:text-sm"
            >
              Heatmap UVI
            </Checkbox>

            {/* Titik foto Checkbox */}
            <Checkbox
              checked={showPoints}
              onChange={(e) => setShowPoints(e.target.checked)}
              className="font-medium text-slate-700 select-none text-xs sm:text-sm"
            >
              Titik foto
            </Checkbox>

            {/* Tampilan awal Button */}
            <Button
              size="middle"
              onClick={handleResetView}
              icon={<CompassOutlined className="text-slate-400" />}
              className="rounded-lg text-xs font-medium text-slate-700 hover:text-blue-600 hover:border-blue-400"
            >
              Tampilan awal
            </Button>

            {/* Muat ulang Button */}
            <Button
              size="middle"
              onClick={handleReload}
              loading={loadingLocations}
              icon={<ReloadOutlined className="text-slate-400" />}
              className="rounded-lg text-xs font-medium text-slate-700 hover:text-blue-600 hover:border-blue-400"
            >
              Muat ulang
            </Button>
          </div>

          {/* Project Selector (matching Dashboard API filter capability) */}
          {projects && projects.length > 0 && (
            <div className="flex items-center gap-2">
              <FolderOutlined className="text-slate-400 text-xs hidden sm:inline" />
              <Select
                size="middle"
                placeholder="Semua Project"
                allowClear
                value={selectedProjectId || undefined}
                onChange={(val) => setSelectedProjectId(val ?? null)}
                options={[
                  { label: "Semua Project", value: "" },
                  ...projects.map((p) => ({ label: p.name, value: p.id })),
                ]}
                loading={loadingProjects}
                className="w-44 text-xs"
              />
            </div>
          )}
        </div>

        {/* Sub-bar: Area peta saat ini */}
        <div className="px-5 py-2.5 text-xs text-slate-500 font-medium bg-slate-50/70 border-b border-gray-100">
          Area peta saat ini
        </div>

        {/* Map Visualization */}
        <UviHeatmapMap
          height={560}
          locations={photoLocations}
          loading={loadingLocations}
          showHeatmap={showHeatmap}
          showPoints={showPoints}
          resetTrigger={resetTrigger}
          onViewportChange={handleViewportChange}
        />

        {/* Color Spectrum Legend */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 px-5 py-3.5 bg-white border-t border-gray-100">
          {/* Gradient Scale */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
              UVI Rendah
            </span>

            <div className="flex-1 md:w-80 flex flex-col gap-1">
              <div
                className="h-2 rounded-full w-full"
                style={{
                  background:
                    "linear-gradient(90deg, #ef4444 0%, #f97316 25%, #eab308 50%, #84cc16 75%, #16a34a 100%)",
                }}
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>0.0</span>
                <span>0.25</span>
                <span>0.50</span>
                <span>0.75</span>
                <span>1.0</span>
              </div>
            </div>

            <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
              UVI Tinggi
            </span>
          </div>

          {/* Legend Description */}
          <div className="text-[11px] text-slate-500 max-w-md md:text-right leading-relaxed">
            Warna: rata-rata lokal UVI, bukan kepadatan foto. Area tanpa data
            tidak diwarnai.
          </div>
        </div>
      </div>

      {/* 3 Metric Cards Under Map */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Titik pada area peta */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs hover:shadow-sm transition-shadow">
          <div className="text-xs sm:text-sm font-medium text-slate-500 mb-2">
            Titik pada area peta
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {visibleCount}
          </div>
        </div>

        {/* Card 2: UVI tertinggi pada area peta */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs hover:shadow-sm transition-shadow">
          <div className="text-xs sm:text-sm font-medium text-slate-500 mb-2">
            UVI tertinggi pada area peta
          </div>
          <div className="text-3xl font-extrabold text-[#16a34a] tracking-tight">
            {maxUvi}
          </div>
        </div>

        {/* Card 3: UVI terendah pada area peta */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs hover:shadow-sm transition-shadow">
          <div className="text-xs sm:text-sm font-medium text-slate-500 mb-2">
            UVI terendah pada area peta
          </div>
          <div className="text-3xl font-extrabold text-[#ef4444] tracking-tight">
            {minUvi}
          </div>
        </div>
      </div>
    </div>
  );
}
