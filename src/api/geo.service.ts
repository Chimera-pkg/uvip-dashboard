import apiClient from './client';

export interface GeoFeature {
  type: string;
  geometry: {
    type: string;
    coordinates: any;
  };
  properties: any;
}

export interface GeoCollection {
  type: string;
  features: GeoFeature[];
}

export const geoService = {
  async getCorridors(): Promise<GeoCollection> {
    const response = await apiClient.get('/geo/corridors');
    return response.data;
  },

  async getSurveyPoints(corridorId?: string, bbox?: string): Promise<GeoCollection> {
    let url = '/geo/survey-points';
    const params = new URLSearchParams();
    if (corridorId) params.append('corridor_id', corridorId);
    if (bbox) params.append('bbox', bbox);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await apiClient.get(url);
    return response.data;
  },

  async getHeatmap(metric: string = 'uvi', resolution: string = '100m'): Promise<any> {
    const response = await apiClient.get(`/geo/heatmap?metric=${metric}&resolution=${resolution}`);
    return response.data;
  },
};
