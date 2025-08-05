import { configureStore } from '@reduxjs/toolkit';
import homeReducer from './homeSlice';
import productVariantReducer from './productVariantSlice';

const store = configureStore({
  reducer: {
    home: homeReducer,
    productVariant: productVariantReducer,
  },
});

export default store; 