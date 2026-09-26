import apiClient from "./client";

export interface Prediction {
    id: string;
    photo_id: string;
    segmentation_id: string;
    model_version: string | null;
    beauty_score: number | null;
    safety_score: number | null;
    comfort_score: number | null;
    uvi_score: number | null;
    gvi_score: number | null;
    inference_time_ms: number | null;
    r2_reference: string | null;
    created_at: string;
}

export interface SegmentationResult {
    id: string;
    photo_id: string;
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
}

export const segmentationResultsService = {
  async getByPhotoId(photoId: string): Promise<SegmentationResult> {
    const response = await apiClient.get(`/segmentation-results/by-photo/${photoId}`);
    return response.data;
  }
};
