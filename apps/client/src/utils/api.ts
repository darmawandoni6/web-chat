import axios from "axios";
import type { Group, User } from "../types";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
export const MAX_FILE_SIZE_MB = parseInt(import.meta.env.VITE_MAX_FILE_SIZE_MB || "5", 10);
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;



export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      console.warn("⚠️ Token expired or invalid. Clearing session.");
      localStorage.removeItem("token");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

// ─── Auth API ─────────────────────────────────────────────
export async function guestLoginApi(username?: string) {
  const res = await api.post<{ user: User; token: string }>("/auth/guest", {
    username,
  });
  return res.data;
}

export async function updateProfileApi(username: string) {
  const res = await api.patch<User>("/auth/profile", { username });
  return res.data;
}

export async function logoutApi() {
  const res = await api.post<{ message: string }>("/auth/logout");
  return res.data;
}


export async function getMeApi() {
  const res = await api.get<User>("/auth/me");
  return res.data;
}



export async function getUsersApi() {
  const res = await api.get<User[]>("/auth/users");
  return res.data;
}

export async function getGroupsApi() {
  const res = await api.get<Group[]>("/auth/groups");
  return res.data;
}

// ─── Upload API ───────────────────────────────────────────
export async function uploadFileApi(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post<{
    fileUrl: string;
    filename: string;
    size: number;
    mimetype: string;
  }>("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}
