import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const NOTIFICATION_TYPES = {
  ORDER_SUCCESS: 'order_success',
  ORDER_CONFIRMED: 'order_confirmed',
  ORDER_SHIPPING: 'order_shipping',
  ORDER_DELIVERED: 'order_delivered',
  ORDER_CANCELLED: 'order_cancelled',
  ORDER_ISSUE: 'order_issue',
  GENERAL: 'general',
};

// Lấy thông báo từ storage
const getNotificationsFromStorage = async () => {
  try {
    const stored = await AsyncStorage.getItem('userNotifications');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error getting notifications from storage:', error);
    return [];
  }
};

// Lưu thông báo vào storage
const saveNotificationsToStorage = async (notifications) => {
  try {
    await AsyncStorage.setItem('userNotifications', JSON.stringify(notifications));
    // console.log('Notifications saved to storage:', notifications.length);
  } catch (error) {
    console.error('Error saving notifications to storage:', error);
  }
};

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const loadNotifications = async () => {
      const storedNotifications = await getNotificationsFromStorage();
      setNotifications(storedNotifications);
    };
    loadNotifications();
  }, []);

  useEffect(() => {
    // Foreground listener
    const foregroundSub = Notifications.addNotificationReceivedListener(notification => {
      try {
        const { title, body, data } = notification.request.content;
        // dùng request.identifier nếu có để giữ đồng nhất id
        const identifier = notification.request.identifier || String(Date.now());
        const newNotification = {
          id: identifier,
          title: title || 'Thông báo mới',
          text: body || 'Không có nội dung',
          type: data?.type || NOTIFICATION_TYPES.GENERAL,
          orderId: data?.orderId,
          timestamp: new Date().toISOString(),
          isRead: false,
        };

        console.log('Foreground notification received:', notification.request.identifier, notification.request.content);

        setNotifications(prev => {
          const updated = [newNotification, ...prev].slice(0, 50);
          saveNotificationsToStorage(updated);
          return updated;
        });
      } catch (err) {
        console.error('Error processing foreground notification', err);
      }
    });

    // Response listener (người dùng bấm vào notification)
    const responseSub = Notifications.addNotificationResponseReceivedListener(response => {
      try {
        const { data } = response.notification.request.content;
        const identifier = response.notification.request.identifier;
        // đánh dấu tương ứng nếu có
        if (identifier) {
          setNotifications(prev => {
            const updated = prev.map(n => (n.id === identifier ? { ...n, isRead: true } : n));
            saveNotificationsToStorage(updated);
            return updated;
          });
        }
        if (data?.orderId) {
          navigation.navigate('OrderDetail', { orderId: data.orderId });
        }
      } catch (err) {
        console.error('Error handling notification response', err);
      }
    });

    // Kiểm tra app mở từ notification (background/killed)
    Notifications.getLastNotificationResponseAsync().then(response => {
      try {
        if (response) {
          const { data } = response.notification.request.content;
          if (data?.orderId) {
            navigation.navigate('OrderDetail', { orderId: data.orderId });
          }
        }
      } catch (err) {
        console.error('Error processing last notification response', err);
      }
    });

    return () => {
      foregroundSub && foregroundSub.remove && foregroundSub.remove();
      responseSub && responseSub.remove && responseSub.remove();
    };
  }, [navigation]);

  // Đánh dấu đã đọc
  const markAsRead = async (id) => {
    setNotifications(prev => {
      const updated = prev.map(n => (n.id === id ? { ...n, isRead: true } : n));
      saveNotificationsToStorage(updated);
      return updated;
    });
  };

  // Xóa thông báo
  const deleteNotification = async (id) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      saveNotificationsToStorage(updated);
      return updated;
    });
  };

  // Xóa tất cả
  const clearAllNotifications = async () => {
    Alert.alert(
      'Xóa tất cả thông báo',
      'Bạn có chắc muốn xóa tất cả thông báo?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            setNotifications([]);
            await saveNotificationsToStorage([]);
          },
        },
      ]
    );
  };

  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  const renderNotification = ({ item }) => (
    <View style={[styles.notificationItem, item.isRead ? styles.read : styles.unread]}>
      <TouchableOpacity
        onPress={() => {
          markAsRead(item.id);
          if (item.orderId) {
            navigation.navigate('OrderDetail', { orderId: item.orderId });
          }
        }}
        style={{ flex: 1 }}
      >
        <View style={styles.notificationContent}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.body}>{item.text}</Text>
          <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
          {item.type !== NOTIFICATION_TYPES.GENERAL && (
            <Text style={styles.type}>Loại: {item.type}</Text>
          )}
          {item.orderId && <Text style={styles.orderId}>Đơn hàng: #{item.orderId}</Text>}
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => deleteNotification(item.id)} style={styles.deleteButton}>
        <Text style={styles.deleteButtonText}>Xóa</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Thông báo</Text>
        {notifications.length > 0 && (
          <TouchableOpacity onPress={clearAllNotifications}>
            <Text style={styles.clearAll}>Xóa tất cả</Text>
          </TouchableOpacity>
        )}
      </View>
      {notifications.length === 0 ? (
        <Text style={styles.emptyText}>Không có thông báo nào</Text>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  clearAll: {
    color: '#ff4444',
    fontSize: 16,
  },
  list: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  read: {
    backgroundColor: '#f0f0f0',
  },
  unread: {
    backgroundColor: '#fff',
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  notificationContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  body: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
  },
  type: {
    fontSize: 12,
    color: '#555',
  },
  orderId: {
    fontSize: 12,
    color: '#007bff',
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    color: '#ff4444',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
  },
});

export default NotificationsScreen;