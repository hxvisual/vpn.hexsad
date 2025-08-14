import { api } from './api';
import {
  LoginCredentials,
  User,
  UserWithKeys,
  CreateUserDto,
  UpdateUserDto,
  VPNKeys,
  PaginationState,
  UserFilters,
} from '../types';

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const { data } = await api.post<{ user: User; token: string }>('/auth/login', credentials);
    return data;
  },

  logout: async () => {
    await api.post('/auth/logout');
  },

  refresh: async () => {
    const { data } = await api.post<{ token: string }>('/auth/refresh');
    return data;
  },

  me: async () => {
    const { data } = await api.get<UserWithKeys>('/auth/me');
    return data;
  },
};

export const usersApi = {
  getUsers: async (filters?: UserFilters, pagination?: Partial<PaginationState>) => {
    const { data } = await api.get<{
      users: User[];
      pagination: PaginationState;
    }>('/users', {
      params: {
        ...filters,
        page: pagination?.page || 1,
        pageSize: pagination?.pageSize || 10,
      },
    });
    return data;
  },

  getUser: async (id: string) => {
    const { data } = await api.get<UserWithKeys>(`/users/${id}`);
    return data;
  },

  createUser: async (userData: CreateUserDto) => {
    const { data } = await api.post<User>('/users', userData);
    return data;
  },

  updateUser: async (id: string, userData: UpdateUserDto) => {
    const { data } = await api.put<User>(`/users/${id}`, userData);
    return data;
  },

  deleteUser: async (id: string) => {
    await api.delete(`/users/${id}`);
  },

  getUserKeys: async (id: string) => {
    const { data } = await api.get<VPNKeys>(`/users/${id}/keys`);
    return data;
  },

  updateUserKeys: async (id: string, keys: VPNKeys) => {
    const { data } = await api.put<VPNKeys>(`/users/${id}/keys`, keys);
    return data;
  },

  generateKeys: async () => {
    const { data } = await api.post<VPNKeys>('/keys/generate');
    return data;
  },
};
