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
import chatReducer from './slices/chatSlice'; // Add this import
import memoryReducer from './slices/memorySlice';
import eventReducer from './slices/eventSlice';
import attendanceReducer from './slices/attendanceSlice'; // Add this line


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
  events: eventReducer, // Add this line
  attendance: attendanceReducer // Add this line

});

// Configure redux-persist
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "user", "classroom"], // Only persist important slices
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Final store setup
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // required by redux-persist
    }),
});

// Export persistor
export const persistor = persistStore(store);
