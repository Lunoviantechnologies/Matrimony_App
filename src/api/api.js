import axiosInstance from "./axiosInstance";

/** Turn relative photo paths or filename-only into absolute URLs so Image can load them. */
export const getAbsolutePhotoUrl = (url) => {
  if (!url || typeof url !== "string") return url;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("file://") || url.startsWith("content://")) return url;
  const base = axiosInstance.defaults.baseURL || "";
  const cleanBase = (base && typeof base === "string") ? base.replace(/\/+$/, "") : "";
  if (!cleanBase) return url;
  const trimmed = url.trim();
  if (trimmed.startsWith("/")) return `${cleanBase}${trimmed}`;
  if (trimmed.startsWith("profile-photos/")) return `${cleanBase}/${trimmed}`;
  return `${cleanBase}/profile-photos/${trimmed}`;
};

// POST /api/auth/login -> { token, role, email, id }
export const loginApi = (data) => axiosInstance.post("/api/auth/login", data);

// POST /api/profiles/register -> creates profile (multipart: profile JSON + optional document)
export const registerApi = (profileData, documentFile) => {
  const formData = new FormData();
  formData.append("profile", JSON.stringify(profileData || {}));

  if (documentFile?.uri) {
    formData.append("document", {
      uri: documentFile.uri,
      // Fall back to generic names/types so backend still accepts it
      name: documentFile.fileName || "document.jpg",
      type: documentFile.type || "image/jpeg",
    });
  }

  return axiosInstance.post("/api/profiles/register", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// POST /api/auth/forgot-password -> triggers reset flow
export const forgotPasswordApi = (email) => axiosInstance.post("/api/auth/forgot-password", { email });

// POST /api/auth/verify-otp -> verifies reset OTP
export const verifyOtpApi = (email, otp) => axiosInstance.post("/api/auth/verify-otp", { email, otp });

// POST /api/auth/reset-password -> completes reset with new password
export const resetPasswordApi = (email, newPassword, confirmPassword) =>
  axiosInstance.post("/api/auth/reset-password", { email, newPassword, confirmPassword });

// GET /api/profiles/myprofiles/{id} -> user profile
export const fetchMyProfileApi = (id) => axiosInstance.get(`/api/profiles/myprofiles/${id}`);
// GET /api/profiles/views/{id} -> profile views count/text
export const fetchProfileViewsApi = (id) => axiosInstance.get(`/api/profiles/views/${id}`);

// GET /api/dashboard/summary — dashboard summary (same as web)
export const fetchDashboardSummaryApi = () => axiosInstance.get("/api/dashboard/summary");

// PUT /api/profiles/update/{id} -> update profile
export const updateProfileApi = (id, data) => axiosInstance.put(`/api/profiles/update/${id}`, data);

// PUT /api/admin/update/{id} -> full profile update (backend SecurityConfig1)
export const updateProfileAdminApi = (id, data) => axiosInstance.put(`/api/admin/update/${id}`, data);

// GET /api/profiles/Allprofiles -> all profiles
export const fetchUserProfilesApi = () => axiosInstance.get("/api/profiles/Allprofiles");

// POST /api/profiles/search?page=&size= — search with filters (same as web)
export const searchProfilesApi = (filters, page = 0, size = 10) => {
  const clean = Object.fromEntries(
    Object.entries(filters || {}).filter(
      ([_, v]) => v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0)
    )
  );
  return axiosInstance.post(`/api/profiles/search?page=${page}&size=${size}`, clean);
};

// POST /api/profiles/matches/search — matches with filters (same as web)
export const fetchMatchesSearchApi = (payload) =>
  axiosInstance.post("/api/profiles/matches/search", payload);

// GET /api/profiles/view/{myId}/{userId} — view single profile (same as web)
export const fetchProfileViewByIdApi = (myId, userId) =>
  axiosInstance.get(`/api/profiles/view/${myId}/${userId}`);

// POST /api/profiles/record/{viewerId}/{profileId} — record profile view (same as web)
export const recordProfileViewApi = (viewerId, profileId) =>
  axiosInstance.post(`/api/profiles/record/${viewerId}/${profileId}`);

// GET /api/friends/received/{id}
export const fetchReceivedRequestsApi = (id) => axiosInstance.get(`/api/friends/received/${id}`);

// GET /api/friends/sent/{id}
export const fetchSentRequestsApi = (id) => axiosInstance.get(`/api/friends/sent/${id}`);

// GET /api/friends/accepted/received/{id} and /api/friends/accepted/sent/{id}
export const fetchAcceptedReceivedApi = (id) => axiosInstance.get(`/api/friends/accepted/received/${id}`);
export const fetchAcceptedSentApi = (id) => axiosInstance.get(`/api/friends/accepted/sent/${id}`);
// GET /api/friends/rejected/received/{id} and /api/friends/rejected/sent/{id}
export const fetchRejectedReceivedApi = (id) => axiosInstance.get(`/api/friends/rejected/received/${id}`);
export const fetchRejectedSentApi = (id) => axiosInstance.get(`/api/friends/rejected/sent/${id}`);

// GET /api/friends/filter/{userId}?type= — same as web (type: received | sent | accepted etc.)
export const fetchFriendRequestsFilterApi = (userId, type) =>
  axiosInstance.get(`/api/friends/filter/${userId}`, { params: { type } });

// PUT /api/admin/photo/{id} -> upload profile photo (multipart/form-data)
export const uploadPhotoApi = (id, formData, config = {}) =>
  axiosInstance.put(`/api/admin/photo/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    ...config,
  });

// PUT /api/profile-photos/{slot}/{id} -> upload slots 1-4 (updatePhoto1..4). Slot 0 uses uploadPhotoApi.
export const uploadProfilePhotoSlotApi = (id, slot, formData, config = {}) =>
  axiosInstance.put(`/api/profile-photos/${slot}/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    ...config,
  });

// DELETE /api/profile-photos/{slot}/{id} -> remove photo from slot 1-4
export const deleteProfilePhotoSlotApi = (id, slot) =>
  axiosInstance.delete(`/api/profile-photos/${slot}/${id}`);

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

// POST /api/friends/respond/{requestId}?accept= — accept or reject request (same as web)
export const respondToFriendRequestApi = (requestId, accept) =>
  axiosInstance.post(`/api/friends/respond/${requestId}`, null, { params: { accept } });

// DELETE /api/friends/sent/delete/{requestId} -> cancel sent interest
export const deleteSentRequestApi = (requestId) =>
  axiosInstance.delete(`/api/friends/sent/delete/${requestId}`);

// CHAT
// GET /api/chat/conversation/{senderId}/{receiverId}?page=&size=
export const fetchChatConversationApi = (senderId, receiverId, page = 0, size = 50) =>
  axiosInstance.get(`/api/chat/conversation/${senderId}/${receiverId}?page=${page}&size=${size}`);

// GET /api/chat/online -> list of online user IDs
export const fetchOnlineUsersApi = () =>
  axiosInstance.get("/api/chat/online");

// POST /api/chat/seen/{senderId}/{receiverId} -> mark messages as seen
export const markChatSeenApi = (senderId, receiverId) =>
  axiosInstance.post(`/api/chat/seen/${senderId}/${receiverId}`);

// POST /api/chat/send/{senderId}/{receiverId}
export const sendChatMessageApi = (senderId, receiverId, message) =>
  axiosInstance.post(`/api/chat/send/${senderId}/${receiverId}`, { message });

// POST /api/chat/clear/{senderId}/{receiverId}
export const clearChatApi = (senderId, receiverId) =>
  axiosInstance.post(`/api/chat/clear/${senderId}/${receiverId}`);

// BLOCK / REPORT
// POST /api/block/user/{blockerId}/{blockedId}
export const blockUserApi = (blockerId, blockedId) =>
  axiosInstance.post(`/api/block/user/${blockerId}/${blockedId}`);

// POST /api/block/unblock/{blockerId}/{blockedId}
export const unblockUserApi = (blockerId, blockedId) =>
  axiosInstance.post(`/api/block/unblock/${blockerId}/${blockedId}`);

// GET /api/block/status/{blockerId}/{blockedId}
export const getBlockStatusApi = (blockerId, blockedId) =>
  axiosInstance.get(`/api/block/status/${blockerId}/${blockedId}`);

// POST /api/reports/user/{reportedUserId}
// body: { reporterId, reason, description }
export const reportUserApi = (reportedUserId, payload) =>
  axiosInstance.post(`/api/reports/user/${reportedUserId}`, payload);

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

// ==========================
// REFER & EARN
// ==========================

export const fetchReferralSummaryApi = () =>
  axiosInstance.get("/api/referrals/me");

export const useReferralCodeApi = (referralCode) =>
  axiosInstance.post("/api/referrals/use-code", { referralCode });

// GET /api/astro-number/all/{userId} — astrologers for user (same as web)
export const fetchAstrologersApi = (userId) =>
  axiosInstance.get(`/api/astro-number/all/${userId}`);

// ==========================
// LOCATIONS (for register)
// ==========================

export const fetchCountriesApi = () =>
  axiosInstance.get("/api/locations/countries");

export const fetchStatesByCountryApi = (countryId) =>
  axiosInstance.get(`/api/locations/states/${countryId}`);

// ==========================
// CONTACT (public) — same as web
// ==========================
export const contactSendApi = (payload) =>
  axiosInstance.post("/api/contact/send", payload);

// ==========================
// SUPPORT TICKETS (user)
// ==========================
// POST /tickets -> create support ticket (body or FormData for Payment Issue)
export const createTicketApi = (payload) =>
  axiosInstance.post("/tickets", payload);

export const createTicketFormDataApi = (formData) =>
  axiosInstance.post("/tickets", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// ==========================
// BLOG — same as web (public list, slug, like, comment)
// ==========================
export const fetchPublicBlogsApi = (page = 0) =>
  axiosInstance.get(`/api/admin/blogs?page=${page}`);

export const fetchBlogBySlugApi = (slug) =>
  axiosInstance.get(`/api/blog/${slug}`);

// POST /api/blog/like/{blogId}
export const postBlogLikeApi = (blogId) =>
  axiosInstance.post(`/api/blog/like/${blogId}`);

// POST /api/blog/comment/{blogId} — backend expects param "message" (same as web payload)
export const postBlogCommentApi = (blogId, comment) =>
  axiosInstance.post(`/api/blog/comment/${blogId}`, null, { params: { message: comment } });
