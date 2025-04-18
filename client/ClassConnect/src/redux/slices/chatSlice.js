import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';



export const fetchChats = createAsyncThunk(
  'chat/fetchChats',
  async (classId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/chat`, { 
        params: { classId } 
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ classId, message, tempId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/chat', { classId, message });
      return  response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const editMessage = createAsyncThunk(
  'chat/editMessage',
  async ({ classId, chatSchemaId, editedMessage }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put('/chat', { 
        classId, 
        chatSchemaId, 
        editedMessage 
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteMessage = createAsyncThunk(
  'chat/deleteMessage',
  async ({ classId, chatSchemaId, hardDelete = false }, { rejectWithValue }) => {
    try {
      const response =await axiosInstance.delete('/chat', { 
        data: { classId, chatSchemaId }
      });
      const res=response.data
      return {hardDelete,res};
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    messages: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    clearChat: (state) => {
      state.messages = [];
    },
    addLocalMessage: (state, action) => {
      // Prevent duplicates
      if (!state.messages.some(msg => msg.chatId === action.payload.chatId)) {
        state.messages=[...state.messages,action.payload];
      }
    },
 
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChats.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.messages = action.payload;
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.status='succeeded';
        if (!state.messages.some(msg => msg.chatId === action.payload.chatId)) {
          state.messages=[...state.messages,action.payload];
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(editMessage.fulfilled, (state, action) => {
        const index = state.messages.findIndex(
          msg => msg.chatId === action.payload.chatId
        );
        if (index !== -1) {
          state.messages[index] = action.payload;
        }
      })
      .addCase(deleteMessage.fulfilled, (state, action) => {
        state.status='succeeded';
        const { hardDelete } = action.payload;
        if (hardDelete) {
          state.messages = state.messages.filter(
            msg => msg.chatId !== action.payload.res
          );
        } else {
            const index = state.messages.findIndex(
                msg => msg.chatId === action.payload.res.chatId
              );
              if (index !== -1) {
                state.messages[index] = action.payload.res;
              }
        }
      });
  }
});

export const { clearChat, addLocalMessage } = chatSlice.actions;
export default chatSlice.reducer;