import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.9:3000/api';

/**
 * Service xử lý API thông báo từ backend
 */
export class NotificationApiService {
  /**
   * Lấy auth token từ storage
   */
  static async getAuthToken() {
    try {
      return await AsyncStorage.getItem('userToken');
    } catch (error) {
      console.error('[NotificationApi] Error getting auth token:', error);
      return null;
    }
  }

  /**
   * Tạo headers với auth token
   */
  static async getHeaders() {
    const token = await this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  /**
   * Đăng ký token - thống nhất format với fcmService
   */
  static async saveToken(userId, expoToken, tokenType = 'expo') {
    try {
      const headers = await this.getHeaders();
      const payload = {
        userId,
        expo_push_token: expoToken,
        push_token_type: tokenType,
        platform: 'ios', // Có thể detect platform
        timestamp: new Date().toISOString()
      };
      
      const response = await axios.post(`${API_BASE_URL}/notifications/save-token`, payload, { headers });
      console.log('[NotificationApi] Token saved successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('[NotificationApi] Error saving token:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Lấy danh sách thông báo
   */
  static async getUserNotifications(userId, page = 1, limit = 20) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.get(`${API_BASE_URL}/notifications/user/${userId}`, {
        headers,
        params: { page, limit }
      });
      
      console.log('[NotificationApi] Got notifications:', response.data);
      return response.data;
    } catch (error) {
      console.error('[NotificationApi] Error getting notifications:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Đánh dấu đã đọc
   */
  static async markAsRead(notificationId) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.put(`${API_BASE_URL}/notifications/${notificationId}/read`, {}, { headers });
      
      console.log('[NotificationApi] Marked as read:', response.data);
      return response.data;
    } catch (error) {
      console.error('[NotificationApi] Error marking as read:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Đánh dấu tất cả đã đọc
   */
  static async markAllAsRead(userId) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.put(`${API_BASE_URL}/notifications/user/${userId}/read-all`, {}, { headers });
      
      console.log('[NotificationApi] Marked all as read:', response.data);
      return response.data;
    } catch (error) {
      console.error('[NotificationApi] Error marking all as read:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Xóa thông báo
   */
  static async deleteNotification(notificationId) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.delete(`${API_BASE_URL}/notifications/${notificationId}`, { headers });
      
      console.log('[NotificationApi] Deleted notification:', response.data);
      return response.data;
    } catch (error) {
      console.error('[NotificationApi] Error deleting notification:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Lấy số lượng chưa đọc
   */
  static async getUnreadCount(userId) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.get(`${API_BASE_URL}/notifications/user/${userId}/unread-count`, { headers });
      
      console.log('[NotificationApi] Got unread count:', response.data);
      return response.data;
    } catch (error) {
      console.error('[NotificationApi] Error getting unread count:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Lấy thông báo theo loại
   */
  static async getNotificationsByType(userId, type, page = 1, limit = 20) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.get(`${API_BASE_URL}/notifications/user/${userId}/type/${type}`, {
        headers,
        params: { page, limit }
      });
      
      console.log('[NotificationApi] Got notifications by type:', response.data);
      return response.data;
    } catch (error) {
      console.error('[NotificationApi] Error getting notifications by type:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Lấy thông báo đơn hàng
   */
  static async getOrderNotifications(userId, page = 1, limit = 20) {
    return this.getNotificationsByType(userId, 'order', page, limit);
  }

  /**
   * Lấy thông báo hệ thống
   */
  static async getSystemNotifications(userId, page = 1, limit = 20) {
    return this.getNotificationsByType(userId, 'system', page, limit);
  }

  /**
   * Lấy thông báo khuyến mãi
   */
  static async getPromotionNotifications(userId, page = 1, limit = 20) {
    return this.getNotificationsByType(userId, 'promotion', page, limit);
  }
}

// Export singleton instance
export const notificationApiService = NotificationApiService;
