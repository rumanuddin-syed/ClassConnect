import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";

// **Base API URL**
const API_URL = "/auth";

// **Register User**
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/register`, userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Registration failed");
    }
  }
);

export const verifyEmailOtp = createAsyncThunk(
  "auth/verifyEmailOtp",
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/verify-email`, { email, otp });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Email verification failed");
    }
  }
);


// **Login User**
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/login`, credentials);

      if (response.data.token) {
        localStorage.setItem("userToken", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

// **Logout User**
export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  try {
    await axiosInstance.post(`${API_URL}/logout`);
  } catch (error) {
    console.warn("Logout API failed, but clearing local storage...");
  }
  localStorage.removeItem("user");
  localStorage.removeItem("userToken");
  return { success: true };
});




// **Send Reset OTP**
export const sendResetOtp = createAsyncThunk(
  "auth/sendResetOtp",
  async (email, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/send-reset-otp`, { email });

      return response.data.message;
    } catch (error) {
      console.error("❌ Reset OTP Error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || "Failed to send OTP");
    }
  }
);

export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      console.log("sending otp to backend");
      const response = await axiosInstance.post(`${API_URL}/verify-otp`, { email, otp });
      console.log("send the opt to backend successfully")
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "OTP verification failed");
    }
  }
);



// **Reset Password**
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ email, newPassword }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/reset-password`, { email, newPassword });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Password reset failed");
    }
  }
);

// Update initial state
const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("userToken") || null,
  isAuthenticated: !!localStorage.getItem("userToken"),
  loading: false,
  error: null,
  success: null,
  registrationOtpSent: false,  // New state for registration OTP
  resetOtpSent: false,
};

// **Auth Slice**
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = null;
      state.resetOtpSent = false;
      state.emailVerified = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // ✅ Register
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
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.registrationOtpSent = false;
        localStorage.setItem("user", JSON.stringify(action.payload.user));
        localStorage.setItem("userToken", action.payload.token);
      })
      .addCase(verifyEmailOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.registrationOtpSent = true;
      })

      // ✅ Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      
        if (action.payload.user && action.payload.token) {
          localStorage.setItem("user", JSON.stringify(action.payload.user));
          localStorage.setItem("userToken", action.payload.token);
        } else {
          console.warn("⚠ Warning: User or token missing from API response.");
        }
      })
      
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })

      // ✅ Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.success = "Logged out successfully!";
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
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

// **Exports**
export const { clearState } = authSlice.actions;
export default authSlice.reducer;
