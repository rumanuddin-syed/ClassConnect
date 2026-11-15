// redux/store.js
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage
import authReducer from "./slices/authSlice";
import classReducer from "./slices/classSlice";
import userReducer from "./slices/userSlice";
import classroomReducer from "./slices/classroomSlice";
import announcementReducer from "./slices/announcementSlice";
import subjectReducer from "./slices/subjectSlice";
import invitationReducer from "./slices/invitationSlice";
import chatReducer from './slices/chatSlice';
import memoryReducer from './slices/memorySlice';
import eventReducer from './slices/eventSlice';
import attendanceReducer from './slices/attendanceSlice';

// Combine all slices
const rootReducer = combineReducers({
  auth: authReducer,
  classes: classReducer,
  user: userReducer,
  classroom: classroomReducer,
  announcements: announcementReducer,
  subjects: subjectReducer,
  invitations: invitationReducer,
  chat: chatReducer,
  memories: memoryReducer,
  events: eventReducer,
  attendance: attendanceReducer,
});

// Configure redux-persist:
// We do NOT persist sensitive auth or user state to avoid stale session spoofing.
// Only non-sensitive classroom UI state is whitelisted.
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["classroom"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
