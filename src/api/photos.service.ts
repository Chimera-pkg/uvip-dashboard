import apiClient from './client';

export interface StreetPhoto {
  id: string;
  photo_url: string;
  latitude: number;
  longitude: number;
  captured_at: string;
  status: string;
  corridor_id?: string;
  mission_id?: string;
}

export interface PhotoUploadData {
  file: File;
  latitude: number;
  longitude: number;
  corridor_id?: string;
  mission_id?: string;
}

export const photosService = {
  async getPhotos(page: number = 1, limit: number = 20): Promise<{ data: StreetPhoto[]; total: number }> {
    const response = await apiClient.get(`/street-photos?page=${page}&limit=${limit}`);
    return response.data;
  },

  async getPhotoById(id: string): Promise<StreetPhoto> {
    const response = await apiClient.get(`/street-photos/${id}`);
    return response.data;
  },

  async uploadPhoto(data: PhotoUploadData): Promise<StreetPhoto> {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('latitude', data.latitude.toString());
    formData.append('longitude', data.longitude.toString());
    if (data.corridor_id) formData.append('corridor_id', data.corridor_id);
    if (data.mission_id) formData.append('mission_id', data.mission_id);

    const response = await apiClient.post('/street-photos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async deletePhoto(id: string): Promise<void> {
    await apiClient.delete(`/street-photos/${id}`);
  },
};
