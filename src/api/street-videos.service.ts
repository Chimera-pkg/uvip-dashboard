import apiClient from "./client";

export interface StreetVideo {
  id: string;
  project_id: string | null;
  mission_id: string | null;
  uploaded_by: string;
  source: string;
  original_filename: string;
  file_path: string;
  file_size_kb: number;
  latitude: number;
  longitude: number;
  street_name: string | null;
  gps_accuracy_m: number | null;
  compass_azimuth: number | null;
  exif_timestamp: string | null;
  is_manual_capture: boolean;
  is_offline_sync: boolean;
  privacy_masked: boolean;
  processing_status: string;
  error_message: string | null;
  captured_at: string;
  created_at: string;
}

export interface PaginatedStreetVideos {
  total_data: number;
  total_pages: number;
  current_page: number;
  data: StreetVideo[];
}

export const streetVideosService = {
  async getStreetVideos(projectId: string, page = 1, size = 10): Promise<PaginatedStreetVideos> {
    const response = await apiClient.get("/street-videos/", {
      params: { project_id: projectId, page, size },
    });
    return response.data;
  },

  async getStreetVideoById(id: string): Promise<StreetVideo> {
    const response = await apiClient.get(`/street-videos/${id}`);
    return response.data;
  }
};
