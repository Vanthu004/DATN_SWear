import messaging from '@react-native-firebase/messaging';
import axios from 'axios';
import { useEffect } from 'react';
import { Alert, Platform } from 'react-native';

// Cấu hình hiển thị thông báo foreground
messaging().setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const setupPushNotifications = (userId) => {
  useEffect(() => {
    console.log('[FCM] Bắt đầu setup cho user:', userId);

    const registerForPushNotificationsAsync = async () => {
      if (!Platform.OS === 'web') { // Kiểm tra không phải web, ưu tiên thiết bị
        try {
          // Yêu cầu quyền thông báo
          const authStatus = await messaging().requestPermission();
          const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

          if (enabled) {
            console.log('[FCM] Quyền thông báo được cấp');
            // Lấy FCM Token
            const fcmToken = await messaging().getToken();
            console.log('[FCM] FCM Token:', fcmToken); // In token ra console

            // Gửi token lên server
            try {
              await axios.post('http://192.168.1.9:3000/api/notifications/save-token', {
                id: userId, // Sử dụng id thay userId, khớp với backend
                token_device: fcmToken, // Gửi token_device thay expoPushToken
              });
              console.log('[FCM] Token đã gửi lên server');
            } catch (error) {
              console.error('[FCM] Lỗi khi gửi token:', error.response ? error.response.data : error.message);
            }
          } else {
            console.log('[FCM] Quyền thông báo bị từ chối');
          }
        } catch (error) {
          console.error('[FCM] Lỗi khi lấy FCM Token:', error);
        }
      } else {
        console.log('[FCM] Không hỗ trợ trên web');
      }

      // Cấu hình kênh thông báo cho Android
      if (Platform.OS === 'android') {
        await messaging().createChannel('default', {
          name: 'default',
          importance: messaging.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
    };

    registerForPushNotificationsAsync();

    // Lắng nghe thông báo khi app đang mở
    const foregroundSub = messaging().onMessage(async (remoteMessage) => {
      console.log('[FCM] Nhận thông báo foreground:', remoteMessage);
      Alert.alert(remoteMessage.notification.title, remoteMessage.notification.body);
    });

    // Lắng nghe khi user nhấn vào thông báo
    const responseSub = messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('[FCM] User click vào thông báo:', remoteMessage);
      Alert.alert("Thông báo", "Bạn đã click vào thông báo!");
    });

    // Lắng nghe khi app mở từ trạng thái killed
    messaging().getInitialNotification().then((remoteMessage) => {
      if (remoteMessage) {
        console.log('[FCM] App mở từ thông báo killed:', remoteMessage);
      }
    });

    return () => {
      foregroundSub();
      responseSub();
    };
  }, [userId]);
};