import axios from "axios";

// Base API instance configured for our Node/Express backend
const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

// Interceptor to automatically attach JWT token from localStorage if user is logged in
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;