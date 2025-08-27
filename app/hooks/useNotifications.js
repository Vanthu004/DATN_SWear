import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import {
  NOTIFICATION_TYPES,
  checkNotificationPermission,
  cleanupNotifications,
  initializeNotifications,
  sendOrderNotification,
} from '../services/notificationService';

export const useNotifications = (userId) => {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();
  const navigation = useNavigation();

  useEffect(() => {
    //console.log('useNotifications: Initializing with userId:', userId);
    
    // Khởi tạo notifications khi component mount
    if (userId) {
     // console.log('useNotifications: Initializing notifications...');
      initializeNotifications(userId).then((token) => {
        if (token) {
        //  console.log('useNotifications: Token received:', token);
          setExpoPushToken(token);
        } else {
         // console.log('useNotifications: No token received');
        }
      }).catch((error) => {
       // console.error('useNotifications: Error initializing:', error);
      });
    } else {
    //  console.log('useNotifications: No userId provided');
    }

    // Lắng nghe thông báo đến
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
     // console.log('Notification received:', notification);
    });

    // Lắng nghe khi user tap vào thông báo
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      //console.log('Notification response:', response);
      
      const data = response.notification.request.content.data;
      
      // Xử lý navigation dựa trên loại thông báo
      if (data.type && data.orderId) {
        switch (data.type) {
          case NOTIFICATION_TYPES.ORDER_SUCCESS:
          case NOTIFICATION_TYPES.ORDER_CONFIRMED:
          case NOTIFICATION_TYPES.ORDER_SHIPPING:
          case NOTIFICATION_TYPES.ORDER_DELIVERED:
          case NOTIFICATION_TYPES.ORDER_CANCELLED:
          case NOTIFICATION_TYPES.ORDER_ISSUE:
            // Navigate to order detail screen
            navigation.navigate('OrderDetail', { orderId: data.orderId });
            break;
          default:
            // Navigate to home or default screen
            navigation.navigate('Home');
            break;
        }
      }
    });

    return () => {
      // Cleanup listeners
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [userId, navigation]);

  // Hàm gửi thông báo đặt hàng thành công
  const sendOrderSuccessNotification = (orderData) => {
    return sendOrderNotification(NOTIFICATION_TYPES.ORDER_SUCCESS, orderData);
  };

  // Hàm gửi thông báo đơn hàng được xác nhận
  const sendOrderConfirmedNotification = (orderData) => {
    return sendOrderNotification(NOTIFICATION_TYPES.ORDER_CONFIRMED, orderData);
  };

  // Hàm gửi thông báo đơn hàng đang giao
  const sendOrderShippingNotification = (orderData) => {
    return sendOrderNotification(NOTIFICATION_TYPES.ORDER_SHIPPING, orderData);
  };

  // Hàm gửi thông báo giao hàng thành công
  const sendOrderDeliveredNotification = (orderData) => {
    return sendOrderNotification(NOTIFICATION_TYPES.ORDER_DELIVERED, orderData);
  };

  // Hàm gửi thông báo đơn hàng bị hủy
  const sendOrderCancelledNotification = (orderData) => {
    return sendOrderNotification(NOTIFICATION_TYPES.ORDER_CANCELLED, orderData);
  };

  // Hàm gửi thông báo đơn hàng có vấn đề
  const sendOrderIssueNotification = (orderData) => {
    return sendOrderNotification(NOTIFICATION_TYPES.ORDER_ISSUE, orderData);
  };

  // Hàm cleanup khi logout
  const handleLogout = async () => {
    if (userId) {
      await cleanupNotifications(userId);
    }
  };

  // Hàm kiểm tra quyền thông báo
  const checkPermission = async () => {
    return await checkNotificationPermission();
  };

  return {
    expoPushToken,
    notification,
    sendOrderSuccessNotification,
    sendOrderConfirmedNotification,
    sendOrderShippingNotification,
    sendOrderDeliveredNotification,
    sendOrderCancelledNotification,
    sendOrderIssueNotification,
    handleLogout,
    checkPermission,
  };
};
