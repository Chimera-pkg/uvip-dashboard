import apiClient from "./client";

export interface VisualEnvironmentIndicator {
  key: string;
  label: string;
  value: number;
}

export interface ProjectObservation {
  project_id: string;
  project_name: string;
  uvi_score: number;
}

export interface ModelReference {
  uvi_reference: number;
  prediction_confidence_pct: number;
  task_title: string;
  task_subtitle: string;
  model_name: string;
  architecture: string;
  publication: string;
  miou_reference_pct: number;
  inference_time_sec: number;
}

export interface VisualQualityReportResponse {
  status: string;
  total_projects: number;
  average_uvi: number;
  analysis_coverage_pct: number;
  observations: {
    highest_project?: ProjectObservation | null;
    lowest_project?: ProjectObservation | null;
  };
  model_reference: ModelReference;
  visual_environment_indicators: VisualEnvironmentIndicator[];
}

export const reportsService = {
  async getVisualQualityReport(
    projectId?: string,
  ): Promise<VisualQualityReportResponse> {
    const params: Record<string, string> = {};
    if (projectId && projectId !== "all") {
      params.project_id = projectId;
    }

    try {
      const response = await apiClient.get<VisualQualityReportResponse>(
        "/project/visual-quality-report",
        { params },
      );
      return response.data;
    } catch (err: any) {
      if (err.response?.status === 404) {
        // Fallback to plural endpoint if backend router differs
        const fallback = await apiClient.get<VisualQualityReportResponse>(
          "/projects/visual-quality-report",
          { params },
        );
        return fallback.data;
      }
      throw err;
    }
  },
};
