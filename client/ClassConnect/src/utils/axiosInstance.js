import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://classconnect-gsov.onrender.com/api",
});

// ✅ Attach token to every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("userToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn("No user token found in localStorage");
  }
  return config;
});

// ✅ Handle token expiry
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Token expired. Logging out...");
      localStorage.removeItem("userToken");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
