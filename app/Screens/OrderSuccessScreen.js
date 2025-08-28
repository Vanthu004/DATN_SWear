import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import { useNavigation, useRoute } from "@react-navigation/native";
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import React, { useEffect } from "react";
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { ROUTES } from "../constants/routes";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../hooks/useNotifications";

const OrderSuccessScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { orderId } = route.params || {};
  const { userInfo } = useAuth();
  const { sendOrderSuccessNotification } = useNotifications(userInfo?._id);

  useEffect(() => {
    //console.log("id đơn hàng.......",orderId);
    //console.log("userInfo:", userInfo);
    
    // Gửi thông báo đặt hàng thành công - chỉ khi có đủ thông tin
    if (orderId && userInfo?._id) {
      //console.log("Sending order success notification...");
      try {
        sendOrderSuccessNotification({
          orderId: orderId,
          userId: userInfo._id,
          timestamp: new Date().toISOString(),
        });
        console.log("Order success notification sent successfully");
      } catch (error) {
        console.error("Error sending order success notification:", error);
      }
    } else {
      if (!orderId) {
        console.log("No orderId provided, skipping notification");
      }
      if (!userInfo?._id) {
        console.log("No userId available, skipping notification");
      }
    }

    Toast.show({
      type: "success",
      text1: "Đặt hàng thành công!",
      text2: "Bạn sẽ nhận được Email xác nhận.",
      position: "top",
      visibilityTime: 2500,
    });
  }, [orderId, userInfo?._id]);

  return (
    <View style={styles.container}>
      {/* Top blue area with illustration */}
      <View style={styles.topBlue}>
        <Image
          source={require("../../assets/images/order-success.png")}
          style={styles.illustration}
          resizeMode="contain"
        />
      </View>
      {/* White card area */}
      <View style={styles.card}>
        <Text style={styles.title}>Đặt hàng{"\n"}Thành công!</Text>
        <TouchableOpacity
          style={styles.detailBtn}
          onPress={() => navigation.navigate(ROUTES.ORDER_DETAIL, { orderId })}
        >
          <Text style={styles.detailBtnText}>Xem chi tiết đơn hàng</Text>
        </TouchableOpacity>
        <TouchableOpacity
        style={styles.detailBtnHome}
          onPress={() => navigation.navigate(ROUTES.HOME)}
        >
            <Text style={styles.detailBtnText}>Quay về trang chủ</Text>
        </TouchableOpacity>
        {/* Test notification buttons */}
        {/* <TestNotificationButton />
        <SimpleNotificationTest /> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2196F3",
    justifyContent: "flex-end",
  },
    backBtn: {
    position: "absolute",
    left: 16,
    top: 24,
    zIndex: 2,
  },
  backIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F6F6F6",
    justifyContent: "center",
    alignItems: "center",
  },
  topBlue: {
    flex: 1.2,
    backgroundColor: "#2196F3",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 0,
  },
  illustration: {
    width: 220,
    height: 180,
    marginBottom: -30,
  },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
    marginBottom: 12,
    marginTop: 0,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 15,
    color: "#888",
    textAlign: "center",
    marginBottom: 32,
  },
  detailBtn: {
    backgroundColor: "#8b8b8bff",
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 40,
    alignItems: "center",
    marginTop: 8,
    width: "100%",
  },
    detailBtnHome: {
    backgroundColor: "#007BFF",
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 40,
    alignItems: "center",
    marginTop: 8,
    width: "100%",
  },
  detailBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export async function registerForPushNotificationsAsync() {
  console.log('registerForPushNotificationsAsync: Starting registration...');
  let token;
  let tokenType = null;

  if (Platform.OS === 'android') {
    // ...existing android channel setup...
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
          token = expoRes.data;
          tokenType = 'expo';
          console.log('Expo push token:', token);
        } catch (expoErr) {
          console.warn('Expo token fetch failed, will try FCM fallback:', expoErr.message);
        }
      }
    } catch (err) {
      console.warn('Permission check for notifications failed, continuing to fallback if possible:', err.message);
    }

    // Fallback to FCM (for bare RN / emulator with firebase)
    if (!token) {
      try {
        const authStatus = await messaging().hasPermission ? await messaging().hasPermission() : await messaging().requestPermission();
        const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED || authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        if (enabled) {
          token = await messaging().getToken();
          tokenType = 'fcm';
          console.log('FCM token obtained:', token);
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

    // Persist locally
    await AsyncStorage.setItem('pushToken', JSON.stringify({ token, tokenType }));
    return { token, tokenType };
  } else {
    console.log('Must use physical device for Push Notifications');
    return null;
  }
}

export async function initializeNotifications(userId) {
  console.log('initializeNotifications: Called with userId:', userId);

  try {
    const tokenObj = await registerForPushNotificationsAsync();
    if (tokenObj && tokenObj.token) {
      const { token, tokenType } = tokenObj;
      if (userId) {
        await saveTokenToServer(userId, token); // make sure server expects token_type (see saveTokenToServer)
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

export default OrderSuccessScreen;
