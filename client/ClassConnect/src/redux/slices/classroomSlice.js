import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

export const fetchClassroomDetails = createAsyncThunk(
    'classroom/fetchDetails',
    async (classroomId, { rejectWithValue }) => {
      try {
        const response = await axiosInstance.get(`/class/${classroomId}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching classroom details:', {
          error: error.response?.data || error.message,
          status: error.response?.status,
          classroomId
        });
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch classroom details');
      }
    }
  );

  export const removeClassMember = createAsyncThunk(
    'classroom/removeMember',
    async ({ classroomId, userId }, { rejectWithValue }) => {
      try {
        await axiosInstance.post('/user-class/remove-member', {
          classId: classroomId,
          userId
        });
        return userId;
      } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to remove member');
      }
    }
  );

const initialState = {
  classroom: null,
  loading: false,
  error: null,
  removeMemberStatus: 'idle'
};

const classroomSlice = createSlice({
  name: 'classroom',
  initialState,
  reducers: {
    resetClassroom: (state) => {
      console.log('Resetting classroom state');
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClassroomDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClassroomDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.classroom = action.payload;
      })
      .addCase(fetchClassroomDetails.rejected, (state, action) => {
        console.error('Classroom data fetch failed:', action.payload);
        state.loading = false;
        state.error = action.payload || 'Failed to fetch classroom details';
      })
      .addCase(removeClassMember.pending, (state) => {
        state.removeMemberStatus = 'loading';
      })
      .addCase(removeClassMember.fulfilled, (state, action) => {
        state.removeMemberStatus = 'succeeded';
        // Update local state immediately after successful removal
        if (state.classroom) {
          state.classroom.students = state.classroom.students.filter(
            student => student.userId !== action.payload
          );
          state.classroom.teachers = state.classroom.teachers.filter(
            teacher => teacher.userId !== action.payload
          );
        }
      })
      .addCase(removeClassMember.rejected, (state, action) => {
        state.removeMemberStatus = 'failed';
        state.error = action.payload;
      });

  }
});

export const { resetClassroom } = classroomSlice.actions;
export default classroomSlice.reducer;