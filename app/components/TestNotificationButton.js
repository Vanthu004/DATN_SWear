import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { sendLocalNotification } from '../services/notificationService';

const TestNotificationButton = () => {
  const testNotification = async () => {
    try {
      console.log('TestNotificationButton: Testing notification...');
      await sendLocalNotification(
        '🧪 Test Notification',
        'Đây là thông báo test!',
        { test: true, timestamp: new Date().toISOString() }
      );
      Alert.alert('Thành công', 'Thông báo test đã được gửi!');
    } catch (error) {
      console.error('TestNotificationButton: Error:', error);
      Alert.alert('Lỗi', 'Không thể gửi thông báo test: ' + error.message);
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={testNotification}>
      <Text style={styles.buttonText}>🧪 Test Notification</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007BFF',
    padding: 12,
    borderRadius: 8,
    margin: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TestNotificationButton;
