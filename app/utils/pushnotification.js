import messaging from '@react-native-firebase/messaging';
import axios from 'axios';
import * as Notifications from 'expo-notifications'; // Thêm cho Expo
import { useEffect } from 'react';
import { Alert, Platform } from 'react-native';

const API_BASE_URL = 'http://192.168.1.9:3000/api/notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const setupPushNotifications = (userId) => {
  useEffect(() => {
    console.log('[Push] Bắt đầu setup cho user:', userId);

    const registerForPushNotificationsAsync = async () => {
      if (Platform.OS === 'web') {
        console.log('[Push] Không hỗ trợ trên web');
        return;
      }

      try {
        // Ưu tiên Expo nếu available
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') {
          console.log('[Push] Quyền thông báo bị từ chối');
          return;
        }

        // Lấy Expo token (cho Expo app)
        const expoProjectId = 'your-expo-project-id'; // Config từ app.json
        const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync({ projectId: expoProjectId });
        console.log('[Expo] Expo Push Token:', expoPushToken);

        // Gửi Expo token đến BE
        try {
          if (!expoPushToken) {
            console.warn('[Expo] Không có expoPushToken sẽ không gửi lên server');
          } else {
            const res = await axios.post(`${API_BASE_URL}/save-token`, {
              id: userId,
              token_device: expoPushToken,
              token_type: 'expo',
            }, { timeout: 10000 });
            console.log('[Expo] Token đã gửi lên server, response.status =', res.status, 'data =', res.data);
          }
        } catch (err) {
          console.error('[Expo] Lỗi khi gửi token lên server:', err?.response?.data ?? err.message ?? err);
        }

      } catch (expoError) {
        console.warn('[Expo] Lỗi lấy Expo token, fallback sang FCM:', expoError);
        
        // Fallback FCM nếu Expo fail (cho non-Expo RN)
        const authStatus = await messaging().requestPermission();
        const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED || authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        if (enabled) {
          const fcmToken = await messaging().getToken();
          console.log('[FCM] FCM Token:', fcmToken);

          await axios.post(`${API_BASE_URL}/save-token`, {
            id: userId,
            token_device: fcmToken,
            token_type: 'fcm',
          });
          console.log('[FCM] Token đã gửi lên server');
        }
      }

      // Kênh Android (cho cả Expo và FCM)
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
    };

    registerForPushNotificationsAsync();

    // Lắng nghe foreground (Expo)
    const expoForegroundSub = Notifications.addNotificationReceivedListener(notification => {
      console.log('[Expo] Nhận thông báo foreground:', notification);
      Alert.alert(notification.request.content.title, notification.request.content.body);
    });

    // Lắng nghe response (Expo)
    const expoResponseSub = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('[Expo] User click vào thông báo:', response);
      Alert.alert("Thông báo", "Bạn đã click vào thông báo!");
    });

    // Fallback FCM listeners nếu cần
    const fcmForegroundSub = messaging().onMessage(async remoteMessage => {
      console.log('[FCM] Nhận thông báo foreground:', remoteMessage);
      Alert.alert(remoteMessage.notification?.title, remoteMessage.notification?.body);
    });

    messaging().getInitialNotification().then(remoteMessage => {
      if (remoteMessage) {
        console.log('[FCM] App mở từ thông báo killed:', remoteMessage);
      }
    });

    const fcmResponseSub = messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('[FCM] User click vào thông báo:', remoteMessage);
      Alert.alert("Thông báo", "Bạn đã click vào thông báo!");
    });

    return () => {
      expoForegroundSub.remove();
      expoResponseSub.remove();
      fcmForegroundSub();
      fcmResponseSub();
    };
  }, [userId]);
};