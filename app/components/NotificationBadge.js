import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const NotificationBadge = ({ style }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadUnreadCount();
    // Setup listener để cập nhật badge khi có notification mới
    const interval = setInterval(loadUnreadCount, 5000); // Cập nhật mỗi 5 giây
    
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const savedNotifications = await AsyncStorage.getItem('userNotifications');
      if (savedNotifications) {
        const notifications = JSON.parse(savedNotifications);
        const unread = notifications.filter(notification => !notification.isRead).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  if (unreadCount === 0) {
    return null;
  }

  return (
    <View style={[styles.badge, style]}>
      <Text style={styles.badgeText}>
        {unreadCount > 99 ? '99+' : unreadCount.toString()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    zIndex: 1000,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default NotificationBadge;
