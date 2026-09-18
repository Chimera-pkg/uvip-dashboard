import apiClient from "./client";

export interface StreetPhoto {
  id: string;
  project_id: string;
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

export interface PaginatedStreetPhotos {
  total_data: number;
  total_pages: number;
  current_page: number;
  data: StreetPhoto[];
}

export interface StreetPhotoRequest {
  project_id: string;
  file?: File; // File object from input
  source: string;
  latitude: number;
  longitude: number;
  captured_at: string;
  street_name?: string;
  mission_id?: string;
  gps_accuracy_m?: number;
  compass_azimuth?: number;
  exif_timestamp?: string;
  is_manual_capture?: boolean;
  is_offline_sync?: boolean;
}

export const streetPhotosService = {
  async getStreetPhotos(projectId: string, page = 1, size = 10): Promise<PaginatedStreetPhotos> {
    const response = await apiClient.get("/street-photos/", {
      params: { project_id: projectId, page, size },
    });
    return response.data;
  },

  async getStreetPhotoById(id: string): Promise<StreetPhoto> {
    const response = await apiClient.get(`/street-photos/${id}`);
    return response.data;
  },

  async createStreetPhoto(data: StreetPhotoRequest): Promise<StreetPhoto> {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === "boolean") {
          formData.append(key, value ? "true" : "false");
        } else if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      }
    });

    const response = await apiClient.post("/street-photos/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  async updateStreetPhoto(id: string, data: StreetPhotoRequest): Promise<StreetPhoto> {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === "boolean") {
          formData.append(key, value ? "true" : "false");
        } else if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      }
    });

    const response = await apiClient.put(`/street-photos/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  async deleteStreetPhoto(id: string): Promise<void> {
    await apiClient.delete(`/street-photos/${id}`);
  },
};
