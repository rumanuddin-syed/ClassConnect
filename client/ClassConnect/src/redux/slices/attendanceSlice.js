import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

export const fetchAttendance = createAsyncThunk(
  'attendance/fetch',
  async ( classId , { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/attendance', { params: { classId } });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const addAttendance = createAsyncThunk(
  'attendance/add',
  async ({ classId, attendanceData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/attendance', {
        classId,
        ...attendanceData
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const editAttendance = createAsyncThunk(
  'attendance/edit',
  async ({ classId, attendanceId, attendanceData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/attendance`, {
        classId,
        attendanceId,
        ...attendanceData
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const deleteAttendanceRecord = createAsyncThunk(
  'attendance/delete',
  async ({ classId, attendanceId ,subjectId}, { rejectWithValue }) => {
    try {
      await axiosInstance.delete('/attendance', {
        data: { classId, attendanceId,subjectId }
      });
      return attendanceId;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState: {
    data: [],
    students: [],
    subjects: [],
    loading: false,
    error: null
  },
  reducers: {
    resetAttendance: (state) => {
      state.data = [];
      state.students = [];
      state.subjects = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.attendance;
        state.students = action.payload.students;
        state.subjects = action.payload.subjects;
      })
      .addCase(fetchAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch attendance';
      })
      
      .addCase(addAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.data.push(action.payload);
      })
      .addCase(addAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to add attendance';
      })
      
      .addCase(editAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editAttendance.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.data.findIndex(a => a._id === action.payload._id);
        if (index !== -1) state.data[index] = action.payload;
      })
      .addCase(editAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update attendance';
      })
      
      .addCase(deleteAttendanceRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAttendanceRecord.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.filter(a => a._id !== action.payload);
      })
      .addCase(deleteAttendanceRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete attendance';
      });
  }
});

export const { resetAttendance } = attendanceSlice.actions;
export default attendanceSlice.reducer;