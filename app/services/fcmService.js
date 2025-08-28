import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import axios from 'axios';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const API_BASE_URL = 'http://192.168.1.9:3000/api';

/**
 * Service xử lý FCM token và push notifications
 */
export class FCMService {
  static instance = null;
  
  constructor() {
    this.token = null;
    this.tokenType = null;
    this.isInitialized = false;
  }

  static getInstance() {
    if (!FCMService.instance) {
      FCMService.instance = new FCMService();
    }
    return FCMService.instance;
  }

  /**
   * Khởi tạo service
   */
  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Tạo Android channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
          enableVibrate: true,
          showBadge: true,
        });
      }

      this.isInitialized = true;
      console.log('[FCM] Service initialized successfully');
    } catch (error) {
      console.error('[FCM] Error initializing service:', error);
    }
  }

  /**
   * Đăng ký push notifications và lấy token
   */
  async registerForPushNotifications(userId, sendTokenToServer = null) {
    if (!Device.isDevice) {
      console.log('[FCM] Must use physical device for Push Notifications');
      return null;
    }

    try {
      // Thử lấy Expo token trước
      const expoToken = await this.getExpoToken();
      if (expoToken) {
        this.token = expoToken;
        this.tokenType = 'expo';
        console.log('[FCM] Expo token obtained:', expoToken);
      } else {
        // Fallback sang FCM
        const fcmToken = await this.getFCMToken();
        if (fcmToken) {
          this.token = fcmToken;
          this.tokenType = 'fcm';
          console.log('[FCM] FCM token obtained:', fcmToken);
        }
      }

      if (this.token) {
        // Lưu token vào storage
        await this.saveTokenToStorage();
        
        // Gửi token lên server nếu có callback
        if (typeof sendTokenToServer === 'function') {
          try {
            await sendTokenToServer(this.token, this.tokenType);
          } catch (error) {
            console.warn('[FCM] sendTokenToServer callback failed:', error);
          }
        }

        // Gửi token lên server
        if (userId) {
          await this.saveTokenToServer(userId);
        }

        return { token: this.token, tokenType: this.tokenType };
      }

      console.log('[FCM] No push token available');
      return null;
    } catch (error) {
      console.error('[FCM] Error registering for push notifications:', error);
      return null;
    }
  }

  /**
   * Lấy Expo token
   */
  async getExpoToken() {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus === 'granted') {
        const expoRes = await Notifications.getExpoPushTokenAsync({ 
          projectId: 'a2cea276-0297-4d80-b5bd-d4f21792a83a' 
        });
        return expoRes?.data ?? expoRes?.token ?? expoRes;
      }
    } catch (error) {
      console.warn('[FCM] Error getting Expo token:', error);
    }
    return null;
  }

  /**
   * Lấy FCM token
   */
  async getFCMToken() {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED || 
                     authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      
      if (enabled) {
        const fcmToken = await messaging().getToken();
        return fcmToken;
      } else {
        console.log('[FCM] FCM permission denied');
      }
    } catch (error) {
      console.error('[FCM] Error getting FCM token:', error);
    }
    return null;
  }

  /**
   * Lưu token vào AsyncStorage
   */
  async saveTokenToStorage() {
    try {
      const tokenData = {
        token: this.token,
        tokenType: this.tokenType,
        timestamp: Date.now()
      };
      await AsyncStorage.setItem('pushToken', JSON.stringify(tokenData));
      console.log('[FCM] Token saved to storage');
    } catch (error) {
      console.error('[FCM] Error saving token to storage:', error);
    }
  }

  /**
   * Lưu token lên server
   */
  async saveTokenToServer(userId) {
    try {
      // Kiểm tra userId và token trước khi gọi API
      if (!userId || typeof userId !== 'string' || userId.trim() === '') {
        console.warn('[FCM] Invalid userId for server save:', userId);
        return false;
      }

      if (!this.token || typeof this.token !== 'string' || this.token.trim() === '') {
        console.warn('[FCM] Invalid token for server save:', this.token);
        return false;
      }

      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        console.warn('[FCM] No user token available for server save');
        return false;
      }

      // Thống nhất format với NotificationApiService
      const payload = {
        userId: userId.trim(),
        expo_push_token: this.token.trim(),
        push_token_type: this.tokenType || 'expo',
        platform: Platform.OS,
        timestamp: new Date().toISOString()
      };

      console.log('[FCM] Sending token to server:', payload);

      const response = await axios.post(`${API_BASE_URL}/notifications/save-token`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        timeout: 10000,
      });

      console.log('[FCM] Token saved to server successfully:', response.data);
      return true;
    } catch (error) {
      console.error('[FCM] Error saving token to server:', error.response ? error.response.data : error.message);
      return false;
    }
  }

  /**
   * Xóa token khỏi server
   */
  async removeTokenFromServer(userId) {
    try {
      if (!userId || !this.token) {
        console.warn('[FCM] Missing userId or token for server removal');
        return false;
      }

      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        console.warn('[FCM] No user token available for server removal');
        return false;
      }

      const response = await axios.delete(`${API_BASE_URL}/notifications/remove-token`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        data: {
          userId: userId,
          expo_push_token: this.token,
        },
      });

      console.log('[FCM] Token removed from server successfully:', response.data);
      return true;
    } catch (error) {
      console.error('[FCM] Error removing token from server:', error.response ? error.response.data : error.message);
      return false;
    }
  }

  /**
   * Cleanup khi logout
   */
  async cleanup(userId) {
    try {
      // Xóa token khỏi server
      if (userId && this.token) {
        await this.removeTokenFromServer(userId);
      }

      // Xóa token khỏi storage
      await AsyncStorage.removeItem('pushToken');
      
      // Reset instance
      this.token = null;
      this.tokenType = null;
      this.isInitialized = false;
      
      console.log('[FCM] Cleanup completed successfully');
    } catch (error) {
      console.error('[FCM] Error during cleanup:', error);
    }
  }

  /**
   * Lấy token hiện tại
   */
  getCurrentToken() {
    return { token: this.token, tokenType: this.tokenType };
  }

  /**
   * Kiểm tra xem có token không
   */
  hasToken() {
    return !!this.token;
  }
}

// Export singleton instance
export const fcmService = FCMService.getInstance();
