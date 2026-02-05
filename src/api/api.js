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

// GET /api/plans -> premium plans list (auth required)
export const fetchPlansApi = () => axiosInstance.get("/api/plans");

// POST /api/payment/create-order -> returns razorpay order payload
export const createPaymentOrderApi = (data) => axiosInstance.post("/api/payment/create-order", data);

// POST /api/payment/verify -> verifies razorpay payment
export const verifyPaymentApi = (data) => axiosInstance.post("/api/payment/verify", data);

// GET /api/payment/successful/{profileId}/latest -> latest payment info
export const fetchLatestPaymentApi = (profileId) =>
  axiosInstance.get(`/api/payment/successful/${profileId}/latest`);

// GET /api/payment/successful/{profileId} -> payment history
export const fetchPaymentHistoryApi = (profileId) =>
  axiosInstance.get(`/api/payment/successful/${profileId}`);

// POST /api/friends/send/{senderId}/{receiverId} -> send interest/friend request
export const sendFriendRequestApi = (senderId, receiverId) =>
  axiosInstance.post(`/api/friends/send/${senderId}/${receiverId}`);

// DELETE /api/friends/sent/delete/{requestId} -> cancel sent interest
export const deleteSentRequestApi = (requestId) =>
  axiosInstance.delete(`/api/friends/sent/delete/${requestId}`);

// CHAT
// GET /api/chat/conversation/{senderId}/{receiverId}?page=&size=
export const fetchChatConversationApi = (senderId, receiverId, page = 0, size = 50) =>
  axiosInstance.get(`/api/chat/conversation/${senderId}/${receiverId}?page=${page}&size=${size}`);

// POST /api/chat/send/{senderId}/{receiverId}
export const sendChatMessageApi = (senderId, receiverId, message) =>
  axiosInstance.post(`/api/chat/send/${senderId}/${receiverId}`, { message });

// POST /api/auth/register/send-otp -> sends verification OTP to email
export const sendRegistrationOtpApi = (email) =>
  axiosInstance.post("/api/auth/register/send-otp", { email });

// POST /api/auth/register/verify-otp -> verifies email OTP
export const verifyRegistrationOtpApi = (email, otp) =>
  axiosInstance.post("/api/auth/register/verify-otp", { email, otp });

// NOTIFICATIONS
export const fetchNotificationsApi = (userId) =>
  axiosInstance.get(`/api/notifications/GetAll?userId=${userId}`);
export const markNotificationReadApi = (id) =>
  axiosInstance.post(`/api/notifications/read/${id}`);
export const markAllNotificationsReadApi = (userId) =>
  axiosInstance.post(`/api/notifications/mark-all-read?userId=${userId}`);
