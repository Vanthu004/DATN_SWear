import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../utils/api';

export const fetchCategories = createAsyncThunk('home/fetchCategories', async () => {
  const res = await api.get('/categories');
  return res.data;
});

export const fetchBestSellers = createAsyncThunk('home/fetchBestSellers', async () => {
  const res = await api.get('/products/best-sellers');
  return res.data.data;
});

export const fetchNewest = createAsyncThunk('home/fetchNewest', async () => {
  const res = await api.get('/products/newest');
  return res.data;
});

export const fetchPopular = createAsyncThunk('home/fetchPopular', async () => {
  const res = await api.get('/products/popular');
  return res.data.data;
});

export const fetchProductsByCategory = createAsyncThunk('home/fetchProductsByCategory', async (categoryId) => {
  const res = await api.get(`/products/category/${categoryId}`);
  return res.data;
});

export const searchProducts = createAsyncThunk('home/searchProducts', async (keyword) => {
  const res = await api.get(`/products/search?keyword=${encodeURIComponent(keyword)}`);
  return res.data;
});

const homeSlice = createSlice({
  name: 'home',
  initialState: {
    categories: [],
    bestSellers: [],
    newest: [],
    popular: [],
    selectedCategoryProducts: [],
    loading: false,
    error: null,
    searchKeyword: '',
    searchResults: [],
    searchLoading: false,
    searchError: null,
  },
  reducers: {
    setSearchKeyword(state, action) {
      state.searchKeyword = action.payload;
    },
    clearSelectedCategoryProducts(state) {
      state.selectedCategoryProducts = [];
    },
    clearSearchResults(state) {
      state.searchResults = [];
      state.searchError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchBestSellers.fulfilled, (state, action) => {
        state.bestSellers = action.payload;
      })
      .addCase(fetchNewest.fulfilled, (state, action) => {
        state.newest = action.payload;
      })
      .addCase(fetchPopular.fulfilled, (state, action) => {
        state.popular = action.payload;
      })
      .addCase(fetchProductsByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCategoryProducts = action.payload;
      })
      .addCase(fetchProductsByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(searchProducts.pending, (state) => {
        state.searchLoading = true;
        state.searchError = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.searchLoading = false;
        state.searchError = action.error.message;
      });
  },
});

export const { setSearchKeyword, clearSelectedCategoryProducts } = homeSlice.actions;
export default homeSlice.reducer; 