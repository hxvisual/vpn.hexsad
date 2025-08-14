export interface User {
  id: string;
  username: string;
  role: 'user' | 'admin';
  status: 'active' | 'blocked';
  createdAt: string;
  updatedAt?: string;
  keys?: VPNKeys;
}

export interface VPNKeys {
  vless?: string;
  shadowsocks?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface CreateUserDto {
  username: string;
  password: string;
  role: 'user' | 'admin';
  status?: 'active' | 'blocked';
  vlessKey?: string;
  shadowsocksKey?: string;
}

export interface UpdateUserDto {
  username?: string;
  password?: string;
  role?: 'user' | 'admin';
  status?: 'active' | 'blocked';
  vlessKey?: string;
  shadowsocksKey?: string;
}

export interface UserWithKeys extends User {
  keys: VPNKeys;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface UserFilters {
  search?: string;
  status?: 'active' | 'blocked' | 'all';
  dateFrom?: string;
  dateTo?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}
