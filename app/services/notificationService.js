import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Cấu hình notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Các loại thông báo
export const NOTIFICATION_TYPES = {
  ORDER_SUCCESS: 'order_success',
  ORDER_CONFIRMED: 'order_confirmed',
  ORDER_SHIPPING: 'order_shipping',
  ORDER_DELIVERED: 'order_delivered',
  ORDER_CANCELLED: 'order_cancelled',
  ORDER_ISSUE: 'order_issue',
};

// Hàm đăng ký push notification
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

// Hàm lưu token lên server
export async function saveTokenToServer(userId, token) {
  try {
    const userToken = await AsyncStorage.getItem('userToken');
    
    const response = await fetch('https://your-api-url.com/api/notifications/save-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        userId: userId,
        token_device: token,
        token_type: 'expo',
        platform: Platform.OS,
      }),
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Token saved successfully:', result);
      return true;
    } else {
      console.error('Failed to save token:', response.status);
      return false;
    }
  } catch (error) {
    console.error('Error saving token:', error);
    return false;
  }
}

// Hàm xóa token khỏi server
export async function removeTokenFromServer(userId, token) {
  try {
    const userToken = await AsyncStorage.getItem('userToken');
    
    const response = await fetch('https://your-api-url.com/api/notifications/remove-token', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        userId: userId,
        token_device: token,
      }),
    });
    
    if (response.ok) {
      console.log('Token removed successfully');
      return true;
    } else {
      console.error('Failed to remove token:', response.status);
      return false;
    }
  } catch (error) {
    console.error('Error removing token:', error);
    return false;
  }
}

// Hàm gửi thông báo local
export async function sendLocalNotification(title, body, data = {}) {
  console.log('sendLocalNotification: Called with title:', title, 'body:', body, 'data:', data);
  
  try {
    // Kiểm tra quyền thông báo trước khi gửi
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
    
    // Lưu notification vào AsyncStorage để hiển thị trong NotificationsScreen
    await saveNotificationToStorage(title, body, data);
    
    return result;
  } catch (error) {
    console.error('sendLocalNotification: Error scheduling notification:', error);
    throw error;
  }
}

// Hàm lưu notification vào AsyncStorage
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

    // Lấy notifications hiện tại
    const existingNotifications = await AsyncStorage.getItem('userNotifications');
    let notifications = [];
    
    if (existingNotifications) {
      notifications = JSON.parse(existingNotifications);
    }
    
    // Thêm notification mới vào đầu danh sách
    notifications.unshift(newNotification);
    
    // Giới hạn số lượng notifications (giữ 50 notifications gần nhất)
    if (notifications.length > 50) {
      notifications = notifications.slice(0, 50);
    }
    
    // Lưu lại vào AsyncStorage
    await AsyncStorage.setItem('userNotifications', JSON.stringify(notifications));
    console.log('Notification saved to storage:', newNotification);
    
  } catch (error) {
    console.error('Error saving notification to storage:', error);
  }
}

// Hàm gửi thông báo theo loại đơn hàng
export async function sendOrderNotification(type, orderData) {
  console.log('sendOrderNotification: Called with type:', type, 'orderData:', orderData);
  
  const notifications = {
    [NOTIFICATION_TYPES.ORDER_SUCCESS]: {
      title: '🎉 Đặt hàng thành công!',
      body: `Đơn hàng #${orderData.orderId} của bạn đã được đặt thành công. Chúng tôi sẽ xử lý sớm nhất có thể.`,
    },
    [NOTIFICATION_TYPES.ORDER_CONFIRMED]: {
      title: '✅ Đơn hàng đã được xác nhận',
      body: `Đơn hàng #${orderData.orderId} đã được xác nhận và đang được chuẩn bị.`,
    },
    [NOTIFICATION_TYPES.ORDER_SHIPPING]: {
      title: '🚚 Đơn hàng đang giao',
      body: `Đơn hàng #${orderData.orderId} đã được shipper nhận và đang trên đường giao đến bạn.`,
    },
    [NOTIFICATION_TYPES.ORDER_DELIVERED]: {
      title: '📦 Giao hàng thành công',
      body: `Đơn hàng #${orderData.orderId} đã được giao thành công. Cảm ơn bạn đã mua sắm!`,
    },
    [NOTIFICATION_TYPES.ORDER_CANCELLED]: {
      title: '❌ Đơn hàng đã bị hủy',
      body: `Đơn hàng #${orderData.orderId} đã bị hủy. Vui lòng liên hệ hỗ trợ nếu có thắc mắc.`,
    },
    [NOTIFICATION_TYPES.ORDER_ISSUE]: {
      title: '⚠️ Vấn đề với đơn hàng',
      body: `Đơn hàng #${orderData.orderId} gặp vấn đề. Chúng tôi sẽ liên hệ bạn sớm nhất.`,
    },
  };

  const notification = notifications[type];
  if (notification) {
    console.log('sendOrderNotification: Sending notification:', notification);
    try {
      await sendLocalNotification(
        notification.title,
        notification.body,
        {
          type: type,
          orderId: orderData.orderId,
          ...orderData,
        }
      );
      console.log('sendOrderNotification: Notification sent successfully');
    } catch (error) {
      console.error('sendOrderNotification: Error sending notification:', error);
      throw error;
    }
  } else {
    console.log('sendOrderNotification: No notification found for type:', type);
  }
}

// Hàm khởi tạo notifications
export async function initializeNotifications(userId) {
  console.log('initializeNotifications: Called with userId:', userId);
  
  try {
    // Đăng ký push notification
    console.log('initializeNotifications: Registering for push notifications...');
    const token = await registerForPushNotificationsAsync();
    
    if (token) {
      console.log('initializeNotifications: Token received, saving to AsyncStorage...');
      // Lưu token vào AsyncStorage
      await AsyncStorage.setItem('pushToken', token);
      
      // Lưu token lên server
      if (userId) {
        console.log('initializeNotifications: Saving token to server...');
        await saveTokenToServer(userId, token);
      }
      
      console.log('Notifications initialized successfully');
      return token;
    } else {
      console.log('initializeNotifications: No token received');
    }
    
    return null;
  } catch (error) {
    console.error('Error initializing notifications:', error);
    return null;
  }
}

// Hàm cleanup khi logout
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

// Hàm lấy notification settings
export async function getNotificationSettings() {
  try {
    const settings = await Notifications.getPermissionsAsync();
    return settings;
  } catch (error) {
    console.error('Error getting notification settings:', error);
    return null;
  }
}

// Hàm kiểm tra quyền thông báo
export async function checkNotificationPermission() {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error checking notification permission:', error);
    return false;
  }
}
