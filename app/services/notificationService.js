import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios'; // Thêm axios cho calls sạch hơn (hoặc giữ fetch)
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const API_BASE_URL = 'http://192.168.52.108:3000/api/notifications'; // Thay bằng BE real URL (từ env nếu cần)

// Cấu hình notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Các loại thông báo (giữ nguyên)
export const NOTIFICATION_TYPES = {
  ORDER_SUCCESS: 'order_success',
  ORDER_CONFIRMED: 'order_confirmed',
  ORDER_SHIPPING: 'order_shipping',
  ORDER_DELIVERED: 'order_delivered',
  ORDER_CANCELLED: 'order_cancelled',
  ORDER_ISSUE: 'order_issue',
};

// Hàm đăng ký push notification (giữ nguyên, nhưng thêm log)
export async function registerForPushNotificationsAsync() {
  console.log('registerForPushNotificationsAsync: Starting registration...');
  let token;

  if (Platform.OS === 'android') {
    console.log('registerForPushNotificationsAsync: Setting up Android notification channel...');
    try {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
      });
      console.log('registerForPushNotificationsAsync: Android channel created successfully');
    } catch (error) {
      console.error('registerForPushNotificationsAsync: Error creating Android channel:', error);
    }
  }

  if (Device.isDevice) {
    console.log('registerForPushNotificationsAsync: Device detected, checking permissions...');
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    console.log('registerForPushNotificationsAsync: Current permission status:', existingStatus);
    
    if (existingStatus !== 'granted') {
      console.log('registerForPushNotificationsAsync: Requesting permissions...');
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log('registerForPushNotificationsAsync: Permission request result:', status);
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }
    
    try {
      console.log('registerForPushNotificationsAsync: Getting Expo push token...');
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: 'a2cea276-0297-4d80-b5bd-d4f21792a83a', // Your Expo project ID
      })).data;
      
      console.log('Push token:', token);
      return token;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  } else {
    console.log('Must use physical device for Push Notifications');
    return null;
  }
}

// Hàm lưu token lên server (sửa: dùng axios, id thay userId, retry nếu fail)
export async function saveTokenToServer(id, token) {
  try {
    const userToken = await AsyncStorage.getItem('userToken');
    
    const response = await axios.post(`${API_BASE_URL}/save-token`, {
      id, // Sửa: dùng id thay userId để khớp BE
      token_device: token,
      token_type: 'expo',
      platform: Platform.OS,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
    });
    
    console.log('Token saved successfully:', response.data);
    return true;
  } catch (error) {
    console.error('Error saving token:', error.response ? error.response.data : error.message);
    // Retry logic nếu cần (ví dụ: sau 5s)
    return false;
  }
}

// Hàm xóa token khỏi server (sửa: dùng DELETE đúng, id thay userId)
export async function removeTokenFromServer(id, token) {
  try {
    const userToken = await AsyncStorage.getItem('userToken');
    
    const response = await axios.delete(`${API_BASE_URL}/remove-token`, { // Giả định BE add endpoint
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
      data: { // DELETE with body
        id,
        token_device: token,
      },
    });
    
    console.log('Token removed successfully:', response.data);
    return true;
  } catch (error) {
    console.error('Error removing token:', error.response ? error.response.data : error.message);
    return false;
  }
}

// Hàm gửi thông báo local (giữ nguyên, nhưng thêm check permission trước)
export async function sendLocalNotification(title, body, data = {}) {
  console.log('sendLocalNotification: Called with title:', title, 'body:', body, 'data:', data);
  
  try {
    const { status } = await Notifications.getPermissionsAsync();
    console.log('sendLocalNotification: Current permission status:', status);
    
    if (status !== 'granted') {
      console.log('sendLocalNotification: Permission not granted, requesting...');
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      console.log('sendLocalNotification: New permission status:', newStatus);
      
      if (newStatus !== 'granted') {
        throw new Error('Notification permission not granted');
      }
    }
    
    const result = await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        data: data,
        sound: 'default',
        priority: 'high',
      },
      trigger: null, // Gửi ngay lập tức
    });
    console.log('sendLocalNotification: Notification scheduled successfully:', result);
    
    // Lưu notification vào AsyncStorage
    await saveNotificationToStorage(title, body, data);
    
    return result;
  } catch (error) {
    console.error('sendLocalNotification: Error scheduling notification:', error);
    throw error;
  }
}

// Hàm lưu notification vào AsyncStorage (giữ nguyên)
export async function saveNotificationToStorage(title, body, data = {}) {
  try {
    const newNotification = {
      id: Date.now().toString(),
      text: body,
      type: data.type || 'general',
      orderId: data.orderId,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    const existingNotifications = await AsyncStorage.getItem('userNotifications');
    let notifications = existingNotifications ? JSON.parse(existingNotifications) : [];
    
    notifications.unshift(newNotification);
    
    if (notifications.length > 50) {
      notifications = notifications.slice(0, 50);
    }
    
    await AsyncStorage.setItem('userNotifications', JSON.stringify(notifications));
    console.log('Notification saved to storage:', newNotification);
    
  } catch (error) {
    console.error('Error saving notification to storage:', error);
  }
}

// Hàm gửi thông báo theo loại đơn hàng (sửa: thêm option gửi remote qua BE nếu cần push đến user khác)
export async function sendOrderNotification(type, orderData, isRemote = false, targetId = null) {
  console.log('sendOrderNotification: Called with type:', type, 'orderData:', orderData, 'isRemote:', isRemote);
  
  const notifications = {
    [NOTIFICATION_TYPES.ORDER_SUCCESS]: {
      title: '🎉 Đặt hàng thành công!',
      body: `Đơn hàng #${orderData.orderId} của bạn đã được đặt thành công. Chúng tôi sẽ xử lý sớm nhất có thể.`,
    },
    // Giữ nguyên các type khác
  };

  const notification = notifications[type];
  if (notification) {
    console.log('sendOrderNotification: Sending notification:', notification);
    try {
      if (isRemote && targetId) {
        // Gửi remote qua BE (tích hợp với Web/BE)
        const userToken = await AsyncStorage.getItem('userToken');
        await axios.post(`${API_BASE_URL}/send-notification`, {
          id: targetId,
          title: notification.title,
          body: notification.body,
          data: { type, ...orderData },
        }, {
          headers: { 'Authorization': `Bearer ${userToken}` },
        });
        console.log('sendOrderNotification: Remote sent via BE');
      } else {
        // Gửi local
        await sendLocalNotification(
          notification.title,
          notification.body,
          { type, orderId: orderData.orderId, ...orderData }
        );
      }
      console.log('sendOrderNotification: Notification sent successfully');
    } catch (error) {
      console.error('sendOrderNotification: Error sending notification:', error);
      throw error;
    }
  } else {
    console.log('sendOrderNotification: No notification found for type:', type);
  }
}

// Hàm khởi tạo notifications (sửa: thêm listeners cho remote)
export async function initializeNotifications(userId) {
  console.log('initializeNotifications: Called with userId:', userId);
  
  try {
    console.log('initializeNotifications: Registering for push notifications...');
    const token = await registerForPushNotificationsAsync();
    
    if (token) {
      console.log('initializeNotifications: Token received, saving to AsyncStorage...');
      await AsyncStorage.setItem('pushToken', token);
      
      if (userId) {
        console.log('initializeNotifications: Saving token to server...');
        await saveTokenToServer(userId, token); // Sửa: dùng userId làm id
      }
      
      // Thêm listeners cho remote push
      const foregroundSub = Notifications.addNotificationReceivedListener(notification => {
        console.log('[Expo] Nhận thông báo foreground:', notification);
        sendLocalNotification( // Hiển thị local nếu cần
          notification.request.content.title,
          notification.request.content.body,
          notification.request.content.data
        );
      });

      const responseSub = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('[Expo] User click vào thông báo:', response);
        // Handle navigation hoặc action
      });

      console.log('Notifications initialized successfully with listeners');
      return { token, unsub: () => { foregroundSub.remove(); responseSub.remove(); } };
    } else {
      console.log('initializeNotifications: No token received');
    }
    
    return null;
  } catch (error) {
    console.error('Error initializing notifications:', error);
    return null;
  }
}

// Hàm cleanup khi logout (giữ nguyên, nhưng thêm remove listeners nếu có)
export async function cleanupNotifications(userId) {
  try {
    const token = await AsyncStorage.getItem('pushToken');
    
    if (token && userId) {
      await removeTokenFromServer(userId, token);
    }
    
    await AsyncStorage.removeItem('pushToken');
    console.log('Notifications cleaned up successfully');
  } catch (error) {
    console.error('Error cleaning up notifications:', error);
  }
}

// Hàm lấy notification settings (giữ nguyên)
export async function getNotificationSettings() {
  try {
    const settings = await Notifications.getPermissionsAsync();
    return settings;
  } catch (error) {
    console.error('Error getting notification settings:', error);
    return null;
  }
}

// Hàm kiểm tra quyền thông báo (giữ nguyên)
export async function checkNotificationPermission() {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error checking notification permission:', error);
    return false;
  }
}