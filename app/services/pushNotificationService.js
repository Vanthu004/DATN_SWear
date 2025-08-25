import AsyncStorage from '@react-native-async-storage/async-storage';

// Expo Push API endpoint
const EXPO_PUSH_API_URL = 'https://exp.host/--/api/v2/push/send';

// Hàm gửi push notification thông qua Expo Push API
export const sendPushNotification = async (expoPushToken, title, body, data = {}) => {
  try {
    const message = {
      to: expoPushToken,
      sound: 'default',
      title: title,
      body: body,
      data: data,
    };

    const response = await fetch(EXPO_PUSH_API_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();
    
    if (result.data?.status === 'error') {
      console.error('Push notification error:', result.data.message);
      return { success: false, error: result.data.message };
    }

    console.log('Push notification sent successfully:', result);
    return { success: true, result };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false, error: error.message };
  }
};

// Hàm gửi thông báo cho nhiều tokens cùng lúc
export const sendPushNotificationToMultipleTokens = async (tokens, title, body, data = {}) => {
  try {
    const messages = tokens.map(token => ({
      to: token,
      sound: 'default',
      title: title,
      body: body,
      data: data,
    }));

    const response = await fetch(EXPO_PUSH_API_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    const result = await response.json();
    
    if (Array.isArray(result)) {
      const errors = result.filter(item => item.data?.status === 'error');
      if (errors.length > 0) {
        console.error('Some push notifications failed:', errors);
        return { success: false, errors };
      }
    }

    console.log('Multiple push notifications sent successfully:', result);
    return { success: true, result };
  } catch (error) {
    console.error('Error sending multiple push notifications:', error);
    return { success: false, error: error.message };
  }
};

// Hàm gửi thông báo đơn hàng từ server
export const sendOrderNotificationFromServer = async (userId, orderId, notificationType, additionalData = {}) => {
  try {
    const userToken = await AsyncStorage.getItem('userToken');
    
    const response = await fetch('https://your-api-url.com/api/notifications/send-order-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        userId: userId,
        orderId: orderId,
        notificationType: notificationType,
        additionalData: additionalData,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Order notification sent from server:', result);
      return { success: true, result };
    } else {
      console.error('Failed to send order notification from server:', response.status);
      return { success: false, error: 'Server error' };
    }
  } catch (error) {
    console.error('Error sending order notification from server:', error);
    return { success: false, error: error.message };
  }
};

// Hàm kiểm tra trạng thái token
export const validatePushToken = async (token) => {
  try {
    const response = await fetch(EXPO_PUSH_API_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: token,
        title: 'Test',
        body: 'Test notification',
        data: { test: true },
      }),
    });

    const result = await response.json();
    
    if (result.data?.status === 'error') {
      return { valid: false, error: result.data.message };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

// Hàm lấy thống kê thông báo
export const getNotificationStats = async () => {
  try {
    const userToken = await AsyncStorage.getItem('userToken');
    
    const response = await fetch('https://your-api-url.com/api/notifications/stats', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userToken}`,
      },
    });

    if (response.ok) {
      const result = await response.json();
      return { success: true, stats: result };
    } else {
      console.error('Failed to get notification stats:', response.status);
      return { success: false, error: 'Server error' };
    }
  } catch (error) {
    console.error('Error getting notification stats:', error);
    return { success: false, error: error.message };
  }
};
