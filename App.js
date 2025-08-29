// App.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Provider } from 'react-redux';
import { AuthProvider } from './app/context/AuthContext';
import AppNavigator from './app/navigation/AppNavigator';
import { store } from './app/reudx/store';
import { fcmService } from './app/services/fcmService';

// Cấu hình notification handler - chỉ set một lần ở đây
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function App() {
  useEffect(() => {
    let unsubFn = null;

    (async () => {
      try {
        // Khởi tạo FCM service
        await fcmService.initialize();
        console.log('[App] FCM service initialized successfully');

        // Lấy userId từ storage - kiểm tra cả user và userInfo
        const rawUser = await AsyncStorage.getItem('user');
        const rawUserInfo = await AsyncStorage.getItem('userInfo');
        
        let user = null;
        if (rawUser) {
          try {
            user = JSON.parse(rawUser);
          } catch (e) {
            console.warn('[App] Error parsing user from storage:', e);
          }
        }
        
        if (!user && rawUserInfo) {
          try {
            user = JSON.parse(rawUserInfo);
          } catch (e) {
            console.warn('[App] Error parsing userInfo from storage:', e);
          }
        }
        
        const userId = user?._id || user?.id || user?.userId;
        
        if (!userId) {
          console.warn('[App] No userId available — skipping push registration');
          return;
        }

        console.log('[App] User ID found:', userId);

        // Đăng ký push notifications với FCM service
        const tokenObj = await fcmService.registerForPushNotifications(userId);
        
        if (tokenObj) {
          console.log('[App] Push notifications registered successfully:', tokenObj);
          
          // Khởi tạo listeners
          const foregroundSub = Notifications.addNotificationReceivedListener(notification => {
            console.log('[App] Notification received (foreground):', notification);
          });

          const responseSub = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('[App] Notification response received:', response);
          });

          unsubFn = () => {
            foregroundSub.remove();
            responseSub.remove();
          };
        } else {
          console.warn('[App] Failed to register push notifications');
        }
      } catch (err) {
        console.error('[App] Push setup error:', err);
      }
    })();

    return () => {
      // Cleanup khi component unmount
      if (typeof unsubFn === 'function') {
        unsubFn();
      }
    };
  }, []);

  return (
    <Provider store={store}>
      <AuthProvider>
        <SafeAreaProvider>
          <AppNavigator />
          <Toast />
        </SafeAreaProvider>
      </AuthProvider>
    </Provider>
  );
}

export default App;
