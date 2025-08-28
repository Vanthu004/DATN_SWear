import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import axios from 'axios'; // Thêm axios cho calls sạch hơn (hoặc giữ fetch)
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const API_BASE_URL = 'http://192.168.1.9:3000/api/notifications'; // Thay bằng BE real URL (từ env nếu cần)

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
export async function registerForPushNotificationsAsync(sendTokenToServer = null) {
  console.log('registerForPushNotificationsAsync: Starting registration...');
  let token;
  let tokenType = null;

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
    // Try Expo first
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus === 'granted') {
        try {
          const expoRes = await Notifications.getExpoPushTokenAsync({ projectId: 'a2cea276-0297-4d80-b5bd-d4f21792a83a' });
          const expoToken = expoRes?.data ?? expoRes?.token ?? expoRes;
          if (expoToken) {
            token = expoToken;
            tokenType = 'expo';
            console.log('Expo push token:', token);
            // If caller provided a handler, let them send the token to server
            if (typeof sendTokenToServer === 'function') {
              try { await sendTokenToServer(token, tokenType); } catch (e) { console.warn('sendTokenToServer callback failed:', e); }
            }
          } else {
            console.warn('Expo returned no token value, will try FCM fallback');
          }
        } catch (expoErr) {
          console.warn('Expo token fetch failed, will try FCM fallback:', expoErr?.message ?? expoErr);
        }
      }
    } catch (err) {
      console.warn('Permission check for notifications failed, continuing to fallback if possible:', err?.message ?? err);
    }

    // Fallback to FCM (for bare RN / emulator with firebase)
    if (!token) {
      try {
        const authStatus = await messaging().requestPermission();
        const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED || authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        if (enabled) {
          const fcmToken = await messaging().getToken();
          console.log('[FCM] FCM Token:', fcmToken);
          if (fcmToken) {
            token = fcmToken;
            tokenType = 'fcm';
            if (typeof sendTokenToServer === 'function') {
              try { await sendTokenToServer(token, tokenType); } catch (e) { console.warn('sendTokenToServer callback failed:', e); }
            }
          }
        } else {
          console.log('FCM permission denied');
        }
      } catch (fcmErr) {
        console.error('FCM fallback failed:', fcmErr);
      }
    }

    if (!token) {
      console.log('No push token available');
      return null;
    }

    await AsyncStorage.setItem('pushToken', JSON.stringify({ token, tokenType }));
    return { token, tokenType };
  } else {
    console.log('Must use physical device for Push Notifications');
    return null;
  }
}

// Hàm lưu token lên server (sửa: dùng axios, id thay userId, nhận tokenType)
export async function saveTokenToServer(id, token, tokenType = 'expo') {
  try {
    // Guard: nếu không có id thì không gọi server
    if (!id) {
      console.warn('saveTokenToServer: missing id, aborting saveTokenToServer call. token:', token, 'tokenType:', tokenType);
      return false;
    }

    const userToken = await AsyncStorage.getItem('userToken');

    const payload = {
      id, // Sửa: dùng id thay userId để khớp BE
      token_device: token,
      token_type: tokenType,
      platform: Platform.OS,
    };

    console.log('saveTokenToServer: sending payload to', `${API_BASE_URL}/save-token`, payload);

    const response = await axios.post(`${API_BASE_URL}/save-token`, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
      timeout: 10000,
    });

    console.log('Token saved successfully:', response.data);
    return true;
  } catch (error) {
    console.error('Error saving token:', error.response ? error.response.data : error.message);
    // Retry logic nếu cần (ví dụ: sau 5s) - không tự động ở đây
    return false;
  }
}

// Hàm xóa token khỏi server (sửa: dùng DELETE đúng, id thay userId)
export async function removeTokenFromServer(id, token) {
  try {
    const userToken = await AsyncStorage.getItem('userToken');
    
    const response = await axios.delete(`${API_BASE_URL}/remove-token`, {
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
      title: title || '',
      text: body || '',
      type: data.type || 'general',
      orderId: data.orderId,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    const existingNotificationsRaw = await AsyncStorage.getItem('userNotifications');
    let notifications = existingNotificationsRaw ? JSON.parse(existingNotificationsRaw) : [];

    // Dedup: nếu notification cùng orderId hoặc cùng title+text xuất hiện trong 10s => skip
    if (notifications.length > 0) {
      const last = notifications[0];
      const lastTime = new Date(last.timestamp).getTime();
      const now = Date.now();
      const sameOrder = newNotification.orderId && last.orderId && newNotification.orderId === last.orderId;
      const sameContent = last.title === newNotification.title && last.text === newNotification.text;
      if ((sameOrder || sameContent) && (now - lastTime) < 10000) {
        console.log('Duplicate notification detected, skipping save:', newNotification);
        return;
      }
    }

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

  // Kiểm tra userId trước khi tiếp tục
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    console.warn('initializeNotifications: Invalid userId provided:', userId);
    return null;
  }

  try {
    const tokenObj = await registerForPushNotificationsAsync();
    if (tokenObj && tokenObj.token) {
      const { token, tokenType } = tokenObj;
      // Chỉ gọi saveTokenToServer khi có userId hợp lệ
      try {
        await saveTokenToServer(userId.trim(), token, tokenType); // pass tokenType now
        console.log('initializeNotifications: Token saved to server successfully');
      } catch (error) {
        console.error('initializeNotifications: Error saving token to server:', error);
        // Không throw error để không làm crash app
      }
    }

    // listeners: do NOT schedule another local notification when remote arrives.
    const foregroundSub = Notifications.addNotificationReceivedListener(notification => {
      console.log('[Expo] Notification received (foreground):', notification);
      try {
        // Save directly to storage (no re-scheduling) to avoid duplicate notifications
        saveNotificationToStorage(notification.request.content.title || '', notification.request.content.body || '', notification.request.content.data || {});
      } catch (e) {
        console.error('Error saving incoming notification:', e);
      }
    });

    const responseSub = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('[Expo] Notification response received:', response);
      // handle actions/navigation here if needed
    });

    console.log('Notifications initialized successfully with listeners');
    return { unsub: () => { foregroundSub.remove(); responseSub.remove(); } };
  } catch (error) {
    console.error('Error initializing notifications:', error);
    return null;
  }
}

// Hàm cleanup khi logout (gửi xóa token lên server nếu cần)
export async function cleanupNotifications(userId) {
  try {
    const raw = await AsyncStorage.getItem('pushToken');
    let parsed = null;
    
    // Sửa lỗi JSON Parse: thêm try-catch riêng cho JSON.parse
    if (raw) {
      try {
        parsed = JSON.parse(raw);
      } catch (parseError) {
        console.warn('Error parsing pushToken from storage, removing invalid data:', parseError);
        await AsyncStorage.removeItem('pushToken');
        return;
      }
    }
    
    if (parsed && parsed.token && userId) {
      await removeTokenFromServer(userId, parsed.token);
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