import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";


export const addSubject = createAsyncThunk(
  'subjects/add',
  async ({ name, teacherId, classId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/subject', { 
        name, 
        teacherId, 
        classId 
      });
      return response.data.subject;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add subject');
    }
  }
);


export const updateSubject = createAsyncThunk(
  'subjects/update',
  async ({ name, teacherId, classroomId, subjectId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put('/subject', { 
        name,
        teacherId,
        classroomId,
        subjectId
      });
      return response.data.subject;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update subject');
    }
  }
);

export const deleteSubject = createAsyncThunk(
  'subjects/delete',
  async ({ classroomId, subjectId }, { rejectWithValue }) => {
    try {
      await axiosInstance.delete('/subject', { 
        data: { classroomId, subjectId } 
      });
      return subjectId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete subject');
    }
  }
);

// Slice
const subjectSlice = createSlice({
  name: 'subjects',
  initialState: {
    items: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    operation: null, // 'fetch' | 'add' | 'update' | 'delete'
    lastUpdated: null
  },
  reducers: {
    resetSubjectState: (state) => {
      state.status = 'idle';
      state.error = null;
      state.operation = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Add Subject
      .addCase(addSubject.pending, (state) => {
        state.status = 'loading';
        state.operation = 'add';
        state.error = null;
      })
      .addCase(addSubject.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.operation = null;
        state.items.push(action.payload);
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(addSubject.rejected, (state, action) => {
        state.status = 'failed';
        state.operation = null;
        state.error = action.payload;
      })
      
      // Update Subject
      .addCase(updateSubject.pending, (state) => {
        state.status = 'loading';
        state.operation = 'update';
        state.error = null;
      })
      .addCase(updateSubject.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.operation = null;
        const index = state.items.findIndex(
          sub => sub._id === action.payload._id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateSubject.rejected, (state, action) => {
        state.status = 'failed';
        state.operation = null;
        state.error = action.payload;
      })
      
      // Delete Subject
      .addCase(deleteSubject.pending, (state) => {
        state.status = 'loading';
        state.operation = 'delete';
        state.error = null;
      })
      .addCase(deleteSubject.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.operation = null;
        state.items = state.items.filter(
          sub => sub._id !== action.payload
        );
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(deleteSubject.rejected, (state, action) => {
        state.status = 'failed';
        state.operation = null;
        state.error = action.payload;
      });
  }
});

export const { resetSubjectState } = subjectSlice.actions;
export default subjectSlice.reducer;