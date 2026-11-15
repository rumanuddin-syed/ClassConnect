import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";

const API_URL = "/auth";

// Register User
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `${API_URL}/register`,
        userData,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed",
      );
    }
  },
);

// Verify Registration Email OTP
export const verifyEmailOtp = createAsyncThunk(
  "auth/verifyEmailOtp",
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/verify-email`, {
        email,
        otp,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Email verification failed",
      );
    }
  },
);

// Login User
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `${API_URL}/login`,
        credentials,
      );
      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  },
);

// Revalidate authentication session with backend on app launch
export const checkAuthSession = createAsyncThunk(
  "auth/checkAuthSession",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/check`);
      return response.data;
    } catch (error) {
      return rejectWithValue("Not authenticated");
    }
  }
);

// Logout User
export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  try {
    await axiosInstance.post(`${API_URL}/logout`);
  } catch (error) {
    console.warn("Logout API call failed, clearing local state anyway...");
  }
  return { success: true };
});

// Send Password Reset OTP
export const sendResetOtp = createAsyncThunk(
  "auth/sendResetOtp",
  async (email, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/send-reset-otp`, {
        email,
      });
      return response.data.message;
    } catch (error) {
      console.error("Reset OTP Error:", error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || "Failed to send OTP",
      );
    }
  },
);

// Verify Password Reset OTP
export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/verify-otp`, {
        email,
        otp,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "OTP verification failed",
      );
    }
  },
);

// Reset Password with verified resetToken
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ email, newPassword, resetToken }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/reset-password`, {
        email,
        newPassword,
        resetToken,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Password reset failed",
      );
    }
  },
);

// Initial State: no localStorage reliance for tokens
const initialState = {
  user: null,
  isAuthenticated: false,
  isInitializing: true, // Used for app load auth check
  loading: false,
  error: null,
  success: null,
  registrationOtpSent: false,
  resetOtpSent: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = null;
      state.registrationOtpSent = false;
      state.resetOtpSent = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.registrationOtpSent = true;
        state.success = "OTP sent to your email";
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.registrationOtpSent = false;
      })

      // Verify Email OTP
      .addCase(verifyEmailOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmailOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.registrationOtpSent = false;
      })
      .addCase(verifyEmailOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })

      // Check Auth Session (Revalidation on startup)
      .addCase(checkAuthSession.pending, (state) => {
        state.isInitializing = true;
      })
      .addCase(checkAuthSession.fulfilled, (state, action) => {
        state.isInitializing = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(checkAuthSession.rejected, (state) => {
        state.isInitializing = false;
        state.isAuthenticated = false;
        state.user = null;
      })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.success = "Logged out successfully!";
        state.user = null;
        state.isAuthenticated = false;
      })

      // Send Reset OTP
      .addCase(sendResetOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.resetOtpSent = false;
      })
      .addCase(sendResetOtp.fulfilled, (state) => {
        state.loading = false;
        state.success = "OTP sent successfully!";
        state.resetOtpSent = true;
      })
      .addCase(sendResetOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.resetOtpSent = false;
      })

      // Verify Reset OTP
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.message;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearState } = authSlice.actions;
export default authSlice.reducer;
