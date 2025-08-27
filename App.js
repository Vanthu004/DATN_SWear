// App.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Provider } from "react-redux";
import { AuthProvider } from "./app/context/AuthContext";
import AppNavigator from "./app/navigation/AppNavigator";
import { store } from "./app/reudx/store";
import {
  initializeNotifications,
  registerForPushNotificationsAsync,
  saveTokenToServer
} from './app/services/notificationService';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function App() {
  useEffect(() => {
    let unsubFn = null;

    (async () => {
      try {
        // Lấy userId từ storage / context / redux tùy app của bạn
        const rawUser = await AsyncStorage.getItem('user');
        const user = rawUser ? JSON.parse(rawUser) : null;
        const userId = user?.id || user?.userId;
        if (!userId) {
          console.warn('No userId available — skipping push registration');
          return;
        }

        // Gọi register và truyền callback để lưu token kèm userId lên server
        await registerForPushNotificationsAsync(async (token, tokenType) => {
          try {
            await saveTokenToServer(userId, token, tokenType);
          } catch (e) {
            console.warn('Failed to save token to server:', e);
          }
        });

        // Khởi tạo listeners, trả về hàm unsubscribe
        const init = await initializeNotifications(userId);
        unsubFn = init?.unsub ?? null;
      } catch (err) {
        console.error('Push setup error:', err);
      }
    })();

    return () => {
      // cleanup khi component unmount hoặc logout
      if (typeof unsubFn === 'function') unsubFn();
      // nếu muốn xóa token trên server khi logout, gọi cleanupNotifications(userId)
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
