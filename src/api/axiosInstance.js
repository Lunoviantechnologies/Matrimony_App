import axios from "axios";
import { BASE_URL } from "@env";
import { getSession, loadSessionFromStorage } from "./authSession";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
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
