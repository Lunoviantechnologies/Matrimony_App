import axios from "axios";
import { BASE_URL } from "@env";
import { getSession, loadSessionFromStorage } from "./authSession";

// Fallback so app never crashes if .env wasn't inlined (e.g. stale build)
const API_BASE = typeof BASE_URL === "string" && BASE_URL.trim() ? BASE_URL.trim().replace(/\/+$/, "") : "https://vivahjeevan.com";

const axiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(async (config) => {
  let { token } = getSession();
  // If memory is empty (app reload), hydrate from storage.
  if (!token) {
    const restored = await loadSessionFromStorage();
    token = restored.token;
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
