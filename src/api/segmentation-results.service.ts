import apiClient from "./client";

export interface LLMGenerateTarget {
  perception_prediction?: {
    beauty_score?: number | null;
    safety_score?: number | null;
    comfort_score?: number | null;
    uvi_score?: number | null;
  };
  segmentation_results?: {
    green_coverage_pct?: number | null;
    building_coverage_pct?: number | null;
    walkability_ratio?: number | null;
    visual_clutter_index?: number | null;
    sky_visibility_pct?: number | null;
  };
}

export interface LLMGenerateResponse {
  generated_image_url?: string | null;
  generated_image_urls?: string[];
  generated_paths?: string[];
  raw_image_url?: string | null;
  photo_path?: string | null;
  target?: LLMGenerateTarget;
  suggestions?: string[];
  prompt_image?: string;
  revised_prompt?: string;
  image_model?: string;
  size?: string;
  count?: number;
  elapsed_ms?: number;
  usage?: any;
}

export interface Prediction {
  id: string;
  photo_id?: string;
  video_id?: string;
  segmentation_id?: string;
  model_version?: string | null;
  beauty_score?: number | null;
  safety_score?: number | null;
  comfort_score?: number | null;
  uvi_score?: number | null;
  gvi_score?: number | null;
  inference_time_ms?: number | null;
  r2_reference?: string | null;
  created_at?: string;
  llm_generate_response?: LLMGenerateResponse | null;
}

export interface ProjectInfo {
  id: string;
  name: string;
  location?: string | null;
  description?: string | null;
  created_by?: string;
  last_opened_at?: string | null;
  created_at?: string;
}

export interface LLMAdviceProblem {
  area: string;
  temuan: string;
  bukti_angka: string;
  tingkat: string;
}

export interface LLMAdviceRecommendation {
  peran: string;
  tindakan: string;
  standar?: string;
  dampak: string;
  prioritas: number;
}

export interface LLMAdviceContent {
  diagnosis?: string;
  masalah?: LLMAdviceProblem[];
  rekomendasi?: LLMAdviceRecommendation[];
  prompt_gambar?: string;
  before_after?: string;
  caveat?: string;
}

export interface LLMAdviceResponse {
  id?: string;
  object?: string;
  created?: number;
  model?: string;
  requested_model?: string;
  choices?: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  advice?: LLMAdviceContent;
  answer?: string;
  context?: any;
  usage?: any;
}

export interface SegmentationResult {
  id: string;
  photo_id: string;
  latitude?: number | null;
  longitude?: number | null;
  street_name?: string | null;
  model_name: string;
  vegetation_pct: number | null;
  building_pct: number | null;
  road_pct: number | null;
  sidewalk_pct: number | null;
  sky_pct: number | null;
  signage_pct: number | null;
  vehicle_pct: number | null;
  pedestrian_pct: number | null;
  street_furniture_pct: number | null;
  traffic_sign_pct: number | null;
  other: number | null;
  green_coverage_pct: number | null;
  building_coverage_pct: number | null;
  sky_visibility_pct: number | null;
  walkability_ratio: number | null;
  visual_clutter_index: number | null;
  mask_file_path: string | null;
  segmentation_url: string | null;
  privacy_masked_url: string | null;
  segmentation_overlay_url: string | null;
  inference_time_ms: number | null;
  created_at: string;
  prediction: Prediction | null;
  project?: ProjectInfo | null;
  llm_advice_response?: LLMAdviceResponse | null;
}

export const segmentationResultsService = {
  async getByPhotoId(photoId: string): Promise<SegmentationResult> {
    const response = await apiClient.get(`/segmentation-results/by-photo/${photoId}`);
    return response.data;
  }
};
