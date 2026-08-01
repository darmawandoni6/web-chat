import axios from 'axios';
import type { LoginPayload, RegisterPayload, User } from '../types';

export const API_URL = 'http://localhost:4000';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Auth API ─────────────────────────────────────────────
export async function registerApi(payload: RegisterPayload) {
  const res = await api.post<{ user: User; token: string }>('/auth/register', payload);
  return res.data;
}

export async function loginApi(payload: LoginPayload) {
  const res = await api.post<{ user: User; token: string }>('/auth/login', payload);
  return res.data;
}

export async function getMeApi() {
  const res = await api.get<User>('/auth/me');
  return res.data;
}

export async function getUsersApi() {
  const res = await api.get<User[]>('/auth/users');
  return res.data;
}

// ─── Upload API ───────────────────────────────────────────
export async function uploadFileApi(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await api.post<{ fileUrl: string; filename: string; size: number; mimetype: string }>(
    '/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return res.data;
}
