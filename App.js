// App.js
import * as Notifications from 'expo-notifications';
import React, { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Provider } from "react-redux";
import { AuthProvider } from "./app/context/AuthContext";
import AppNavigator from "./app/navigation/AppNavigator";
import { store } from "./app/reudx/store";
import { registerForPushNotificationsAsync } from './app/utils/registerForPush';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  useEffect(() => {
    registerForPushNotificationsAsync(async (token) => {
      console.log('Expo push token:', token);
      // TODO: gửi token lên backend: await api.post('/users/me/push-token', { token });
    });
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
