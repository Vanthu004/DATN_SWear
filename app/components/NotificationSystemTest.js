import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { fcmService } from '../services/fcmService';
import { notificationApiService } from '../services/NotificationApiService';
import { orderNotificationService } from '../services/OrderNotificationService';

const NotificationSystemTest = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [fcmStatus, setFcmStatus] = useState('Not initialized');
  const [tokenInfo, setTokenInfo] = useState(null);
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUser(user);
      }
    } catch (error) {
      console.error('Error getting current user:', error);
    }
  };

  const addTestResult = (test, status, details = '') => {
    setTestResults(prev => [...prev, { test, status, details, timestamp: new Date().toISOString() }]);
  };

  // Test 1: Khởi tạo FCM Service
  const testFCMInitialization = async () => {
    try {
      addTestResult('FCM Initialization', 'Running...');
      
      await fcmService.initialize();
      const isInitialized = fcmService.isInitialized;
      
      if (isInitialized) {
        setFcmStatus('Initialized');
        addTestResult('FCM Initialization', '✅ Success', 'FCM service initialized successfully');
      } else {
        addTestResult('FCM Initialization', '❌ Failed', 'FCM service not initialized');
      }
    } catch (error) {
      addTestResult('FCM Initialization', '❌ Error', error.message);
    }
  };

  // Test 2: Đăng ký Push Notifications
  const testPushRegistration = async () => {
    if (!currentUser?.id) {
      Alert.alert('Lỗi', 'User ID không có sẵn');
      return;
    }

    try {
      addTestResult('Push Registration', 'Running...');
      
      const tokenObj = await fcmService.registerForPushNotifications(currentUser.id);
      
      if (tokenObj && tokenObj.token) {
        setTokenInfo(tokenObj);
        addTestResult('Push Registration', '✅ Success', `Token: ${tokenObj.token.substring(0, 20)}...`);
      } else {
        addTestResult('Push Registration', '❌ Failed', 'No token received');
      }
    } catch (error) {
      addTestResult('Push Registration', '❌ Error', error.message);
    }
  };

  // Test 3: Kiểm tra Token Storage
  const testTokenStorage = async () => {
    try {
      addTestResult('Token Storage', 'Running...');
      
      const storedToken = await AsyncStorage.getItem('pushToken');
      
      if (storedToken) {
        const parsedToken = JSON.parse(storedToken);
        addTestResult('Token Storage', '✅ Success', `Token stored: ${parsedToken.token.substring(0, 20)}...`);
      } else {
        addTestResult('Token Storage', '❌ Failed', 'No token in storage');
      }
    } catch (error) {
      addTestResult('Token Storage', '❌ Error', error.message);
    }
  };

  // Test 4: Test API Service
  const testAPIService = async () => {
    if (!currentUser?.id) {
      Alert.alert('Lỗi', 'User ID không có sẵn');
      return;
    }

    try {
      addTestResult('API Service', 'Running...');
      
      // Test lấy thông báo
      const notifications = await notificationApiService.getUserNotifications(currentUser.id, 1, 5);
      
      if (notifications) {
        addTestResult('API Service', '✅ Success', `Got ${notifications.data?.length || 0} notifications`);
      } else {
        addTestResult('API Service', '❌ Failed', 'No response from API');
      }
    } catch (error) {
      addTestResult('API Service', '❌ Error', error.message);
    }
  };

  // Test 5: Test Order Notification Service
  const testOrderNotificationService = async () => {
    try {
      addTestResult('Order Notification Service', 'Running...');
      
      await orderNotificationService.initialize();
      const isInitialized = orderNotificationService.isInitialized;
      
      if (isInitialized) {
        addTestResult('Order Notification Service', '✅ Success', 'Order notification service initialized');
      } else {
        addTestResult('Order Notification Service', '❌ Failed', 'Order notification service not initialized');
      }
    } catch (error) {
      addTestResult('Order Notification Service', '❌ Error', error.message);
    }
  };

  // Test 6: Test tạo thông báo đơn hàng
  const testOrderNotification = async () => {
    try {
      addTestResult('Order Notification Creation', 'Running...');
      
      const orderData = {
        orderId: 'TEST_001',
        orderStatus: 'shipping',
        previousStatus: 'processing',
        estimatedDelivery: '2024-01-25',
        trackingNumber: 'TN123456789',
        adminNote: 'Test notification',
        orderAmount: '500,000 VNĐ',
        paymentMethod: 'Ví điện tử ZaloPay',
        deliveryAddress: '123 Đường ABC, Quận 1, TP.HCM',
        items: [
          { name: 'Áo thun nam', quantity: 2, price: '150,000 VNĐ' },
          { name: 'Quần jean nam', quantity: 1, price: '200,000 VNĐ' }
        ]
      };

      const notificationData = orderNotificationService.createOrderNotification(orderData);
      await orderNotificationService.handleOrderNotificationFromBackend(notificationData);
      
      addTestResult('Order Notification Creation', '✅ Success', 'Order notification created and saved');
    } catch (error) {
      addTestResult('Order Notification Creation', '❌ Error', error.message);
    }
  };

  // Test 7: Kiểm tra thông báo trong storage
  const testNotificationStorage = async () => {
    try {
      addTestResult('Notification Storage', 'Running...');
      
      const storedNotifications = await AsyncStorage.getItem('userNotifications');
      
      if (storedNotifications) {
        const notifications = JSON.parse(storedNotifications);
        addTestResult('Notification Storage', '✅ Success', `${notifications.length} notifications in storage`);
      } else {
        addTestResult('Notification Storage', '❌ Failed', 'No notifications in storage');
      }
    } catch (error) {
      addTestResult('Notification Storage', '❌ Error', error.message);
    }
  };

  // Test tất cả
  const runAllTests = async () => {
    setTestResults([]);
    
    await testFCMInitialization();
    await testPushRegistration();
    await testTokenStorage();
    await testAPIService();
    await testOrderNotificationService();
    await testOrderNotification();
    await testNotificationStorage();
    
    Alert.alert('Test Complete', 'All tests have been completed. Check results below.');
  };

  // Clear test results
  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Notification System Test</Text>
      
      <View style={styles.userInfo}>
        <Text style={styles.userInfoText}>
          User ID: {currentUser?.id || 'Not available'}
        </Text>
        <Text style={styles.userInfoText}>
          FCM Status: {fcmStatus}
        </Text>
        {tokenInfo && (
          <Text style={styles.userInfoText}>
            Token Type: {tokenInfo.tokenType}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Individual Tests</Text>
        
        <TouchableOpacity style={styles.button} onPress={testFCMInitialization}>
          <Text style={styles.buttonText}>🔧 Test FCM Initialization</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testPushRegistration}>
          <Text style={styles.buttonText}>📱 Test Push Registration</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testTokenStorage}>
          <Text style={styles.buttonText}>💾 Test Token Storage</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testAPIService}>
          <Text style={styles.buttonText}>🌐 Test API Service</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testOrderNotificationService}>
          <Text style={styles.buttonText}>📦 Test Order Notification Service</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testOrderNotification}>
          <Text style={styles.buttonText}>🔔 Test Order Notification Creation</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testNotificationStorage}>
          <Text style={styles.buttonText}>📋 Test Notification Storage</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Bulk Tests</Text>
          <TouchableOpacity style={styles.clearButton} onPress={clearResults}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.runAllButton} onPress={runAllTests}>
          <Text style={styles.runAllButtonText}>🚀 Run All Tests</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Results</Text>
        
        {testResults.length === 0 ? (
          <Text style={styles.noResults}>No test results yet. Run some tests to see results.</Text>
        ) : (
          testResults.map((result, index) => (
            <View key={index} style={styles.resultItem}>
              <Text style={styles.resultTest}>{result.test}</Text>
              <Text style={styles.resultStatus}>{result.status}</Text>
              {result.details && (
                <Text style={styles.resultDetails}>{result.details}</Text>
              )}
              <Text style={styles.resultTimestamp}>
                {new Date(result.timestamp).toLocaleTimeString()}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  userInfo: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  userInfoText: {
    fontSize: 14,
    color: '#1976d2',
    marginBottom: 4,
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  runAllButton: {
    backgroundColor: '#28a745',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  runAllButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: '#dc3545',
    padding: 8,
    borderRadius: 4,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  noResults: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  resultItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  resultTest: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  resultStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  resultDetails: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  resultTimestamp: {
    fontSize: 10,
    color: '#999',
  },
});

export default NotificationSystemTest;
