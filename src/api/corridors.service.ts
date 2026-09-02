import apiClient from './client';

export interface Corridor {
  id: string;
  name: string;
  description?: string;
  geometry: any;
  length_km: number;
  created_at: string;
}

export const corridorsService = {
  async getCorridors(): Promise<Corridor[]> {
    const response = await apiClient.get('/corridors');
    return response.data;
  },

  async getCorridorById(id: string): Promise<Corridor> {
    const response = await apiClient.get(`/corridors/${id}`);
    return response.data;
  },

  async createCorridor(data: Partial<Corridor>): Promise<Corridor> {
    const response = await apiClient.post('/corridors', data);
    return response.data;
  },

  async updateCorridor(id: string, data: Partial<Corridor>): Promise<Corridor> {
    const response = await apiClient.put(`/corridors/${id}`, data);
    return response.data;
  },

  async deleteCorridor(id: string): Promise<void> {
    await apiClient.delete(`/corridors/${id}`);
  },
};
