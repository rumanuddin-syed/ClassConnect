import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

export const getMemories = createAsyncThunk(
  'memories/get',
  async (classId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get('/memory', { params: { classId } });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching memories');
    }
  }
);

export const createMemory = createAsyncThunk(
  'memories/create',
  async ({ classId, title, description, image }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('classId', classId);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('image', image);
      
      const { data } = await axiosInstance.post('/memory', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error creating memory');
    }
  }
);

export const editMemory = createAsyncThunk(
  'memories/edit',
  async ({ classId, Memoryid, title, description, image }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('classId', classId);
      formData.append('Memoryid', Memoryid);
      formData.append('title', title);
      formData.append('description', description);
      if (image instanceof File) formData.append('image', image);
      
      const { data } = await axiosInstance.put('/memory', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error updating memory');
    }
  }
);

export const deleteMemory = createAsyncThunk(
  'memories/delete',
  async ({ classId, Memoryid }, { rejectWithValue }) => {
    try {
      await axiosInstance.delete('/memory', { data: { classId, Memoryid } });
      return Memoryid;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error deleting memory');
    }
  }
);

const memorySlice = createSlice({
  name: 'memories',
  initialState: {
    memories: [],
    loading: false,
    crudLoading: false,
    error: null
  },
  reducers: {
    clearMemoryError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMemories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMemories.fulfilled, (state, action) => {
        state.loading = false;
        state.memories = action.payload;
      })
      .addCase(getMemories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createMemory.pending, (state) => {
        state.crudLoading = true;
        state.error = null;
      })
      .addCase(createMemory.fulfilled, (state, action) => {
        state.crudLoading = false;
        state.memories.unshift(action.payload);
      })
      .addCase(createMemory.rejected, (state, action) => {
        state.crudLoading = false;
        state.error = action.payload;
      })
      .addCase(editMemory.pending, (state) => {
        state.crudLoading = true;
        state.error = null;
      })
      .addCase(editMemory.fulfilled, (state, action) => {
        state.crudLoading = false;
        state.memories = state.memories.map(memory => 
          memory._id === action.payload._id ? action.payload : memory
        );
      })
      .addCase(editMemory.rejected, (state, action) => {
        state.crudLoading = false;
        state.error = action.payload;
      })
      .addCase(deleteMemory.pending, (state) => {
        state.crudLoading = true;
        state.error = null;
      })
      .addCase(deleteMemory.fulfilled, (state, action) => {
        state.crudLoading = false;
        state.memories = state.memories.filter(
          memory => memory._id !== action.payload
        );
      })
      .addCase(deleteMemory.rejected, (state, action) => {
        state.crudLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearMemoryError } = memorySlice.actions;
export default memorySlice.reducer;