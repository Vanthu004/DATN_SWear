
// app/utils/api.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Alert } from "react-native";
import { logoutGlobal } from "../context/AuthContext";
// Base URL for the API
const API_BASE_URL = "http://192.168.1.9:3000/api";

const WEBSOCKET_URL = "http://192.168.1.9:3000";



const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Xuất cả named và default để tương thích mọi nơi (import { api } hoặc import api)


// Interceptors
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log("Error getting token for request:", error);
    }

    // Nếu gửi FormData, loại bỏ Content-Type mặc định để RN tự thêm boundary
    try {
      const isRNFormData = config?.data && typeof config.data === 'object' && typeof config.data._parts !== 'undefined';
      const isFormData = (typeof FormData !== 'undefined' && config.data instanceof FormData) || isRNFormData;
      if (isFormData) {
        if (config.headers && (config.headers['Content-Type'] || config.headers['content-type'])) {
          delete config.headers['Content-Type'];
          delete config.headers['content-type'];
        }
      }
    } catch (e) {
      // noop
    }

    // console.log("API Request:", {
    //   method: config.method?.toUpperCase(),
    //   url: config.url,
    //   data: config.data,
    //   params: config.params,
    //   headers: config.headers,
    // });

    return config;
  },
  (error) => {
    console.log("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging and handling errors
api.interceptors.response.use(
  (response) => {
    // console.log("API Response:", {
    //   status: response.status,
    //   url: response.config.url,
    //   data: response.data,
    // });
    return response;
  },
  async (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || "Lỗi không xác định";

    if (status === 401 && message === 'Token đã hết hạn') {
      // Xử lý token expired: logout và alert
      await logoutGlobal();
      Alert.alert('Phiên hết hạn', 'Vui lòng đăng nhập lại.');
      return Promise.reject(error);
    }

    if (status === 403 && message === 'Token không hợp lệ') {
      // Xử lý invalid token: tương tự expired
      await logoutGlobal();
      Alert.alert('Token không hợp lệ', 'Vui lòng đăng nhập lại.');
      return Promise.reject(error);
    }
    if (status === 403 && message.includes("bị khóa")) {
      try {
        await AsyncStorage.setItem("banMessage", message);
        console.log("api.js: Ban detected, stored banMessage, relying on AuthContext for logout");
        await logoutGlobal();
      } catch (err) {
        console.error("Error handling 403:", err);
      }
    }


    console.log("API Response Error:", {
      status,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message,
    });

    return Promise.reject(error);
  }
);


// Upload functions
export const uploadImage = async (
  imageFile,
  relatedModel = null,
  relatedId = null
) => {
  try {
    console.log("📤 uploadImage called with:", { imageFile, relatedModel, relatedId });
    
    const formData = new FormData();
    formData.append("image", imageFile);

    if (relatedModel) {
      formData.append("relatedModel", relatedModel);
    }

    if (relatedId) {
      formData.append("relatedId", relatedId);
    }

    console.log("📤 FormData created:", formData);
    console.log("📤 Uploading to /upload");

    const response = await api.post("/upload", formData);

    console.log("📤 Upload response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Upload image error:", error);
    console.error("❌ Error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

// Upload avatar function theo format API mới
export const uploadAvatar = async (imageUri) => {
  try {
    const formData = new FormData();
    formData.append("image", {
      uri: imageUri,
      type: "image/jpeg",
      name: "avatar.jpg",
    });

    const response = await api.post("/upload", formData);

    return response.data;
  } catch (error) {
    console.error("Upload avatar error:", error);
    throw error;
  }
};

// Hàm helper để update profile với avatar theo flow mới
export const updateProfileWithAvatar = async (profileData, imageUri = null) => {
  try {
    let uploadId = null;

    // Bước 1: Upload ảnh nếu có
    if (imageUri) {
      console.log("Step 1: Uploading avatar...");
      const uploadResponse = await uploadAvatar(imageUri);
      console.log("Upload response:", uploadResponse);

      if (uploadResponse && uploadResponse._id) {
        uploadId = uploadResponse._id;
      } else {
        throw new Error("Upload response does not contain valid upload ID");
      }
    }

    // Bước 2: Update avatar nếu có uploadId
    if (uploadId) {
      console.log("Step 2: Updating avatar with uploadId:", uploadId);
      const avatarResponse = await updateUserAvatar(uploadId);
      console.log("Avatar update response:", avatarResponse);
    }

    // Bước 3: Update profile info
    console.log("Step 3: Updating profile info...");
    const response = await api.put("/users/update-profile", profileData);
    console.log("Profile update response:", response.data);

    return response.data;
  } catch (error) {
    console.error("Update profile with avatar failed:", error);
    throw error;
  }
};

export const getUploads = async () => {
  try {
    const response = await api.get("/uploads");
    return response.data;
  } catch (error) {
    console.error("Get uploads error:", error);
    throw error;
  }
};

export const deleteUpload = async (uploadId) => {
  try {
    const response = await api.delete(`/uploads/${uploadId}`);
    return response.data;
  } catch (error) {
    console.error("Delete upload error:", error);
    throw error;
  }
};

export const updateUserAvatar = async (uploadId) => {
  try {
    const response = await api.put("/users/update-avatar", { uploadId });
    return response.data;
  } catch (error) {
    console.error("Update user avatar error:", error);
    throw error;
  }
};

// Favorite Product APIs
export const getFavoritesByUser = async (userId) => {
  try {
    const response = await api.get(`/favorites/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Get favorites error:", error);
    throw error;
  }
};

export const addFavorite = async (userId, productId) => {
  try {
    const response = await api.post(`/favorites`, {
      user_id: userId,
      product_id: productId,
    });
    return response.data;
  } catch (error) {
    console.error("Add favorite error:", error);
    throw error;
  }
};

export const removeFavorite = async (userId, productId) => {
  try {
    const response = await api.delete(`/favorites/${userId}/${productId}`);
    return response.data;
  } catch (error) {
    console.error("Remove favorite error:", error);
    throw error;
  }
};

// Lấy loại danh mục public
export const fetchCategoryTypes = async () => {
  try {
    const response = await api.get("/category-types/public");
    return response.data;
  } catch (error) {
    console.error("Fetch category types error:", error);
    throw error;
  }
};

// Lấy loại danh mục theo id
export const getCategoriesById = async (categoryTypeId) => {
  const response = await api.get(
    `/categories/by-category-type/${categoryTypeId}`
  );
  return response.data;
};

// ===== CART SYSTEM APIs =====

// Cart APIs
export const createCart = async (userId, note = null) => {
  try {
    const requestBody = { user_id: userId };
    if (note) {
      requestBody.note = note;
    }
    const response = await api.post("/cart", requestBody);
    return response.data;
  } catch (error) {
    console.error("Create cart error:", error);
    throw error;
  }
};

export const getAllCarts = async (status = null, page = 1, limit = 10) => {
  try {
    const params = { page, limit };
    if (status) {
      params.status = status;
    }
    const response = await api.get("/cart", { params });
    return response.data;
  } catch (error) {
    console.error("Get all carts error:", error);
    throw error;
  }
};

export const getCartById = async (cartId) => {
  try {
    const response = await api.get(`/cart/${cartId}`);
    return response.data;
  } catch (error) {
    console.error("Get cart by ID error:", error);
    throw error;
  }
};

export const getCartByUser = async (userId) => {
  try {
    const response = await api.get(`/cart/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Get cart by user error:", error);
    throw error;
  }
};

export const updateCartStatus = async (cartId, status, note = null) => {
  try {
    const requestBody = { status };
    if (note) {
      requestBody.note = note;
    }
    const response = await api.put(`/cart/${cartId}`, requestBody);
    return response.data;
  } catch (error) {
    console.error("Update cart status error:", error);
    throw error;
  }
};

export const deleteCart = async (cartId) => {
  try {
    const response = await api.delete(`/cart/${cartId}`);
    return response.data;
  } catch (error) {
    console.error("Delete cart error:", error);
    throw error;
  }
};

export const createOrderFromCart = async (cartId, orderData) => {
  try {
    const response = await api.post(`/cart/${cartId}/checkout`, orderData);
    return response.data;
  } catch (error) {
    console.error("Create order from cart error:", error);
    throw error;
  }
};

// Cart Item APIs
export const addCartItem = async (cartItemData) => {
  try {
    const response = await api.post("/cart-items", cartItemData);
    return response.data;
  } catch (error) {
    // Chỉ log nhẹ trong dev nếu không phải lỗi đã biết (ví dụ hết hàng 400)
    const status = error?.response?.status;
    if (status !== 400) {
      console.error("Add cart item error:", error);
    }
    throw error;
  }
};

export const getCartItemsByCart = async (cartId) => {
  try {
    const response = await api.get(`/cart-items/cart/${cartId}?populate=product_id,product_variant_id`);
    return response.data;
  } catch (error) {
    console.error("Get cart items by cart error:", error);
    throw error;
  }
};

export const updateCartItemQuantity = async (itemId, quantity) => {
  try {
    const response = await api.put(`/cart-items/${itemId}`, { quantity });
    return response.data;
  } catch (error) {
    console.error("Update cart item quantity error:", error);
    throw error;
  }
};

export const deleteCartItem = async (itemId) => {
  try {
    const response = await api.delete(`/cart-items/${itemId}`);
    return response.data;
  } catch (error) {
    console.error("Delete cart item error:", error);
    throw error;
  }
};

export const clearCartItems = async (cartId) => {
  try {
    const response = await api.delete(`/cart-items/cart/${cartId}/clear`);
    return response.data;
  } catch (error) {
    console.error("Clear cart items error:", error);
    throw error;
  }
};

// ===== ORDER SYSTEM APIs =====

// Order APIs
export const createOrder = async (orderData) => {
  try {
    const response = await api.post("/orders", orderData);
    return response.data;
  } catch (error) {
    console.error("Create order error:", error);
    throw error;
  }
};

export const getAllOrders = async () => {
  try {
    const response = await api.get("/orders");
    return response.data;
  } catch (error) {
    console.error("Get all orders error:", error);
    throw error;
  }
};

export const getOrderById = async (orderId) => {
  try {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error("Get order by ID error:", error);
    throw error;
  }
};

export const getOrdersByUser = async (userId) => {
  try {
    const response = await api.get(`/orders/user/${userId}`);
    // Trả về đúng mảng orders
    return response.data?.data?.orders || [];
  } catch (error) {
    console.error("Get orders by user error:", error);
    throw error;
  }
};

export const updateOrder = async (orderId, updateData) => {
  try {
    const response = await api.put(`/orders/${orderId}`, updateData);
    return response.data;
  } catch (error) {
    console.error("Update order error:", error);
    throw error;
  }
};

export const deleteOrder = async (orderId) => {
  try {
    const response = await api.delete(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error("Delete order error:", error);
    throw error;
  }
};

export const createOrderWithDetails = async (orderData) => {
  try {
    const response = await api.post("/orders/full", orderData);
    return response.data;
  } catch (error) {
    console.error("Create order with details error:", error);
    throw error;
  }
};

// OrderDetail APIs
export const createOrderDetail = async (orderDetailData) => {
  try {
    const response = await api.post("/order-details", orderDetailData);
    return response.data;
  } catch (error) {
    console.error("Create order detail error:", error);
    throw error;
  }
};

export const getAllOrderDetails = async () => {
  try {
    const response = await api.get("/order-details");
    return response.data;
  } catch (error) {
    console.error("Get all order details error:", error);
    throw error;
  }
};

export const getOrderDetailById = async (orderDetailId) => {
  try {
    const response = await api.get(`/order-details/${orderDetailId}`);
    return response.data;
  } catch (error) {
    console.error("Get order detail by ID error:", error);
    throw error;
  }
};

export const getOrderDetailsByOrderId = async (orderId) => {
  try {
    const response = await api.get(`/order-details/order/${orderId}`);
    // Đảm bảo trả về đúng mảng details
    return response.data?.data?.details || [];
  } catch (error) {
    console.error("Get order details by orderId error:", error);
    return [];
  }
};

export const deleteOrderDetail = async (orderDetailId) => {
  try {
    const response = await api.delete(`/order-details/${orderDetailId}`);
    return response.data;
  } catch (error) {
    console.error("Delete order detail error:", error);
    throw error;
  }
};
export const cancelOrder = async (orderId, reason) => {
  try {
    const response = await api.put(`/orders/${orderId}/cancel`, {
      reason: reason,
    });
    return response.data;
  } catch (error) {
    console.error("Cancel order error:", error);
    throw error;
  }
};



// Address APIs
export const createAddress = async (addressData) => {
  try {
    const response = await api.post("addresses", addressData);
    return response.data;
  } catch (error) {
    console.error("Error creating address:", error);
    throw error;
  }
};
// Không cần truyền userId vì đã lấy từ token
export const getAddressList = async () => {
  try {
    const response = await api.get(`/addresses`);
    return response.data;
  } catch (error) {
    console.error("Error fetching address list:", error);
    throw error;
  }
};

export const updateAddress = async (id, addressData) => {
  try {
    const response = await api.put(`/addresses/${id}`, addressData);
    return response.data;
  } catch (error) {
    console.error("Error updating address:", error);
    throw error;
  }
};
export const deleteAddress = async (id) => {
  try {
    const response = await api.delete(`/addresses/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting address:", error);
    throw error;
  }
};

// Voucher APIs
export const getPublicVouchers = async () => {
  const res = await api.get("/vouchers/");
  return res.data;
};

export const getUserVouchers = async (userId) => {
  const res = await api.get(`/vouchers/user/${userId}`);
  return res.data;
};

// Payment and Shipping Methods APIs
export const getPaymentMethods = async () => {
  const res = await api.get("/payment-methods");
  return res.data;
};

export const getShippingMethods = async () => {
  const res = await api.get("/shipping-methods");
  return res.data;
};

export const requestRefund = async (orderId, reason) => {
  try {
    const userData = await AsyncStorage.getItem("user");
    const user = JSON.parse(userData);
    const userId = user?._id;

    if (!userId) {
      throw new Error("Không tìm thấy userId trong AsyncStorage");
    }

    const res = await api.post("/refund-requests", {
      orderId,
      userId,
      reason,
    });
    return res.data;
  } catch (error) {
    console.error("Lỗi gửi yêu cầu hoàn tiền:", error);
    throw error;
  }
};
export const getAllReviews = async () => {
  try {
    const response = await api.get("/reviews");
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy tất cả đánh giá:", error);
    throw error;
  }
};






export const applyVoucherApi = async (voucherId) => {
  const res = await api.post(`/vouchers/apply-voucher/${voucherId}`);
  return res.data;

};
// ===== SHIPPING METHODS APIs =====

export const createShippingMethod = async (shippingData) => {
  try {
    const response = await api.post('/shipping-methods', shippingData);
    return response.data;
  } catch (error) {
    console.error('Error creating shipping method:', error);
    throw error;
  }
};

export const updateShippingMethod = async (id, shippingData) => {
  try {
    const response = await api.put(`/shipping-methods/${id}`, shippingData);
    return response.data;
  } catch (error) {
    console.error('Error updating shipping method:', error);
    throw error;
  }
};

export const deleteShippingMethod = async (id) => {
  try {
    const response = await api.delete(`/shipping-methods/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting shipping method:', error);
    throw error;
  }
};

// ===== PRODUCT VARIANT APIs =====

export const getProductVariants = async (productId) => {
  try {
    const response = await api.get(`/product-variants/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Get product variants error:', error);
    throw error;
  }
};

export const getProductDetail = async (productId) => {
  try {
    const response = await api.get(`/products/${productId}/frontend`);
    return response.data;
  } catch (error) {
    console.error('Get product detail error:', error);
    throw error;
  }
};
// Giảm tồn kho
export const decreaseProductStock = async (items) => {
  try {
    const response = await api.post("/products/decrease-stock", { items });
    return response.data; // { message: "Cập nhật tồn kho thành công" }
  } catch (error) {
    console.error("Error decreasing stock:", error);
    throw error;
  }
};

// Hoàn tồn kho
export const increaseProductStock = async (items) => {
  try {
    const response = await api.post("/products/increase-stock", { items });
    return response.data; // { message: "Cập nhật tồn kho thành công" }
  } catch (error) {
    console.error("Error increasing stock:", error);
    throw error;
  }
};

// ===== PRODUCT SUGGESTION APIs =====

// Gợi ý sản phẩm (Autocomplete)
export const getProductSuggestions = async (keyword, limit = 8) => {
  try {
    const response = await api.get("/products/suggest", {
      params: { keyword, limit }
    });
    return response.data;
  } catch (error) {
    console.error("Get product suggestions error:", error);
    throw error;
  }
};

// Sản phẩm liên quan
export const getRelatedProducts = async (productId, limit = 6) => {
  try {
    const response = await api.get("/products/related", {
      params: { productId, limit }
    });
    return response.data;
  } catch (error) {
    console.error("Get related products error:", error);
    throw error;
  }
};

// Sản phẩm phổ biến (Trending)
export const getTrendingProducts = async (limit = 10, timeRange = 'all') => {
  try {
    const response = await api.get("/products/trending", {
      params: { limit, timeRange }
    });
    return response.data;
  } catch (error) {
    console.error("Get trending products error:", error);
    throw error;
  }
};

// Gợi ý cá nhân hóa
export const getPersonalizedProducts = async (userId, limit = 8) => {
  try {
    const response = await api.get("/products/personalized", {
      params: { userId, limit }
    });
    return response.data;
  } catch (error) {
    console.error("Get personalized products error:", error);
    throw error;
  }
};

// Tìm kiếm nâng cao với gợi ý
export const searchProductsEnhanced = async (params) => {
  try {
    const {
      keyword,
      page = 1,
      limit = 10,
      category,
      priceMin,
      priceMax,
      sortBy = 'relevance'
    } = params;

    const searchParams = {
      keyword,
      page,
      limit,
      sortBy
    };

    if (category) searchParams.category = category;
    if (priceMin) searchParams.priceMin = priceMin;
    if (priceMax) searchParams.priceMax = priceMax;

    const response = await api.get("/products/search/enhanced", {
      params: searchParams
    });
    return response.data;
  } catch (error) {
    console.error("Search products enhanced error:", error);
    throw error;
  }
};

// ===== SEARCH HISTORY APIs =====

// Lấy từ khóa tìm kiếm phổ biến
export const getPopularKeywords = async (limit = 10, timeRange = 'all') => {
  try {
    const response = await api.get("/search-history/popular", {
      params: { limit, timeRange }
    });
    return response.data;
  } catch (error) {
    console.error("Get popular keywords error:", error);
    throw error;
  }
};

// Lấy từ khóa phổ biến thời gian thực
export const getRealtimePopularKeywords = async (limit = 10, hours = 24) => {
  try {
    const response = await api.get("/search-history/realtime-popular", {
      params: { limit, hours }
    });
    return response.data;
  } catch (error) {
    console.error("Get realtime popular keywords error:", error);
    throw error;
  }
};

// Lấy lịch sử tìm kiếm của user
export const getSearchHistory = async (limit = 10) => {
  try {
    const response = await api.get("/search-history/history", {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error("Get search history error:", error);
    throw error;
  }
};

// Lấy lịch sử tìm kiếm gần đây
export const getRecentSearchHistory = async (limit = 5) => {
  try {
    const response = await api.get("/search-history/recent", {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error("Get recent search history error:", error);
    throw error;
  }
};

// Lấy gợi ý tìm kiếm thông minh
export const getSearchSuggestions = async (keyword, limit = 5) => {
  try {
    const response = await api.get("/search-history/suggestions", {
      params: { keyword, limit }
    });
    return response.data;
  } catch (error) {
    console.error("Get search suggestions error:", error);
    throw error;
  }
};

// Thêm lịch sử tìm kiếm
export const addSearchHistory = async (searchData) => {
  try {
    const response = await api.post("/search-history/add", searchData);
    return response.data;
  } catch (error) {
    console.error("Add search history error:", error);
    throw error;
  }
};

// Xóa lịch sử tìm kiếm
export const deleteSearchHistory = async (keyword = null) => {
  try {
    const response = await api.delete("/search-history/delete", {
      data: keyword ? { keyword } : {}
    });
    return response.data;
  } catch (error) {
    console.error("Delete search history error:", error);
    throw error;
  }
};

// Lấy thống kê tìm kiếm
export const getSearchStats = async (timeRange = 'all') => {
  try {
    const response = await api.get("/search-history/stats", {
      params: { timeRange }
    });
    return response.data;
  } catch (error) {
    console.error("Get search stats error:", error);
    throw error;
  }
};
export default api;
export { api, WEBSOCKET_URL };

