import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
const API_BASE_URL = 'http://192.168.1.112:3000/api'; //http://192.168.1.7:3000/api

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging and adding token
api.interceptors.request.use(
  async (config) => {
    // Thêm token vào header nếu có
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log('Error getting token for request:', error);
    }

    console.log('API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      data: config.data,
      params: config.params,
      headers: config.headers,
    });
    return config;
  },
  (error) => {
    console.log('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.log('API Response Error:', {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

// Upload functions
export const uploadImage = async (imageFile, relatedModel = null, relatedId = null) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    if (relatedModel) {
      formData.append('relatedModel', relatedModel);
    }
    
    if (relatedId) {
      formData.append('relatedId', relatedId);
    }

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Upload image error:', error);
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
      name: "avatar.jpg"
    });

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Upload avatar error:', error);
    throw error;
  }
};

// Hàm helper để update profile với avatar theo flow mới
export const updateProfileWithAvatar = async (profileData, imageUri = null) => {
  try {
    let uploadId = null;
    
    // Bước 1: Upload ảnh nếu có
    if (imageUri) {
      console.log('Step 1: Uploading avatar...');
      const uploadResponse = await uploadAvatar(imageUri);
      console.log('Upload response:', uploadResponse);
      
      if (uploadResponse.upload && uploadResponse.upload._id) {
        uploadId = uploadResponse.upload._id;
      } else {
        throw new Error("Upload response does not contain valid upload ID");
      }
    }
    
    // Bước 2: Update avatar nếu có uploadId
    if (uploadId) {
      console.log('Step 2: Updating avatar with uploadId:', uploadId);
      const avatarResponse = await updateUserAvatar(uploadId);
      console.log('Avatar update response:', avatarResponse);
    }
    
    // Bước 3: Update profile info
    console.log('Step 3: Updating profile info...');
    const response = await api.put('/users/update-profile', profileData);
    console.log('Profile update response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Update profile with avatar failed:', error);
    throw error;
  }
};

export const getUploads = async () => {
  try {
    const response = await api.get('/uploads');
    return response.data;
  } catch (error) {
    console.error('Get uploads error:', error);
    throw error;
  }
};

export const deleteUpload = async (uploadId) => {
  try {
    const response = await api.delete(`/uploads/${uploadId}`);
    return response.data;
  } catch (error) {
    console.error('Delete upload error:', error);
    throw error;
  }
};

export const updateUserAvatar = async (uploadId) => {
  try {
    const response = await api.put('/users/update-avatar', { uploadId });
    return response.data;
  } catch (error) {
    console.error('Update user avatar error:', error);
    throw error;
  }
};

// Favorite Product APIs
export const getFavoritesByUser = async (userId) => {
  try {
    const response = await api.get(`/favorites/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Get favorites error:', error);
    throw error;
  }
};

export const addFavorite = async (userId, productId) => {
  try {
    const response = await api.post(`/favorites`, { user_id: userId, product_id: productId });
    return response.data;
  } catch (error) {
    console.error('Add favorite error:', error);
    throw error;
  }
};

export const removeFavorite = async (userId, productId) => {
  try {
    const response = await api.delete(`/favorites/${userId}/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Remove favorite error:', error);
    throw error;
  }
};

// Lấy loại danh mục public
export const fetchCategoryTypes = async () => {
  try {
    const response = await api.get('/category-types/public');
    return response.data
  } catch (error) {
    console.error('Fetch category types error:', error);
    throw error;
  }
};

// Lấy loại danh mục theo id
export const getCategoriesById = async (categoryTypeId) => {
  const response = await api.get(`/categories/by-category-type/${categoryTypeId}`);
  return response.data;
};

// api.js
export const createAddress = async (addressData) => {
  try {
    const response = await api.post("/addresses", addressData);
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



export default api;