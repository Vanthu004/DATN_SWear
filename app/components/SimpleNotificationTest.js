import * as Notifications from 'expo-notifications';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const SimpleNotificationTest = () => {
  const testSimpleNotification = async () => {
    try {
      console.log('=== SIMPLE NOTIFICATION TEST START ===');
      
      // 1. Kiểm tra quyền
      const { status } = await Notifications.getPermissionsAsync();
      console.log('Permission status:', status);
      
      if (status !== 'granted') {
        console.log('Requesting permission...');
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        console.log('New permission status:', newStatus);
        
        if (newStatus !== 'granted') {
          Alert.alert('Lỗi', 'Cần cấp quyền thông báo để test!');
          return;
        }
      }
      
      // 2. Gửi notification đơn giản
      console.log('Sending simple notification...');
      const result = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🧪 Test Simple',
          body: 'Đây là test notification đơn giản!',
          data: { test: 'simple' },
          sound: 'default',
        },
        trigger: null,
      });
      
      console.log('Notification result:', result);
      Alert.alert('Thành công', `Notification đã được gửi với ID: ${result}`);
      
    } catch (error) {
      console.error('Simple notification test error:', error);
      Alert.alert('Lỗi', 'Không thể gửi notification: ' + error.message);
    }
  };

  const checkNotificationSettings = async () => {
    try {
      console.log('=== CHECKING NOTIFICATION SETTINGS ===');
      
      const settings = await Notifications.getPermissionsAsync();
      console.log('Notification settings:', settings);
      
      const channels = await Notifications.getNotificationChannelsAsync();
      console.log('Notification channels:', channels);
      
      Alert.alert(
        'Notification Settings',
        `Status: ${settings.status}\nChannels: ${channels.length}`
      );
      
    } catch (error) {
      console.error('Error checking settings:', error);
      Alert.alert('Lỗi', 'Không thể kiểm tra settings: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧪 Notification Test</Text>
      
      <TouchableOpacity style={styles.button} onPress={testSimpleNotification}>
        <Text style={styles.buttonText}>Test Simple Notification</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={checkNotificationSettings}>
        <Text style={styles.buttonText}>Check Settings</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    margin: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 12,
    borderRadius: 6,
    marginVertical: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SimpleNotificationTest;
