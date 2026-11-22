import apiClient from './client';

export interface User {
  id: string;
  email: string;
  name: string;
  full_name?: string;
  role: string;
  is_active: boolean;
  last_login_at?: string | null;
  created_at: string;
  profile_filename?: string | null;
  profile_file_path?: string | null;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  full_name: string;
  role: string;
}

export interface UpdateProfileRequest {
  name: string;
  email: string;
  role: string;
  is_active: boolean;
}

export interface UpdatePasswordRequest {
  old_password: string;
  new_password: string;
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

  async updateMe(data: UpdateProfileRequest): Promise<User> {
    const response = await apiClient.patch('/users/me', data);
    return response.data;
  },

  async updatePassword(data: UpdatePasswordRequest): Promise<any> {
    const response = await apiClient.patch('/users/me/password', data);
    return response.data;
  },

  async updateAvatar(file: File): Promise<User> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('avatar', file);
    const response = await apiClient.patch('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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
