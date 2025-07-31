// src/api/axiosInstance.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:4000/api/v1", // Update this if using a different backend URL
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enables sending cookies with requests
});

export default axiosInstance;
