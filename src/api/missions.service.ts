import apiClient from './client';

export interface SurveyMission {
  id: string;
  name: string;
  description?: string;
  corridor_id: string;
  status: string;
  target_photo_count: number;
  created_at: string;
  completed_at?: string;
}

export interface MissionAssignment {
  id: string;
  mission_id: string;
  user_id: string;
  assigned_at: string;
}

export const missionsService = {
  async getMissions(): Promise<SurveyMission[]> {
    const response = await apiClient.get('/survey-missions');
    return response.data;
  },

  async getMissionById(id: string): Promise<SurveyMission> {
    const response = await apiClient.get(`/survey-missions/${id}`);
    return response.data;
  },

  async createMission(data: Partial<SurveyMission>): Promise<SurveyMission> {
    const response = await apiClient.post('/survey-missions', data);
    return response.data;
  },

  async updateMission(id: string, data: Partial<SurveyMission>): Promise<SurveyMission> {
    const response = await apiClient.put(`/survey-missions/${id}`, data);
    return response.data;
  },

  async deleteMission(id: string): Promise<void> {
    await apiClient.delete(`/survey-missions/${id}`);
  },

  async completeMission(id: string): Promise<SurveyMission> {
    const response = await apiClient.patch(`/survey-missions/${id}/complete`);
    return response.data;
  },

  async getAssignments(missionId?: string): Promise<MissionAssignment[]> {
    const url = missionId ? `/mission-assignments?mission_id=${missionId}` : '/mission-assignments';
    const response = await apiClient.get(url);
    return response.data;
  },

  async assignUser(missionId: string, userId: string): Promise<MissionAssignment> {
    const response = await apiClient.post('/mission-assignments', {
      mission_id: missionId,
      user_id: userId,
    });
    return response.data;
  },
};
