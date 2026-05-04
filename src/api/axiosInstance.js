import axios from "axios";
import { BASE_URL } from "@env";
import { getSession, loadSessionFromStorage, clearSession } from "./authSession";

const normalizeApiBaseUrl = (value) => {
  const trimmed = typeof value === "string" && value.trim() ? value.trim().replace(/\/+$/, "") : "";
  if (!trimmed) return "https://vivahjeevan.com";

  // Guard against POST-to-GET redirects caused by accidental http:// production URLs.
  return trimmed.replace(/^http:\/\/((?:www\.)?vivahjeevan\.com)(?=\/|$)/i, "https://$1");
};

// Fallback so app never crashes if .env wasn't inlined (e.g. stale build)
const API_BASE = normalizeApiBaseUrl(BASE_URL);

const axiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(async (config) => {
  const isAuthEndpoint = config.url && (
    config.url.includes("/api/auth/login") ||
    config.url.includes("/api/profiles/register") ||
    config.url.includes("/api/auth/forgot-password") ||
    config.url.includes("/api/auth/verify-otp") ||
    config.url.includes("/api/auth/reset-password")
  );

  if (!isAuthEndpoint) {
    let { token } = getSession();

    // If memory is empty (app reload), hydrate from storage.
    if (!token) {
      const restored = await loadSessionFromStorage();
      token = restored.token;
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearSession();
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
