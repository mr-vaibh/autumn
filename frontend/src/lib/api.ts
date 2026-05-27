import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import { getAccessToken, getRefreshToken, setTokens, removeTokens } from "./auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (reason: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        processQueue(error, null);
        removeTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });
        const { access, refresh } = response.data;
        setTokens(access, refresh || refreshToken);
        processQueue(null, access);
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        removeTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// API service functions
export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login/", { email, password }, {
      withCredentials: true
    }),
  logout: (refresh: string) =>
    api.post("/auth/logout/", { refresh }),
  requestOTP: (email: string) =>
    api.post("/auth/otp/request/", { email }),
  verifyOTP: (email: string, otp: string) =>
    api.post("/auth/otp/verify/", { email, otp }),
};

export const usersApi = {
  getMe: () => api.get("/users/me/"),
  updateMe: (data: FormData | Record<string, unknown>) =>
    api.patch("/users/me/", data),
  getAll: (params?: Record<string, unknown>) =>
    api.get("/users/", { params }),
  create: (data: Record<string, unknown>) =>
    api.post("/users/", data),
  update: (id: number, data: Record<string, unknown>) =>
    api.patch(`/users/${id}/`, data),
  delete: (id: number) =>
    api.delete(`/users/${id}/`),
};

export const studentsApi = {
  getAll: (params?: Record<string, unknown>) =>
    api.get("/students/", { params }),
  get: (id: number) =>
    api.get(`/students/${id}/`),
  create: (data: Record<string, unknown>) =>
    api.post("/students/", data),
  update: (id: number, data: Record<string, unknown>) =>
    api.patch(`/students/${id}/`, data),
  delete: (id: number) =>
    api.delete(`/students/${id}/`),
  getDocuments: (id: number) =>
    api.get(`/students/${id}/documents/`),
  uploadDocument: (id: number, data: FormData) =>
    api.post(`/students/${id}/documents/`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

export const classesApi = {
  getAll: (params?: Record<string, unknown>) =>
    api.get("/classes/", { params }),
  get: (id: number) =>
    api.get(`/classes/${id}/`),
  create: (data: Record<string, unknown>) =>
    api.post("/classes/", data),
  update: (id: number, data: Record<string, unknown>) =>
    api.patch(`/classes/${id}/`, data),
  delete: (id: number) =>
    api.delete(`/classes/${id}/`),
  getSections: (params?: Record<string, unknown>) =>
    api.get("/classes/sections/", { params }),
  updateSection: (id: number, data: Record<string, unknown>) =>
    api.patch(`/classes/sections/${id}/`, data),
  deleteSection: (id: number) =>
    api.delete(`/classes/sections/${id}/`),
  getAcademicYears: () =>
    api.get("/classes/academic-years/"),
  createAcademicYear: (data: Record<string, unknown>) =>
    api.post("/classes/academic-years/", data),
};

export const timetableApi = {
  getPeriods: (params?: Record<string, unknown>) =>
    api.get("/timetable/periods/", { params }),
  createPeriod: (data: Record<string, unknown>) =>
    api.post("/timetable/periods/", data),
  updatePeriod: (id: number, data: Record<string, unknown>) =>
    api.patch(`/timetable/periods/${id}/`, data),
  deletePeriod: (id: number) =>
    api.delete(`/timetable/periods/${id}/`),
  reorderPeriods: (periods: Array<{ id: number; order: number }>) =>
    api.post("/timetable/periods/reorder/", { periods }),
  getTemplates: () =>
    api.get("/timetable/templates/"),
};

export const sessionsApi = {
  getAll: (params?: Record<string, unknown>) =>
    api.get("/sessions/reports/", { params }),
  get: (id: number) =>
    api.get(`/sessions/reports/${id}/`),
  create: (data: Record<string, unknown>) =>
    api.post("/sessions/reports/", data),
  update: (id: number, data: Record<string, unknown>) =>
    api.patch(`/sessions/reports/${id}/`, data),
};

export const attendanceApi = {
  getStudentAttendance: (params?: Record<string, unknown>) =>
    api.get("/attendance/students/", { params }),
  markAttendance: (data: Record<string, unknown>) =>
    api.post("/attendance/students/", data),
  bulkMark: (data: Record<string, unknown>) =>
    api.post("/attendance/students/bulk-mark/", data),
  getSummary: () =>
    api.get("/attendance/summary/"),
};

export const feesApi = {
  getStructures: () =>
    api.get("/fees/structures/"),
  createStructure: (data: Record<string, unknown>) =>
    api.post("/fees/structures/", data),
  updateStructure: (id: number, data: Record<string, unknown>) =>
    api.patch(`/fees/structures/${id}/`, data),
  deleteStructure: (id: number) =>
    api.delete(`/fees/structures/${id}/`),
  generateFees: (structureId: number, due_date: string) =>
    api.post(`/fees/structures/${structureId}/generate/`, { due_date }),
  getStudentFees: (params?: Record<string, unknown>) =>
    api.get("/fees/student-fees/", { params }),
  createOrder: (student_fee_id: number) =>
    api.post("/fees/payments/create-order/", { student_fee_id }),
  verifyPayment: (data: Record<string, unknown>) =>
    api.post("/fees/payments/verify/", data),
  getPayments: (params?: Record<string, unknown>) =>
    api.get("/fees/payments/", { params }),
};

export const communicationApi = {
  getAnnouncements: (params?: Record<string, unknown>) =>
    api.get("/communication/announcements/", { params }),
  createAnnouncement: (data: Record<string, unknown>) =>
    api.post("/communication/announcements/", data),
  updateAnnouncement: (id: number, data: Record<string, unknown>) =>
    api.patch(`/communication/announcements/${id}/`, data),
  deleteAnnouncement: (id: number) =>
    api.delete(`/communication/announcements/${id}/`),
  getMessages: () =>
    api.get("/communication/messages/"),
  getThreads: () =>
    api.get("/communication/messages/threads/"),
  sendMessage: (data: Record<string, unknown>) =>
    api.post("/communication/messages/", data),
  getNotifications: () =>
    api.get("/communication/notifications/"),
  markAllNotificationsRead: () =>
    api.post("/communication/notifications/mark-all-read/"),
  getUnreadCount: () =>
    api.get("/communication/notifications/unread-count/"),
};

export const reportsApi = {
  getDashboardStats: () =>
    api.get("/reports/dashboard/"),
  getAttendanceReport: (params?: Record<string, unknown>) =>
    api.get("/reports/attendance/", { params }),
  getTherapyProgress: (params?: Record<string, unknown>) =>
    api.get("/reports/therapy-progress/", { params }),
  getClassPerformance: (params?: Record<string, unknown>) =>
    api.get("/reports/class-performance/", { params }),
};
