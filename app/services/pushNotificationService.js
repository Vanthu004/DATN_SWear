import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios'; // Giả định dùng axios cho API calls

const API_BASE_URL = 'http://192.168.37.5:3000/api/notifications'; // Config chung từ BE

// Hàm gửi push notification qua BE (single user)
export const sendPushNotification = async (userId, title, body, data = {}) => {
  try {
    const userToken = await AsyncStorage.getItem('userToken');
    const response = await axios.post(`${API_BASE_URL}/send-notification`, {
      id: userId,
      title,
      body,
      data,
    }, {
      headers: {
        'Authorization': `Bearer ${userToken}`,
      },
    });
    console.log('Push notification sent via server:', response.data);
    return { success: true, result: response.data };
  } catch (error) {
    console.error('Error sending push notification via server:', error.response ? error.response.data : error.message);
    return { success: false, error: error.message };
  }
};

// Hàm gửi cho multiple users qua BE
export const sendPushNotificationToMultipleTokens = async (userIds, title, body, data = {}) => {
  try {
    const userToken = await AsyncStorage.getItem('userToken');
    const response = await axios.post(`${API_BASE_URL}/send-bulk-notification`, {
      userIds,
      title,
      body,
      data,
    }, {
      headers: {
        'Authorization': `Bearer ${userToken}`,
      },
    });
    console.log('Multiple push notifications sent via server:', response.data);
    return { success: true, result: response.data };
  } catch (error) {
    console.error('Error sending multiple push notifications via server:', error.response ? error.response.data : error.message);
    return { success: false, error: error.message };
  }
};

// Hàm gửi order notification (tùy chỉnh nếu cần, giả định BE có endpoint riêng; nếu không, dùng sendPushNotification với data)
export const sendOrderNotificationFromServer = async (userId, orderId, notificationType, additionalData = {}) => {
  // Nếu BE không có endpoint riêng, map thành title/body/data
  let title = '';
  let body = '';
  switch (notificationType) {
    case 'new_order': title = 'Đơn hàng mới'; body = `Đơn hàng #${orderId} đã được tạo.`; break;
    // Thêm cases khác
    default: title = 'Thông báo đơn hàng'; body = `Cập nhật về đơn hàng #${orderId}.`;
  }
  return sendPushNotification(userId, title, body, { orderId, notificationType, ...additionalData });
};

// Hàm validate token (gọi BE nếu BE có endpoint validate; nếu không, giữ Expo test nhưng chỉ cho debug)
export const validatePushToken = async (token, tokenType = 'expo') => {
  // Nếu BE có logic validate, gọi BE; tạm giữ cho Expo
  if (tokenType === 'expo') {
    // Giữ code gốc, nhưng chỉ dùng debug
    try {
      // Code gốc fetch Expo API...
    } catch (error) { /* ... */ }
  } else {
    // Cho FCM, dùng Firebase admin ở BE
    console.warn('Validate FCM nên gọi BE');
    return { valid: false, error: 'Validate FCM qua BE' };
  }
};

// Hàm get stats (nếu BE có /stats, giữ; nếu không, xóa hoặc implement ở BE)
export const getNotificationStats = async () => {
  try {
    const userToken = await AsyncStorage.getItem('userToken');
    const response = await axios.get(`${API_BASE_URL}/stats`, {
      headers: { 'Authorization': `Bearer ${userToken}` },
    });
    return { success: true, stats: response.data };
  } catch (error) {
    console.error('Error getting notification stats:', error);
    return { success: false, error: error.message };
  }
};