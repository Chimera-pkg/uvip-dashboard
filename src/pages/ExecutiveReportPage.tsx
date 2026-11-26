import { useState, useEffect, useCallback } from "react";
import { Select, Button, Skeleton, Result, Empty } from "antd";
import {
  PrinterOutlined,
  ApartmentOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { useProjects } from "../hooks/useProjects";
import {
  reportsService,
  type VisualQualityReportResponse,
} from "../api/reports.service";
import { evaluateUviScore } from "../utils/uvi";

dayjs.locale("id");

// Indicator color mapping matching design
const INDICATOR_COLORS: Record<string, string> = {
  building_visibility_index: "#f97316",
  vegetation_coverage_index: "#22c55e",
  sky_openness_index: "#00b4d8",
  surface_accessibility_index: "#8b5cf6",
  visual_dominance_index: "#f59e0b",
};

// Indicator label mapping (backend key -> Bahasa Indonesia)
const INDICATOR_LABELS: Record<string, string> = {
  building_visibility_index: "Visibilitas Bangunan",
  vegetation_coverage_index: "Tutupan Vegetasi",
  sky_openness_index: "Keterbukaan Langit",
  surface_accessibility_index: "Aksesibilitas Area",
  visual_dominance_index: "Dominasi Visual",
};

export default function ExecutiveReportPage() {
  const { projects, fetchProjects, loading: loadingProjects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [reportData, setReportData] =
    useState<VisualQualityReportResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch projects list on mount
  useEffect(() => {
    fetchProjects(1, 100);
  }, [fetchProjects]);

  // Fetch report data
  const fetchReport = useCallback(async (projectId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportsService.getVisualQualityReport(
        projectId === "all" ? undefined : projectId,
      );
      setReportData(data);
    } catch (err: any) {
      console.error("Gagal memuat Laporan Eksekutif:", err);
      const msg =
        err.response?.data?.detail ||
        err.message ||
        "Gagal memuat Laporan Eksekutif. Silakan coba lagi.";
      setError(msg);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport(selectedProjectId);
  }, [selectedProjectId, fetchReport]);

  const handlePrint = () => {
    window.print();
  };

  const selectedProjectObj = projects.find((p) => p.id === selectedProjectId);
  const uviInfo = evaluateUviScore(reportData?.average_uvi);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 font-sans">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 no-print">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 m-0">
            Laporan Eksekutif
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 m-0 mt-1">
            Ringkasan singkat dari cakupan proyek yang dipilih.
          </p>
        </div>

        <Button
          type="primary"
          icon={<PrinterOutlined />}
          onClick={handlePrint}
          className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl h-10 px-4 font-semibold shadow-xs flex items-center gap-2 self-start sm:self-auto"
        >
          Cetak / Simpan PDF
        </Button>
      </div>

      {/* Filter Selector */}
      <div className="flex items-center gap-3 mb-6 no-print">
        <span className="text-xs sm:text-sm font-semibold text-gray-700">
          Cakupan
        </span>
        <Select
          value={selectedProjectId}
          onChange={(val) => setSelectedProjectId(val)}
          loading={loadingProjects}
          className="w-56 sm:w-64"
          options={[
            { label: "Semua proyek", value: "all" },
            ...projects.map((p) => ({
              label: p.name,
              value: p.id,
            })),
          ]}
        />
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 sm:p-10 space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton.Input active style={{ width: 140, height: 28 }} />
            <Skeleton.Input active style={{ width: 100, height: 20 }} />
          </div>
          <Skeleton.Input active block style={{ height: 36, width: "60%" }} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Skeleton active paragraph={{ rows: 2 }} />
            <Skeleton active paragraph={{ rows: 2 }} />
            <Skeleton active paragraph={{ rows: 2 }} />
          </div>
          <Skeleton active paragraph={{ rows: 3 }} />
          <Skeleton active paragraph={{ rows: 4 }} />
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-8 text-center">
          <Result
            status="warning"
            title="Gagal Memuat Laporan"
            subTitle={error}
            extra={[
              <Button
                key="retry"
                type="primary"
                icon={<ReloadOutlined />}
                onClick={() => fetchReport(selectedProjectId)}
                className="bg-[#00bcd4] hover:bg-[#00acc1] border-none rounded-xl"
              >
                Coba Lagi
              </Button>,
            ]}
          />
        </div>
      ) : reportData ? (
        /* The Report Sheet Card (Printable) */
        <div className="report-sheet bg-white rounded-2xl border border-gray-100 shadow-xs p-6 sm:p-10 text-gray-800 transition-all">
          {/* Sheet Top Meta Header */}
          <div className="flex justify-between items-center pb-4 border-b border-gray-100">
            <span className="font-extrabold text-base sm:text-lg text-[#00bcd4] tracking-tight">
              UrbanLens AI
            </span>
            <span className="text-xs sm:text-sm text-gray-500 font-medium">
              {dayjs().format("DD MMMM YYYY")}
            </span>
          </div>

          {/* Document Title & Subtitle */}
          <div className="mt-6 mb-6">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 m-0 tracking-tight">
              Laporan Kualitas Visual Perkotaan
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1.5 mb-0">
              {selectedProjectObj
                ? `${selectedProjectObj.location || "Lokasi Proyek"} · ${selectedProjectObj.name}`
                : "Kota Malang · 2026-10-01 — 2026-10-07"}
            </p>
          </div>

          {/* 3 Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {/* Card 1: Proyek */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs flex flex-col justify-between">
              <span className="text-xs text-gray-500 font-medium">Proyek</span>
              <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mt-2">
                {reportData.total_projects}
              </span>
            </div>

            {/* Card 2: UVI rata-rata */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs flex flex-col justify-between">
              <span className="text-xs text-gray-500 font-medium">
                UVI rata-rata
              </span>
              <span
                className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2"
                style={{ color: uviInfo.color }}
              >
                {reportData.average_uvi !== null &&
                reportData.average_uvi !== undefined
                  ? reportData.average_uvi.toFixed(2)
                  : "-"}
              </span>
            </div>

            {/* Card 3: Cakupan analisis */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs flex flex-col justify-between">
              <span className="text-xs text-gray-500 font-medium">
                Cakupan analisis
              </span>
              <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mt-2">
                {reportData.analysis_coverage_pct}%
              </span>
            </div>
          </div>

          {/* Section: Ringkasan */}
          <div className="mb-6">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
              Ringkasan
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed m-0">
              Laporan ini menggabungkan foto jalan, indikator komposisi visual,
              dan skor UVI untuk tinjauan proyek.
            </p>
          </div>

          {/* Section: Observasi */}
          <div className="mb-8">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3">
              Observasi
            </h2>
            <ul className="space-y-2.5 text-xs sm:text-sm text-gray-600 pl-4 list-disc m-0">
              {reportData.observations?.highest_project &&
              reportData.observations?.lowest_project ? (
                <li>
                  {reportData.observations.highest_project.project_name} memiliki
                  UVI{" "}
                  {reportData.observations.highest_project.uvi_score?.toFixed(
                    2,
                  ) ?? reportData.observations.highest_project.uvi_score}
                  , dibandingkan dengan{" "}
                  {reportData.observations.lowest_project.uvi_score?.toFixed(
                    2,
                  ) ?? reportData.observations.lowest_project.uvi_score}{" "}
                  untuk {reportData.observations.lowest_project.project_name}.
                </li>
              ) : (
                <li>
                  Skor UVI rata-rata koridor berada pada tingkat{" "}
                  <strong className="text-gray-800">{uviInfo.category}</strong>{" "}
                  ({reportData.average_uvi.toFixed(2)}).
                </li>
              )}
              <li>
                Penjelasan parameter menunjukkan kontribusi positif
                aksesibilitas permukaan dan keterbukaan langit.
              </li>
              <li>
                Cakupan foto tambahan dan pengambilan sampel yang konsisten
                diperlukan sebelum menyimpulkan kondisi seluruh koridor.
              </li>
            </ul>
          </div>

          {/* Section: Referensi model dan prediksi */}
          {reportData.model_reference && (
            <div className="mb-8">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                Referensi model dan prediksi
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mb-3">
                UVI:{" "}
                <strong className="text-gray-800">
                  {reportData.model_reference.uvi_reference?.toFixed(2) ??
                    "0.82"}
                </strong>{" "}
                · Keyakinan prediksi:{" "}
                <strong className="text-gray-800">
                  {reportData.model_reference.prediction_confidence_pct ?? 91}%
                </strong>
                .
              </p>

              {/* Model Info Box */}
              <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <ApartmentOutlined className="text-xl" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm sm:text-base m-0">
                      {reportData.model_reference.task_title ||
                        "Segmentasi Semantik"}
                    </h3>
                    <p className="text-xs text-gray-400 m-0">
                      {reportData.model_reference.task_subtitle ||
                        "Informasi model"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-gray-100 text-xs">
                  <div>
                    <div className="text-gray-400 font-medium mb-1">Model</div>
                    <div className="font-bold text-gray-800 text-sm">
                      {reportData.model_reference.model_name || "SegFormer-B5"}
                    </div>
                    <div className="text-gray-500 text-[11px] mt-0.5">
                      {reportData.model_reference.architecture ||
                        "encoder MiT-B5 + decoder all-MLP"}
                    </div>
                  </div>

                  <div>
                    <div className="text-gray-400 font-medium mb-1">
                      Publikasi
                    </div>
                    <div className="font-bold text-gray-800 text-sm">
                      {reportData.model_reference.publication || "NeurIPS 2021"}
                    </div>
                  </div>

                  <div>
                    <div className="text-gray-400 font-medium mb-1">
                      mIoU
                      <span className="text-[10px] text-gray-400 block font-normal">
                        Skor referensi
                      </span>
                    </div>
                    <div className="font-bold text-[#00bcd4] text-sm">
                      {reportData.model_reference.miou_reference_pct !== null &&
                      reportData.model_reference.miou_reference_pct !== undefined
                        ? `${reportData.model_reference.miou_reference_pct.toFixed(1)}%`
                        : "84.0%"}
                    </div>
                  </div>

                  <div>
                    <div className="text-gray-400 font-medium mb-1">
                      Inferensi
                    </div>
                    <div className="font-bold text-gray-800 text-sm">
                      {reportData.model_reference.inference_time_sec !== null &&
                      reportData.model_reference.inference_time_sec !== undefined
                        ? `${reportData.model_reference.inference_time_sec} detik`
                        : "0.42 detik"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section: Indikator Lingkungan Visual */}
          {reportData.visual_environment_indicators &&
            reportData.visual_environment_indicators.length > 0 && (
              <div className="mb-8">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
                  Indikator Lingkungan Visual
                </h2>
                <div className="space-y-4">
                  {reportData.visual_environment_indicators.map((ind) => {
                    const color =
                      INDICATOR_COLORS[ind.key] || "#00bcd4";
                    const pct = Math.min(100, Math.max(0, ind.value));
                    return (
                      <div key={ind.key} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs sm:text-sm">
                          <span className="font-semibold text-gray-700">
                            {INDICATOR_LABELS[ind.key] || ind.label}
                          </span>
                          <span className="font-bold text-gray-900">
                            {ind.value !== null && ind.value !== undefined
                              ? `${ind.value.toFixed(ind.value % 1 === 0 ? 0 : 1)}%`
                              : "-"}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          {/* Section: Langkah selanjutnya */}
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
              Langkah selanjutnya
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed m-0">
              Review image quality, validate segmentation against human
              annotations, and define the UVI scoring method before using scores
              for decisions. Tinjau lokasi berskor rendah sesuai konteks
              setempat.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-12 text-center">
          <Empty description="Data laporan eksekutif belum tersedia untuk cakupan proyek ini." />
        </div>
      )}

      {/* Print CSS Styles */}
      <style>{`
        @media print {
          .no-print,
          nav,
          aside,
          header,
          .ant-layout-sider,
          .ant-layout-header {
            display: none !important;
          }
          body {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .report-sheet {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
