import api from "./api";

// 1. Define the Google Login function separately
export const googleLoginRequest = async (idToken, role, accessToken) => {
  const response = await api.post("/auth/google-login", { idToken, role, accessToken, platform: 'mobile' });
  return response.data;
};

const authService = {
  // ✅ NEW: Helper to set the token in API headers
  setToken: (token) => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  },

  // Login User
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password, platform: 'mobile' });
    return response.data;
  },

  // Register User
  register: async (userData) => {
    const response = await api.post("/auth/signup", { ...userData, platform: 'mobile' });
    return response.data;
  },

  // Get Current User
  getCurrentUser: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  // Forgot Password - Send reset email
  forgotPassword: async (email) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  // Reset Password with token
  resetPassword: async (token, password) => {
    const response = await api.post("/auth/reset-password", {
      token,
      password,
    });
    return response.data;
  },

  // Change Password
  changePassword: async (oldPassword, newPassword) => {
    const response = await api.post("/auth/change-password", {
      oldPassword,
      newPassword,
    });
    return response.data;
  },

  // Update Profile
  updateProfile: async (data) => {
    const response = await api.patch("/users/profile", data);
    return response.data;
  },

  // Update Profile Picture
  updateProfilePicture: async (formData) => {
    const response = await api.put("/users/profile-picture", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  googleLoginRequest: googleLoginRequest,
};

export default authService;
