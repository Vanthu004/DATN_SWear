import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../utils/api';

// Fetch product variants by product ID
export const fetchProductVariants = createAsyncThunk(
  'productVariant/fetchProductVariants',
  async (productId) => {
    const res = await api.get(`/product-variants/${productId}`);
    
    // Transform data if needed - check if response is an array or object
    let variants = res.data;
    
    // If response is not an array, try to extract variants from it
    if (!Array.isArray(variants)) {
      // If it's a single variant object, wrap it in an array
      if (variants && typeof variants === 'object') {
        // Check if this is a single variant with attributes
        if (variants.attributes) {
          variants = [variants];
        } else {
          variants = [];
        }
      } else {
        variants = [];
      }
    }
    
    // Transform variant objects to extract size and color from attributes if needed
    variants = variants.map(variant => {
      if (variant.attributes) {
        return {
          ...variant,
          size: variant.size_name || variant.attributes.size?.name || variant.attributes.size,
          color: variant.color_name || variant.attributes.color?.name || variant.attributes.color,
          hex_code: variant.attributes.color?.hex_code, // Add hex_code for color display
          stock: variant.stock_quantity || variant.stock, // Use stock_quantity if available
        };
      }
      // If no attributes, try to use size_name and color_name directly
      return {
        ...variant,
        size: variant.size_name || variant.size,
        color: variant.color_name || variant.color,
        stock: variant.stock_quantity || variant.stock,
      };
    });
    
    return { productId, variants };
  }
);

// Fetch product detail with variants
export const fetchProductDetail = createAsyncThunk(
  'productVariant/fetchProductDetail',
  async (productId) => {
    const res = await api.get(`/products/${productId}/frontend`);
    return res.data;
  }
);

const productVariantSlice = createSlice({
  name: 'productVariant',
  initialState: {
    variants: {},
    productDetails: {},
    loading: false,
    error: null,
  },
  reducers: {
    clearVariants(state) {
      state.variants = {};
    },
    clearProductDetails(state) {
      state.productDetails = {};
    },
    setSelectedVariant(state, action) {
      const { productId, variant } = action.payload;
      if (!state.productDetails[productId]) {
        state.productDetails[productId] = {};
      }
      state.productDetails[productId].selectedVariant = variant;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch product variants
      .addCase(fetchProductVariants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductVariants.fulfilled, (state, action) => {
        state.loading = false;
        const { productId, variants } = action.payload;
        state.variants[productId] = variants;
      })
      .addCase(fetchProductVariants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch product detail
      .addCase(fetchProductDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductDetail.fulfilled, (state, action) => {
        state.loading = false;
        const product = action.payload;
        state.productDetails[product._id] = product;
      })
      .addCase(fetchProductDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearVariants, clearProductDetails, setSelectedVariant } = productVariantSlice.actions;
export default productVariantSlice.reducer; 