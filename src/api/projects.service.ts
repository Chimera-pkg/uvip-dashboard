import apiClient from "./client";

export interface Project {
  id: string;
  name: string;
  location: string;
  description: string;
  created_by: string;
  last_opened_at: string | null;
  created_at: string;
  photo_count: number;
  video_count: number;
  beauty_score: number;
  safety_score: number;
  comfort_score: number;
  uvi_score: number;
}

export interface ProjectRequest {
  name: string;
  location: string;
  description: string;
}

export const projectsService = {
  async getProjects(): Promise<Project[]> {
    const response = await apiClient.get("/projects/");
    return response.data;
  },

  async getProjectById(id: string): Promise<Project> {
    const response = await apiClient.get(`/projects/${id}`);
    return response.data;
  },

  async createProject(data: ProjectRequest): Promise<Project> {
    const response = await apiClient.post("/projects/", data);
    return response.data;
  },

  async updateProject(id: string, data: ProjectRequest): Promise<Project> {
    const response = await apiClient.put(`/projects/${id}`, data);
    return response.data;
  },

  async deleteProject(id: string): Promise<void> {
    await apiClient.delete(`/projects/${id}`);
  },
};
