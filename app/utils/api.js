import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
const API_BASE_URL = 'http://192.168.1.5:3000/api'; //

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

export const updateUserAvatar = async (avatarId) => {
  try {
    const response = await api.put('/users/update-avatar', { avatarId });
    return response.data;
  } catch (error) {
    console.error('Update user avatar error:', error);
    throw error;
  }
};

export default api;