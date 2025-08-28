import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { fcmService } from '../services/fcmService';
import { notificationApiService } from '../services/NotificationApiService';
import { orderNotificationService } from '../services/OrderNotificationService';

const NOTIFICATION_TYPES = {
  ORDER_SUCCESS: 'order_success',
  ORDER_CONFIRMED: 'order_confirmed',
  ORDER_SHIPPING: 'order_shipping',
  ORDER_DELIVERED: 'order_delivered',
  ORDER_CANCELLED: 'order_cancelled',
  ORDER_ISSUE: 'order_issue',
  ORDER_STATUS_CHANGE: 'order_status_change',
  GENERAL: 'general',
  ADMIN: 'admin',
  PROMOTION: 'promotion',
  SYSTEM: 'system',
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
    console.log('Notifications saved to storage:', notifications.length);
  } catch (error) {
    console.error('Error saving notifications to storage:', error);
  }
};

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Refs cho notification listeners
  const notificationListener = useRef();
  const responseListener = useRef();

  // Load notifications từ storage
  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const storedNotifications = await getNotificationsFromStorage();
      setNotifications(storedNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load notifications từ backend API
  const loadNotificationsFromBackend = async () => {
    try {
      if (!currentUser?.id) return;

      const backendNotifications = await notificationApiService.getUserNotifications(currentUser.id, 1, 50);
      
      if (backendNotifications.success && backendNotifications.data) {
        // Chuyển đổi format từ backend sang local
        const convertedNotifications = backendNotifications.data.map(notification => ({
          id: notification.id || `backend_${notification._id}`,
          title: notification.title,
          text: notification.body || notification.message,
          type: notification.type || notification.category || NOTIFICATION_TYPES.GENERAL,
          orderId: notification.orderId || notification.data?.orderId,
          category: notification.category || 'general',
          priority: notification.priority || 'normal',
          icon: notification.icon || '📋',
          timestamp: notification.createdAt || notification.timestamp || new Date().toISOString(),
          isRead: notification.isRead || false,
          source: 'backend',
          additionalData: notification.data || {}
        }));

        // Merge với notifications local
        const localNotifications = await getNotificationsFromStorage();
        const mergedNotifications = [...convertedNotifications, ...localNotifications];
        
        // Loại bỏ duplicates và sắp xếp theo thời gian
        const uniqueNotifications = mergedNotifications.filter((notification, index, self) => 
          index === self.findIndex(n => n.id === notification.id)
        );
        
        const sortedNotifications = uniqueNotifications.sort((a, b) => 
          new Date(b.timestamp) - new Date(a.timestamp)
        );

        setNotifications(sortedNotifications);
        await saveNotificationsToStorage(sortedNotifications);
      }
    } catch (error) {
      console.error('Error loading notifications from backend:', error);
    }
  };

  // Refresh notifications
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadNotificationsFromBackend();
      await loadNotifications();
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Lấy thông tin user hiện tại
  const getCurrentUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        return user;
      }
    } catch (error) {
      console.error('Error getting current user:', error);
    }
    return null;
  };

  useEffect(() => {
    getCurrentUser();
    loadNotifications();
  }, []);

  useEffect(() => {
    // Khởi tạo FCM service nếu chưa có
    const initializeFCM = async () => {
      try {
        await fcmService.initialize();
        console.log('[NotificationsScreen] FCM service initialized');
      } catch (error) {
        console.error('[NotificationsScreen] Error initializing FCM:', error);
      }
    };

    // Khởi tạo Order Notification service
    const initializeOrderService = async () => {
      try {
        await orderNotificationService.initialize();
        console.log('[NotificationsScreen] Order notification service initialized');
      } catch (error) {
        console.error('[NotificationsScreen] Error initializing order service:', error);
      }
    };

    initializeFCM();
    initializeOrderService();

    // Foreground listener - nhận thông báo khi app đang mở
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      try {
        const { title, body, data } = notification.request.content;
        const identifier = notification.request.identifier || String(Date.now());
        
        // Tạo notification object mới
        const newNotification = {
          id: identifier,
          title: title || 'Thông báo mới',
          text: body || 'Không có nội dung',
          type: data?.type || NOTIFICATION_TYPES.GENERAL,
          orderId: data?.orderId,
          adminId: data?.adminId,
          category: data?.category || 'general',
          priority: data?.priority || 'normal',
          icon: data?.icon || '📋',
          timestamp: new Date().toISOString(),
          isRead: false,
          source: data?.source || 'local',
        };

        console.log('[NotificationsScreen] Foreground notification received:', {
          id: identifier,
          title: newNotification.title,
          type: newNotification.type,
          source: newNotification.source
        });

        // Cập nhật state và storage
        setNotifications(prev => {
          const updated = [newNotification, ...prev].slice(0, 100);
          saveNotificationsToStorage(updated);
          return updated;
        });

        // Hiển thị Alert cho thông báo quan trọng
        if (data?.priority === 'high' || data?.source === 'backend') {
          Alert.alert(
            title || 'Thông báo quan trọng',
            body || 'Bạn có thông báo mới từ hệ thống',
            [
              { text: 'Để sau', style: 'cancel' },
              { 
                text: 'Xem ngay', 
                onPress: () => {
                  // Đánh dấu đã đọc
                  setNotifications(prev => {
                    const updated = prev.map(n => 
                      n.id === identifier ? { ...n, isRead: true } : n
                    );
                    saveNotificationsToStorage(updated);
                    return updated;
                  });
                  
                  // Navigate nếu có data
                  if (data?.orderId) {
                    navigation.navigate('OrderDetail', { orderId: data.orderId });
                  } else if (data?.screen) {
                    navigation.navigate(data.screen, data.params || {});
                  }
                }
              }
            ]
          );
        }

      } catch (err) {
        console.error('[NotificationsScreen] Error processing foreground notification:', err);
      }
    });

    // Response listener - khi user tap vào notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      try {
        const { data } = response.notification.request.content;
        const identifier = response.notification.request.identifier;
        
        console.log('[NotificationsScreen] User tapped notification:', {
          id: identifier,
          data: data
        });

        // Đánh dấu đã đọc
        if (identifier) {
          setNotifications(prev => {
            const updated = prev.map(n => 
              n.id === identifier ? { ...n, isRead: true } : n
            );
            saveNotificationsToStorage(updated);
            return updated;
          });
        }

        // Xử lý navigation dựa vào data
        if (data?.orderId) {
          navigation.navigate('OrderDetail', { orderId: data.orderId });
        } else if (data?.screen) {
          navigation.navigate(data.screen, data.params || {});
        } else if (data?.url) {
          // Mở URL nếu có
          // Linking.openURL(data.url);
        }

      } catch (err) {
        console.error('[NotificationsScreen] Error handling notification response:', err);
      }
    });

    // Kiểm tra notification khi app mở từ background/killed state
    const checkLastNotification = async () => {
      try {
        const response = await Notifications.getLastNotificationResponseAsync();
        if (response) {
          const { data } = response.notification.request.content;
          console.log('[NotificationsScreen] App opened from notification:', data);
          
          if (data?.orderId) {
            navigation.navigate('OrderDetail', { orderId: data.orderId });
          } else if (data?.screen) {
            navigation.navigate(data.screen, data.params || {});
          }
        }
      } catch (err) {
        console.error('[NotificationsScreen] Error checking last notification:', err);
      }
    };

    checkLastNotification();

    // Cleanup function
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [navigation]);

  // Đánh dấu đã đọc
  const markAsRead = async (id) => {
    try {
      // Cập nhật local state
      setNotifications(prev => {
        const updated = prev.map(n => (n.id === id ? { ...n, isRead: true } : n));
        saveNotificationsToStorage(updated);
        return updated;
      });

      // Gọi API backend nếu notification có source là backend
      const notification = notifications.find(n => n.id === id);
      if (notification?.source === 'backend' && currentUser?.id) {
        try {
          await notificationApiService.markAsRead(id);
          console.log('[NotificationsScreen] Marked as read on backend');
        } catch (error) {
          console.error('[NotificationsScreen] Error marking as read on backend:', error);
        }
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Đánh dấu tất cả đã đọc
  const markAllAsRead = async () => {
    try {
      // Cập nhật local state
      setNotifications(prev => {
        const updated = prev.map(n => ({ ...n, isRead: true }));
        saveNotificationsToStorage(updated);
        return updated;
      });

      // Gọi API backend
      if (currentUser?.id) {
        try {
          await notificationApiService.markAllAsRead(currentUser.id);
          console.log('[NotificationsScreen] Marked all as read on backend');
        } catch (error) {
          console.error('[NotificationsScreen] Error marking all as read on backend:', error);
        }
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Xóa thông báo
  const deleteNotification = async (id) => {
    try {
      // Xóa khỏi local state
      setNotifications(prev => {
        const updated = prev.filter(n => n.id !== id);
        saveNotificationsToStorage(updated);
        return updated;
      });

      // Gọi API backend nếu notification có source là backend
      const notification = notifications.find(n => n.id === id);
      if (notification?.source === 'backend') {
        try {
          await notificationApiService.deleteNotification(id);
          console.log('[NotificationsScreen] Deleted notification on backend');
        } catch (error) {
          console.error('[NotificationsScreen] Error deleting notification on backend:', error);
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
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

  // Lọc thông báo theo loại
  const filterNotifications = (type) => {
    if (type === 'all') return notifications;
    return notifications.filter(n => n.type === type);
  };

  // Đếm thông báo chưa đọc
  const getUnreadCount = () => {
    return notifications.filter(n => !n.isRead).length;
  };

  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);
      
      if (diffInHours < 1) {
        return 'Vừa xong';
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)} giờ trước`;
      } else {
        return date.toLocaleString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
      }
    } catch {
      return '';
    }
  };

  // Lấy icon cho loại thông báo
  const getNotificationIcon = (notification) => {
    // Nếu notification có icon riêng, sử dụng icon đó
    if (notification.icon) {
      return <Text style={styles.iconText}>{notification.icon}</Text>;
    }

    // Fallback về icon theo loại
    const iconColor = notification.priority === 'high' ? '#ff4444' : '#007bff';
    
    switch (notification.type) {
      case NOTIFICATION_TYPES.ORDER_SUCCESS:
        return <Ionicons name="checkmark-circle" size={20} color="#28a745" />;
      case NOTIFICATION_TYPES.ORDER_CONFIRMED:
        return <Ionicons name="checkmark" size={20} color="#17a2b8" />;
      case NOTIFICATION_TYPES.ORDER_SHIPPING:
        return <Ionicons name="car" size={20} color="#ffc107" />;
      case NOTIFICATION_TYPES.ORDER_DELIVERED:
        return <Ionicons name="home" size={20} color="#28a745" />;
      case NOTIFICATION_TYPES.ORDER_CANCELLED:
        return <Ionicons name="close-circle" size={20} color="#dc3545" />;
      case NOTIFICATION_TYPES.ORDER_STATUS_CHANGE:
        return <Ionicons name="refresh" size={20} color="#6f42c1" />;
      case NOTIFICATION_TYPES.ADMIN:
        return <Ionicons name="person" size={20} color={iconColor} />;
      case NOTIFICATION_TYPES.PROMOTION:
        return <Ionicons name="pricetag" size={20} color="#e83e8c" />;
      case NOTIFICATION_TYPES.SYSTEM:
        return <Ionicons name="settings" size={20} color="#6c757d" />;
      default:
        return <Ionicons name="notifications" size={20} color="#6c757d" />;
    }
  };

  const renderNotification = ({ item }) => (
    <View style={[
      styles.notificationItem, 
      item.isRead ? styles.read : styles.unread,
      item.priority === 'high' && styles.highPriority
    ]}>
      <TouchableOpacity
        onPress={() => {
          markAsRead(item.id);
          if (item.orderId) {
            navigation.navigate('OrderDetail', { orderId: item.orderId });
          } else if (item.category === 'admin') {
            // Xử lý thông báo từ admin
            Alert.alert(
              item.title,
              item.text,
              [{ text: 'Đã hiểu' }]
            );
          }
        }}
        style={{ flex: 1, flexDirection: 'row' }}
      >
        <View style={styles.iconContainer}>
          {getNotificationIcon(item)}
        </View>
        
        <View style={styles.notificationContent}>
          <View style={styles.titleRow}>
            <Text style={[
              styles.title,
              item.isRead && styles.titleRead
            ]}>
              {item.title}
            </Text>
            {item.priority === 'high' && (
              <View style={styles.priorityBadge}>
                <Ionicons name="warning" size={12} color="#fff" />
                <Text style={styles.priorityText}>Quan trọng</Text>
              </View>
            )}
          </View>
          
          <Text style={[
            styles.body,
            item.isRead && styles.bodyRead
          ]}>
            {item.text}
          </Text>
          
          <View style={styles.bottomRow}>
            <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
            
            <View style={styles.metaInfo}>
              {item.source === 'backend' && (
                <View style={styles.badgeContainer}>
                  <Text style={styles.backendBadge}>Server</Text>
                </View>
              )}
              {item.source === 'admin' && (
                <View style={styles.badgeContainer}>
                  <Text style={styles.adminBadge}>Admin</Text>
                </View>
              )}
              {item.type !== NOTIFICATION_TYPES.GENERAL && (
                <View style={styles.badgeContainer}>
                  <Text style={styles.typeBadge}>{item.type}</Text>
                </View>
              )}
              {item.orderId && (
                <View style={styles.badgeContainer}>
                  <Text style={styles.orderIdBadge}>#{item.orderId}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => deleteNotification(item.id)} style={styles.deleteButton}>
        <Ionicons name="trash-outline" size={18} color="#ff4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header cải thiện */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerText}>Thông báo</Text>
          {getUnreadCount() > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{getUnreadCount()}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.headerActions}>
          {notifications.length > 0 && getUnreadCount() > 0 && (
            <TouchableOpacity onPress={markAllAsRead} style={styles.markAllReadBtn}>
              <Ionicons name="checkmark-done" size={16} color="#fff" />
              <Text style={styles.markAllReadText}>Tất cả</Text>
            </TouchableOpacity>
          )}
          {notifications.length > 0 && (
            <TouchableOpacity onPress={clearAllNotifications} style={styles.clearAllBtn}>
              <Ionicons name="trash-outline" size={16} color="#ff4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter tabs - mới thêm */}
      {notifications.length > 0 && (
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity style={[styles.filterTab, styles.filterTabActive]}>
              <Text style={[styles.filterTabText, styles.filterTabTextActive]}>Tất cả</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterTab}>
              <Text style={styles.filterTabText}>Đơn hàng</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterTab}>
              <Text style={styles.filterTabText}>Khuyến mãi</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterTab}>
              <Text style={styles.filterTabText}>Hệ thống</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <View style={styles.loadingSpinner}>
            <Ionicons name="refresh" size={32} color="#007bff" />
          </View>
          <Text style={styles.loadingText}>Đang tải thông báo...</Text>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="notifications-off" size={80} color="#ddd" />
          </View>
          <Text style={styles.emptyText}>Không có thông báo nào</Text>
          <Text style={styles.emptySubtext}>Các thông báo mới sẽ xuất hiện ở đây</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <Ionicons name="refresh" size={16} color="#007bff" />
            <Text style={styles.refreshButtonText}>Làm mới</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#007bff']}
              tintColor="#007bff"
            />
          }
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginTop: 25,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  headerBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  unreadBadge: {
    backgroundColor: '#ff4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
    minWidth: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadCount: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  clearAll: {
    color: '#ff4444',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#888',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 18,
    color: '#888',
    fontWeight: '600',
  },
  emptySubtext: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    color: '#aaa',
  },
  list: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    marginBottom: 8,
    borderRadius: 16,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  read: {
    backgroundColor: '#f8f9fa',
    opacity: 0.9,
  },
  unread: {
    backgroundColor: '#fff',
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  highPriority: {
    borderLeftColor: '#ff4444',
    backgroundColor: '#fff5f5',
    borderLeftWidth: 4,
  },
  iconContainer: {
    marginRight: 16,
    marginTop: 2,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    flex: 1,
    lineHeight: 22,
  },
  titleRead: {
    color: '#666',
    fontWeight: '500',
  },
  priorityBadge: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  body: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
    lineHeight: 20,
  },
  bodyRead: {
    color: '#666',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  metaInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badgeContainer: {
    marginBottom: 2,
  },
  adminBadge: {
    backgroundColor: '#007bff',
    color: '#fff',
    fontSize: 9,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  typeBadge: {
    fontSize: 9,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  orderIdBadge: {
    fontSize: 9,
    color: '#007bff',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    fontWeight: 'bold',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  backendBadge: {
    backgroundColor: '#6c757d',
    color: '#fff',
    fontSize: 9,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  markAllReadBtn: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markAllReadText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  clearAllBtn: {
    padding: 8,
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginTop: 10,
  },
  filterTab: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#f0f0f0',
  },
  filterTabActive: {
    backgroundColor: '#007bff',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  filterTabTextActive: {
    color: '#fff',
  },
  refreshButton: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#007bff',
    fontSize: 14,
    marginLeft: 8,
  },
  loadingSpinner: {
    marginBottom: 10,
  },
  separator: {
    height: 10,
  },
});

export default NotificationsScreen;