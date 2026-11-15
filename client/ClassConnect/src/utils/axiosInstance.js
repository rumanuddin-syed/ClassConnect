import axios from "axios";

// Centralized Axios instance
// Transport: Strict HttpOnly Cookies via withCredentials: true
const axiosInstance = axios.create({
  baseURL: "http://localhost:4000/api",
  withCredentials: true,
  headers: {
    "X-Requested-With": "XMLHttpRequest", // CSRF defense header
  },
});

// Handle 401 Unauthorized / Token Expiry
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || "";
      const isAuthExempt =
        url.includes("/auth/login") ||
        url.includes("/auth/register") ||
        url.includes("/auth/verify-email") ||
        url.includes("/auth/verify-otp") ||
        url.includes("/auth/reset-password") ||
        url.includes("/auth/check");

      if (!isAuthExempt) {
        console.warn("Unauthorized / Session expired. Redirecting to login...");
        if (window.location.pathname !== "/login" && window.location.pathname !== "/") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
