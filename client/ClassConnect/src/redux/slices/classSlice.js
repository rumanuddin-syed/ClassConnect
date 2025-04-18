import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";

const initialState = {
  userClasses: {
    created: [],
    joined: [],
  },
  loading: false,
  error: null,
  actionStatus: "idle",
};

// Async Thunks
export const fetchUserClasses = createAsyncThunk(
  "classes/fetchUserClasses",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/user-class");
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch classes");
    }
  }
);

export const createNewClass = createAsyncThunk(
  "classes/createNewClass",
  async (classData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/user-class/create-class", classData);
      return response.data.classroom;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create class");
    }
  }
);

export const requestJoinClass = createAsyncThunk(
  "classes/requestJoinClass",
  async ({ classId, role }, { rejectWithValue }) => {
    try {
      await axiosInstance.post("/user-class/req-join-class", { classId, role });
      return classId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to send join request");
    }
  }
);

export const editClass = createAsyncThunk(
  "classes/editClass",
  async ({ classId, name, description }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put("/user-class", { classId, name, description });
      return response.data.classroom;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update class");
    }
  }
);

export const deleteClass = createAsyncThunk(
  "classes/deleteClass",
  async (classId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete("/user-class", { data: { classId } });
      return classId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete class");
    }
  }
);

const classSlice = createSlice({
  name: "classes",
  initialState,
  reducers: {
    resetActionStatus: (state) => {
      state.actionStatus = "idle";
    },
    clearClassError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserClasses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserClasses.fulfilled, (state, action) => {
        state.loading = false;
        state.userClasses = {
          created: action.payload.createdClasses,
          joined: action.payload.joinedClasses,
        };
      })
      .addCase(fetchUserClasses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createNewClass.pending, (state) => {
        state.actionStatus = "loading";
      })
      .addCase(createNewClass.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        state.userClasses.created.unshift(action.payload);
      })
      .addCase(createNewClass.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.error = action.payload;
      })
      .addCase(requestJoinClass.pending, (state) => {
        state.actionStatus = "loading";
      })
      .addCase(requestJoinClass.fulfilled, (state) => {
        state.actionStatus = "succeeded";
      })
      .addCase(requestJoinClass.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.error = action.payload;
      })
      .addCase(editClass.pending, (state) => {
        state.actionStatus = "loading";
      })
      .addCase(editClass.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        state.userClasses.created = state.userClasses.created.map(cls => 
          cls.classId === action.payload._id ? { ...cls, ...action.payload } : cls
        );
      })
      .addCase(editClass.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.error = action.payload;
      })
      .addCase(deleteClass.pending, (state) => {
        state.actionStatus = "loading";
      })
      .addCase(deleteClass.fulfilled, (state, action) => {
        state.actionStatus = "succeeded";
        state.userClasses.created = state.userClasses.created.filter(
          cls => cls.classId !== action.payload
        );
      })
      .addCase(deleteClass.rejected, (state, action) => {
        state.actionStatus = "failed";
        state.error = action.payload;
      });
  },
});

export const { resetActionStatus, clearClassError } = classSlice.actions;
export default classSlice.reducer;