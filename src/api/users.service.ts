import apiClient from './client';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  full_name: string;
  role: string;
}

export const usersService = {
  async getUsers(): Promise<User[]> {
    const response = await apiClient.get('/users');
    return response.data;
  },

  async getUserById(id: string): Promise<User> {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  async createUser(data: CreateUserRequest): Promise<User> {
    const response = await apiClient.post('/users', data);
    return response.data;
  },

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const response = await apiClient.put(`/users/${id}`, data);
    return response.data;
  },

  async deactivateUser(id: string): Promise<User> {
    const response = await apiClient.patch(`/users/${id}/deactivate`);
    return response.data;
  },

  async activateUser(id: string): Promise<User> {
    const response = await apiClient.patch(`/users/${id}/activate`);
    return response.data;
  },

  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },
};
