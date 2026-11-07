import apiClient from "./client";
import type {
  Prediction,
  ProjectInfo,
  SegmentationResult,
  LLMAdviceResponse,
} from "./segmentation-results.service";

export type {
  Prediction,
  ProjectInfo,
  LLMAdviceResponse,
};

export interface VideoSegmentationResult {
  id: string;
  photo_id?: string;
  video_id?: string;
  latitude?: number | null;
  longitude?: number | null;
  street_name?: string | null;
  model_name?: string;
  video_url?: string;
  segmentation?: Partial<SegmentationResult> | null;
  vegetation_pct?: number | null;
  building_pct?: number | null;
  road_pct?: number | null;
  sidewalk_pct?: number | null;
  sky_pct?: number | null;
  signage_pct?: number | null;
  vehicle_pct?: number | null;
  pedestrian_pct?: number | null;
  street_furniture_pct?: number | null;
  traffic_sign_pct?: number | null;
  other?: number | null;
  green_coverage_pct?: number | null;
  building_coverage_pct?: number | null;
  sky_visibility_pct?: number | null;
  walkability_ratio?: number | null;
  visual_clutter_index?: number | null;
  mask_file_path?: string | null;
  segmentation_url?: string | null;
  privacy_masked_url?: string | null;
  segmentation_overlay_url?: string | null;
  inference_time_ms?: number | null;
  created_at?: string;
  prediction?: Prediction | null;
  project?: ProjectInfo | null;
  llm_advice_response?: LLMAdviceResponse | null;
}

export const videoSegmentationResultsService = {
  async getByVideoId(videoId: string): Promise<VideoSegmentationResult> {
    const response = await apiClient.get(`/video-output-segmentations/by-photo/${videoId}`);
    return response.data;
  }
};
