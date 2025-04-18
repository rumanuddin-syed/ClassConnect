import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

export const fetchUserData = createAsyncThunk(
  'user/fetchUserData',
  async (_, { rejectWithValue }) => {
    try {
      // The token is automatically attached via axiosInstance
      const response = await axiosInstance.get('/get-user');
      
      return {
        id: response.data.data.id,
        name: response.data.data.name,
        email: response.data.data.email,
        createdClassesCount: response.data.data.number_of_created_classes,
        joinedClassesCount: response.data.data.number_of_joined_classes
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch user data');
    }
  }
);

const initialState = {
  userId: null,
  name: '',
  email: '',
  createdClassesCount: 0,
  joinedClassesCount: 0,
  loading: false,
  error: null
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserData: (state) => {
      Object.assign(state, initialState);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.loading = false;
        state.userId = action.payload.id;
        state.name = action.payload.name;
        state.email = action.payload.email;
        state.createdClassesCount = action.payload.createdClassesCount;
        state.joinedClassesCount = action.payload.joinedClassesCount;
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearUserData } = userSlice.actions;
export default userSlice.reducer;