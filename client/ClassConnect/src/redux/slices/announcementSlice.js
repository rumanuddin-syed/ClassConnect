import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

const initialState = {
  announcements: [],
  loading: false,
  error: null,
};

export const fetchAnnouncements = createAsyncThunk(
  'announcements/fetchAll',
  async (classroomId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/announcement/${classroomId}`);
      return response.data.announcements;
    } catch (error) {
      console.error('Fetch Announcements Error:', {
        message: error.response?.data?.message,
        status: error.response?.status,
        data: error.config?.data,
        url: error.config?.url
      });
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch announcements');
    }
  }
);

export const addNewAnnouncement = createAsyncThunk(
  'announcements/add',
  async ({ classId, text }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/announcement', { text, classId });
      return response.data.announcement;
    } catch (error) {
      console.error('Add Announcement Error:', {
        message: error.response?.data?.message,
        status: error.response?.status,
        payload: { classId, text },
        stack: error.stack
      });
      return rejectWithValue(error.response?.data?.message || 'Failed to add announcement');
    }
  }
);

export const updateExistingAnnouncement = createAsyncThunk(
  'announcements/update',
  async ({ announcementId, classroomId, text }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put('/announcement', {
        text,
        announcementId,
        classroomId
      });
      return response.data.announcement;
    } catch (error) {
      console.error('Update Announcement Error:', {
        message: error.response?.data?.message,
        status: error.response?.status,
        announcementId,
        classroomId,
        text
      });
      return rejectWithValue(error.response?.data?.message || 'Failed to update announcement');
    }
  }
);

export const deleteExistingAnnouncement = createAsyncThunk(
  'announcements/delete',
  async ({ announcementId, classroomId }, { rejectWithValue }) => {
    try {
      await axiosInstance.delete('/announcement', {
        data: { announcementId, classroomId }
      });
      return announcementId;
    } catch (error) {
      console.error('Delete Announcement Error:', {
        message: error.response?.data?.message,
        status: error.response?.status,
        announcementId,
        classroomId
      });
      return rejectWithValue(error.response?.data?.message || 'Failed to delete announcement');
    }
  }
);

const announcementSlice = createSlice({
  name: 'announcements',
  initialState,
  reducers: {
    clearAnnouncements: (state) => {
      state.announcements = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnnouncements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnnouncements.fulfilled, (state, action) => {
        state.loading = false;
        state.announcements = action.payload;
      })
      .addCase(fetchAnnouncements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error('Fetch Announcements Rejected:', action.payload);
      })
      
      .addCase(addNewAnnouncement.pending, (state) => {
        state.error = null;
      })
      .addCase(addNewAnnouncement.fulfilled, (state, action) => {
        state.announcements.unshift(action.payload);
      })
      .addCase(addNewAnnouncement.rejected, (state, action) => {
        state.error = action.payload;
        console.error('Add Announcement Rejected:', action.payload);
      })
      
      .addCase(updateExistingAnnouncement.pending, (state) => {
        state.error = null;
      })
      .addCase(updateExistingAnnouncement.fulfilled, (state, action) => {
        const index = state.announcements.findIndex(
          ann => ann.id === action.payload.id
        );
        if (index !== -1) {
          state.announcements[index] = action.payload;
        }
      })
      .addCase(updateExistingAnnouncement.rejected, (state, action) => {
        state.error = action.payload;
        console.error('Update Announcement Rejected:', action.payload);
      })
      
      .addCase(deleteExistingAnnouncement.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteExistingAnnouncement.fulfilled, (state, action) => {
        state.announcements = state.announcements.filter(
          ann => ann.id !== action.payload
        );
      })
      .addCase(deleteExistingAnnouncement.rejected, (state, action) => {
        state.error = action.payload;
        console.error('Delete Announcement Rejected:', action.payload);
      });
  }
});

export const { clearAnnouncements } = announcementSlice.actions;
export default announcementSlice.reducer;