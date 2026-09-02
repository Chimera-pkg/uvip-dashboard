import apiClient from './client';

export interface DashboardStats {
  total_photos: number;
  total_corridors: number;
  total_missions: number;
  total_users: number;
  avg_scores: {
    beauty: number;
    safety: number;
    comfort: number;
    uvi: number;
  };
  recent_photos: any[];
  photos_by_status: {
    PENDING: number;
    PROCESSING: number;
    COMPLETED: number;
    FAILED: number;
  };
}

export interface KpiData {
  total_surveys: number;
  avg_uvi: number;
  avg_safety: number;
  avg_beauty: number;
  avg_comfort: number;
  gvi: number;
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const response = await apiClient.get('/analytics/dashboard');
    return response.data;
  },

  async getKpiData(): Promise<KpiData> {
    const response = await apiClient.get('/analytics/kpi');
    return response.data;
  },

  async getTrend(metric: string, period: string = '30d'): Promise<any> {
    const response = await apiClient.get(`/analytics/trend?metric=${metric}&period=${period}`);
    return response.data;
  },
};
