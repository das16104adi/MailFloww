// src/api/auth.js
import axiosInstance from "./axiosInstance";
import axios from "axios";
// const Baseurl = "http://localhost:4000/api/v1";
// export const signup = async (userData) => {
//    try {
//      const response = await axios.post(
//        "http://localhost:4000/api/v1/signup",
//        userData,
//        {
//          headers: {
//            "Content-Type": "application/json",
//          },
//          withCredentials: true,
//        }
//      );
//      console.log(response);
//      return response.data;
//    } catch (error) {
//     console.log("errorr");
//      console.error("Signup error:", error.response?.data || error.message);
//      throw error;
//    }
// };

// import axios from "axios";

export const signup = async (userData) => {
  try {
    const response = await axios.post(
      "http://localhost:4000/api/v1/signup",
      userData,
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true, // allows cookies to be sent
      }
    );
    console.log("Signup response:");
    return response.data;
  } catch (error) {
    console.error(
      "Signup error:",
      error.response?.data?.message || error.response?.data || error.message
    );
    throw error;
  }
};


export const login = async (credentials) => {
  const response = await axiosInstance.post("/login", credentials);
  return response.data;
};

export const logout = async () => {
  const response = await axiosInstance.post("/logout");
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await axiosInstance.get("/auth/me");
  return response.data;
};
