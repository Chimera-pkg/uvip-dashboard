import apiClient from './client';

export type UserRole = 'admin' | 'surveyor' | 'planner' | 'officer' | string;

export const USER_ROLE_OPTIONS: Array<{ value: UserRole; label: string }> = [
  { value: 'admin', label: 'Admin' },
  { value: 'surveyor', label: 'Surveyor' },
  { value: 'planner', label: 'Planner' },
  { value: 'officer', label: 'Officer' },
];

export interface User {
  id: string;
  email: string;
  name: string;
  full_name?: string;
  role: UserRole;
  is_active: boolean;
  last_login_at?: string | null;
  created_at: string;
  profile_filename?: string | null;
  profile_file_path?: string | null;
}

export interface PaginatedUsers {
  total_data: number;
  total_pages: number;
  current_page: number;
  data: User[];
}

export interface GetUsersParams {
  page?: number;
  size?: number;
  search?: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name?: string;
  full_name?: string;
  role: UserRole;
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
  async getUsers(params: GetUsersParams = {}): Promise<PaginatedUsers> {
    const queryParams: Record<string, string | number> = {
      page: params.page ?? 1,
      size: params.size ?? 10,
    };
    if (params.search && params.search.trim()) {
      queryParams.search = params.search.trim();
    }
    const response = await apiClient.get('/users/', { params: queryParams });
    if (Array.isArray(response.data)) {
      return {
        total_data: response.data.length,
        total_pages: 1,
        current_page: 1,
        data: response.data,
      };
    }
    return response.data;
  },

  async getUserById(id: string): Promise<User> {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  async createUser(data: CreateUserRequest): Promise<User> {
    const payload = {
      name: (data.name ?? data.full_name ?? '').trim(),
      email: data.email.trim(),
      password: data.password,
      role: data.role,
    };
    const response = await apiClient.post('/auth/register', payload);
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

  async updatePassword(data: UpdatePasswordRequest): Promise<unknown> {
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
