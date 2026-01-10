import axiosInstance from "./axiosInstance";

// POST /api/auth/login -> { token, role, email, id }
export const loginApi = (data) => axiosInstance.post("/api/auth/login", data);

// POST /api/profiles/register -> creates profile (backend bcrypts password)
export const registerApi = (data) => axiosInstance.post("/api/profiles/register", data);

// POST /api/auth/forgot-password -> triggers reset flow
export const forgotPasswordApi = (email) => axiosInstance.post("/api/auth/forgot-password", { email });

// POST /api/auth/verify-otp -> verifies reset OTP
export const verifyOtpApi = (email, otp) => axiosInstance.post("/api/auth/verify-otp", { email, otp });

// POST /api/auth/reset-password -> completes reset with new password
export const resetPasswordApi = (email, newPassword, confirmPassword) =>
  axiosInstance.post("/api/auth/reset-password", { email, newPassword, confirmPassword });

// GET /api/profiles/myprofiles/{id} -> user profile
export const fetchMyProfileApi = (id) => axiosInstance.get(`/api/profiles/myprofiles/${id}`);

// PUT /api/profiles/update/{id} -> update profile
export const updateProfileApi = (id, data) => axiosInstance.put(`/api/profiles/update/${id}`, data);

// GET /api/profiles/Allprofiles -> all profiles
export const fetchUserProfilesApi = () => axiosInstance.get("/api/profiles/Allprofiles");

// GET /api/friends/received/{id}
export const fetchReceivedRequestsApi = (id) => axiosInstance.get(`/api/friends/received/${id}`);

// GET /api/friends/sent/{id}
export const fetchSentRequestsApi = (id) => axiosInstance.get(`/api/friends/sent/${id}`);

// PUT /api/admin/photo/{id} -> upload profile photo (multipart/form-data)
export const uploadPhotoApi = (id, formData, config = {}) =>
  axiosInstance.put(`/api/admin/photo/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    ...config,
  });

// GET /plans -> premium plans list
export const fetchPlansApi = () => axiosInstance.get("/plans");

// POST /api/auth/register/send-otp -> sends verification OTP to email
export const sendRegistrationOtpApi = (email) =>
  axiosInstance.post("/api/auth/register/send-otp", { email });

// POST /api/auth/register/verify-otp -> verifies email OTP
export const verifyRegistrationOtpApi = (email, otp) =>
  axiosInstance.post("/api/auth/register/verify-otp", { email, otp });
