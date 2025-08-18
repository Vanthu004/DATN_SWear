import { configureStore } from '@reduxjs/toolkit';
import chatReducer from './chatSlice';
import homeReducer from './homeSlice';
import productVariantReducer from './productVariantSlice';

const store = configureStore({
  reducer: {
    home: homeReducer,
    productVariant: productVariantReducer,
    chat: chatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'], // Sửa typo: ignoredActionsPaths -> ignoredActionPaths
        ignoredPaths: ['items.dates'],
      },
    }),
});

export default store;

// Named export để tương thích với socketService.js
export { store };