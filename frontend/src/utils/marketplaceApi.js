import axios from "axios";
import Cookies from "js-cookie";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const marketplaceAPI = axios.create({
  baseURL: `${BASE_URL}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

marketplaceAPI.interceptors.request.use((config) => {
  const token = Cookies.get("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const OfferAPI = {
  // Offers
  create: (data) => marketplaceAPI.post("/offers", data),
  list: (params) => marketplaceAPI.get("/offers", { params }),
  get: (offerId) => marketplaceAPI.get(`/offers/${offerId}`),
  counter: (offerId, data) => marketplaceAPI.post(`/offers/${offerId}/counter`, data),
  accept: (offerId) => marketplaceAPI.post(`/offers/${offerId}/accept`),
  reject: (offerId, data) => marketplaceAPI.post(`/offers/${offerId}/reject`, data),
  complete: (offerId) => marketplaceAPI.post(`/offers/${offerId}/complete`),

  // Payments
  createPaymentOrder: (data, idempotencyKey) =>
    marketplaceAPI.post("/payments/create-order", data, {
      headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {},
    }),
  verifyPayment: (data) => marketplaceAPI.post("/payments/verify", data),

  // Notifications
  getNotifications: (params) => marketplaceAPI.get("/notifications", { params }),
  markNotificationRead: (id) => marketplaceAPI.patch(`/notifications/${id}/read`),
  markAllNotificationsRead: () => marketplaceAPI.post("/notifications/read-all"),
};

export default marketplaceAPI;
