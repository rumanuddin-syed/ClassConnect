import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

export const fetchInvitations = createAsyncThunk(
    'invitations/fetchInvitations',
    async (classroomId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/invitation', {
                params: { classroomId }
            });
            return response.data.invitations;
        } catch (error) {
            return rejectWithValue({
                message: error.response?.data?.message || 'Failed to fetch invitations',
                status: error.response?.status
            });
        }
    }
);

export const acceptInvitation = createAsyncThunk(
    'invitations/acceptInvitation',
    async ({ classroomId, reqUserId, role }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/invitation/accept', {
                classroomId,
                reqUserId,
                role
            });
            return response.data;
        } catch (error) {
            return rejectWithValue({
                message: error.response?.data?.message || 'Failed to accept invitation',
                status: error.response?.status
            });
        }
    }
);

export const rejectInvitation = createAsyncThunk(
    'invitations/rejectInvitation',
    async ({ classroomId, reqUserId}, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/invitation/reject', {
                classroomId,
                reqUserId
            });
            return response.data;
        } catch (error) {
            return rejectWithValue({
                message: error.response?.data?.message || 'Failed to reject invitation',
                status: error.response?.status
            });
        }
    }
);

const initialState = {
    invitations: [],
    loading: false,
    error: null,
    success: null
};

const invitationSlice = createSlice({
    name: 'invitations',
    initialState,
    reducers: {
        clearInvitationState: (state) => {
            state.loading = false;
            state.error = null;
            state.success = null;
        },
        resetInvitations: (state) => {
            state.invitations = [];
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchInvitations.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchInvitations.fulfilled, (state, action) => {
                state.loading = false;
                state.invitations = action.payload;
            })
            .addCase(fetchInvitations.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload.message;
            })
            .addCase(acceptInvitation.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = null;
            })
            .addCase(acceptInvitation.fulfilled, (state, action) => {
                state.loading = false;
                state.invitations = state.invitations.filter(
                    invite => invite.userId !== action.payload.reqUserId
                );
                state.success = action.payload.message;
            })
            .addCase(acceptInvitation.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload.message;
            })
            .addCase(rejectInvitation.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = null;
            })
            .addCase(rejectInvitation.fulfilled, (state, action) => {
                state.loading = false;
                state.invitations = state.invitations.filter(
                    invite => invite.userId !== action.payload.reqUserId
                );
                state.success = action.payload.message;
            })
            .addCase(rejectInvitation.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload.message;
            });
    }
});

export const { clearInvitationState, resetInvitations } = invitationSlice.actions;
export default invitationSlice.reducer;