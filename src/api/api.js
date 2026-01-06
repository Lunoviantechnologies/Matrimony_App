import axiosInstance from "./axiosInstance";

export const loginApi = (data) => {
  return axiosInstance.post("/api/auth/login", data);
};
