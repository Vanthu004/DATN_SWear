// app/services/chatService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = "http://192.168.1.9:3000/api";

// Axios instance for chat API
const chatAPIClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
});
// Request interceptor to add auth token
chatAPIClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error('Error getting token from AsyncStorage:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
chatAPIClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Chat API Error:', error.response?.data || error.message);
      AsyncStorage.removeItem('userToken');
    } else if (error.response?.status >= 500) {
      console.error('Chat API Error:', error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

export const chatAPI = {
  // Chat Rooms
  createChatRoom: async (roomData) => {
    try {
      console.log('Sending create room payload:', roomData);
      const response = await chatAPIClient.post('/chat/rooms', roomData);
      console.log('API response:', response.data);
      if (!response.data) {
        throw new Error('No data in API response');
      }
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Lỗi API không xác định';
      console.error('API createChatRoom error:', errorMessage);
      throw error;
    }
  },

  getMyChatRooms: async (params = {}) => {
    try {
      const response = await chatAPIClient.get('/chat/rooms/my-rooms', { params });
      console.log('🌐 getMyChatRooms Response:', JSON.stringify(response, null, 2)); // Ghi log toàn bộ phản hồi
      if (!response.data) {
        throw new Error('No data returned from getMyChatRooms');
      }
      return response.data;
    } catch (error) {
      console.error('getMyChatRooms Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },

  getChatRoomById: async (roomId) => {
    try {
      const response = await chatAPIClient.get(`/chat/rooms/${roomId}`);
      console.log('🌐 getChatRoomById Response:', JSON.stringify(response, null, 2));
      const roomData = response.data.room || response.data;
      if (!roomData.roomId) {
        throw new Error(`Invalid room data for roomId: ${roomId}`);
      }
      return roomData;
    } catch (error) {
      console.error('getChatRoomById Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },

  updateRoomStatus: async (roomId, status) => {
    try {
      const response = await chatAPIClient.put(`/chat/rooms/${roomId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('updateRoomStatus Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },

  // Messages
  sendMessage: async (messageData) => {
    const response = await chatAPIClient.post('/chat/messages', messageData);
    return response.data;
  },

  getMessages: async (roomId, page = 1, limit = 50) => {
    try {
      const response = await chatAPIClient.get(`/chat/rooms/${roomId}/messages`, {
        params: { page, limit }
      });
      console.log('🌐 getMessages Response:', JSON.stringify(response.data, null, 2));
      return response.data || { messages: [], pagination: { hasMore: false } };
    } catch (error) {
      console.error('getMessages Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      if (error.response?.status === 416) {
        // Phòng chat không có tin nhắn
        return { messages: [], pagination: { hasMore: false } };
      }
      throw error;
    }
  },

  // Image upload to Cloudinary
  uploadImage: async (imageUri) => {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'chat-image.jpg',
      });
      formData.append('upload_preset', 'swear_unsigned');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/du6cuhb3q/image/upload`,
        {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          url: data.secure_url,
          publicId: data.public_id
        };
      } else {
        throw new Error(data.error?.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      return {
        success: false,
        error: error.message || 'Upload failed'
      };
    }
  },
};

// Utility functions
export const chatUtils = {
  formatMessageTime: (timestamp) => {
    const messageDate = new Date(timestamp);
    const now = new Date();
    const diffInMs = now - messageDate;
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInMs / (1000 * 60));
      return minutes < 1 ? 'Vừa xong' : `${minutes} phút trước`;
    } else if (diffInHours < 24) {
      return messageDate.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffInDays < 7) {
      return messageDate.toLocaleDateString('vi-VN', {
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return messageDate.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  },

  getStatusColor: (status) => {
    switch (status) {
      case 'open':
        return '#FF9800'; // Orange
      case 'assigned':
        return '#2196F3'; // Blue
      case 'resolved':
        return '#4CAF50'; // Green
      case 'closed':
        return '#9E9E9E'; // Gray
      default:
        return '#2196F3';
    }
  },

  getStatusText: (status) => {
    switch (status) {
      case 'open':
        return 'Đang chờ';
      case 'assigned':
        return 'Đã gán';
      case 'resolved':
        return 'Đã giải quyết';
      case 'closed':
        return 'Đã đóng';
      default:
        return 'Không xác định';
    }
  },

  getCategoryText: (category) => {
    switch (category) {
      case 'product_inquiry':
        return 'Hỏi về sản phẩm';
      case 'order_support':
        return 'Hỗ trợ đơn hàng';
      case 'complaint':
        return 'Khiếu nại';
      case 'technical_support':
        return 'Hỗ trợ kỹ thuật';
      case 'account_support':
        return 'Hỗ trợ tài khoản';
      case 'general':
        return 'Tổng quát';
      default:
        return 'Khác';
    }
  },

  getPriorityText: (priority) => {
    switch (priority) {
      case 'low':
        return 'Thấp';
      case 'medium':
        return 'Trung bình';
      case 'high':
        return 'Cao';
      default:
        return 'Trung bình';
    }
  },

  getPriorityColor: (priority) => {
    switch (priority) {
      case 'low':
        return '#4CAF50';
      case 'medium':
        return '#FF9800';
      case 'high':
        return '#F44336';
      default:
        return '#FF9800';
    }
  },

  getUserProfile: async () => {
    try {
      const response = await chatAPIClient.get('/users/me');
      console.log('🌐 getUserProfile Response:', JSON.stringify(response, null, 2));
      return response.data;
    } catch (error) {
      console.error('getUserProfile Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },
};

export const fetchChatRooms = async () => {
  const response = await chatAPIClient.get('/chat/rooms/my-rooms?t=' + new Date().getTime());
  console.log('Fetch chat rooms response:', response.data.chatRooms.map(r => ({ roomId: r.roomId, status: r.status, updatedAt: r.updatedAt })));
  return response.data;
};