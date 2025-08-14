import axios, { AxiosError, AxiosInstance } from 'axios';
import { tokenManager } from '../utils/auth';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class ApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = tokenManager.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          tokenManager.removeToken();
          window.location.href = '/login';
        }
        
        if (error.response?.status === 403) {
          console.error('Недостаточно прав доступа');
        }

        // Retry logic for network errors
        if (!error.response && error.config && !error.config.headers?.['X-Retry']) {
          // Create new headers object properly for Axios
          if (!error.config.headers) {
            error.config.headers = {} as any;
          }
          error.config.headers['X-Retry'] = 'true';
          return this.axiosInstance.request(error.config);
        }

        return Promise.reject(error);
      }
    );
  }

  get instance(): AxiosInstance {
    return this.axiosInstance;
  }
}

export const apiService = new ApiService();
export const api = apiService.instance;
