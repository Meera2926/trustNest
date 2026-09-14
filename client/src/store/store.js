import { configureStore } from '@reduxjs/toolkit';

// We'll create these slices soon
import authReducer from '../slices/authSlice';
// import uiReducer from './slices/uiSlice';
// import bookingReducer from './slices/bookingSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    // ui: uiReducer,
    // booking: bookingReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // For socket instance if needed
    }),
});

export default store;
