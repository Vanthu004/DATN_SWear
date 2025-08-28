import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { orderNotificationService } from '../services/OrderNotificationService';

const OrderNotificationTest = ({ userId }) => {
  const [isLoading, setIsLoading] = useState(false);

  // Test thông báo đơn hàng mới
  const testNewOrderNotification = async () => {
    if (!userId) {
      Alert.alert('Lỗi', 'User ID không có sẵn');
      return;
    }

    setIsLoading(true);
    try {
      const orderData = {
        orderId: 'ORD_001',
        orderStatus: 'pending',
        previousStatus: null,
        estimatedDelivery: '2024-01-25',
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
      
      Alert.alert('Thành công', 'Đã tạo thông báo đơn hàng mới');
    } catch (error) {
      Alert.alert('Lỗi', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Test thông báo xác nhận đơn hàng
  const testOrderConfirmedNotification = async () => {
    if (!userId) {
      Alert.alert('Lỗi', 'User ID không có sẵn');
      return;
    }

    setIsLoading(true);
    try {
      const orderData = {
        orderId: 'ORD_001',
        orderStatus: 'confirmed',
        previousStatus: 'pending',
        estimatedDelivery: '2024-01-25',
        adminNote: 'Đơn hàng đã được xác nhận và sẽ được xử lý sớm nhất',
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
      
      Alert.alert('Thành công', 'Đã tạo thông báo xác nhận đơn hàng');
    } catch (error) {
      Alert.alert('Lỗi', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Test thông báo đang xử lý
  const testOrderProcessingNotification = async () => {
    if (!userId) {
      Alert.alert('Lỗi', 'User ID không có sẵn');
      return;
    }

    setIsLoading(true);
    try {
      const orderData = {
        orderId: 'ORD_001',
        orderStatus: 'processing',
        previousStatus: 'confirmed',
        estimatedDelivery: '2024-01-25',
        adminNote: 'Đơn hàng đang được đóng gói và chuẩn bị giao hàng',
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
      
      Alert.alert('Thành công', 'Đã tạo thông báo đang xử lý đơn hàng');
    } catch (error) {
      Alert.alert('Lỗi', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Test thông báo đang giao hàng
  const testOrderShippingNotification = async () => {
    if (!userId) {
      Alert.alert('Lỗi', 'User ID không có sẵn');
      return;
    }

    setIsLoading(true);
    try {
      const orderData = {
        orderId: 'ORD_001',
        orderStatus: 'shipping',
        previousStatus: 'processing',
        estimatedDelivery: '2024-01-25',
        trackingNumber: 'TN123456789',
        adminNote: 'Đơn hàng đang được giao. Dự kiến nhận hàng trong 1-3 ngày',
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
      
      Alert.alert('Thành công', 'Đã tạo thông báo đang giao hàng');
    } catch (error) {
      Alert.alert('Lỗi', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Test thông báo giao hàng thành công
  const testOrderDeliveredNotification = async () => {
    if (!userId) {
      Alert.alert('Lỗi', 'User ID không có sẵn');
      return;
    }

    setIsLoading(true);
    try {
      const orderData = {
        orderId: 'ORD_001',
        orderStatus: 'delivered',
        previousStatus: 'shipping',
        estimatedDelivery: '2024-01-25',
        trackingNumber: 'TN123456789',
        adminNote: 'Đơn hàng đã được giao thành công. Cảm ơn bạn đã mua hàng!',
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
      
      Alert.alert('Thành công', 'Đã tạo thông báo giao hàng thành công');
    } catch (error) {
      Alert.alert('Lỗi', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Test thông báo hủy đơn hàng
  const testOrderCancelledNotification = async () => {
    if (!userId) {
      Alert.alert('Lỗi', 'User ID không có sẵn');
      return;
    }

    setIsLoading(true);
    try {
      const orderData = {
        orderId: 'ORD_001',
        orderStatus: 'cancelled',
        previousStatus: 'confirmed',
        adminNote: 'Đơn hàng đã bị hủy theo yêu cầu của khách hàng',
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
      
      Alert.alert('Thành công', 'Đã tạo thông báo hủy đơn hàng');
    } catch (error) {
      Alert.alert('Lỗi', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Test thông báo hoàn tiền
  const testOrderRefundedNotification = async () => {
    if (!userId) {
      Alert.alert('Lỗi', 'User ID không có sẵn');
      return;
    }

    setIsLoading(true);
    try {
      const orderData = {
        orderId: 'ORD_001',
        orderStatus: 'refunded',
        previousStatus: 'cancelled',
        adminNote: 'Đơn hàng đã được hoàn tiền. Tiền sẽ được chuyển về tài khoản trong 3-5 ngày',
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
      
      Alert.alert('Thành công', 'Đã tạo thông báo hoàn tiền');
    } catch (error) {
      Alert.alert('Lỗi', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Test thông báo chậm trễ
  const testOrderDelayedNotification = async () => {
    if (!userId) {
      Alert.alert('Lỗi', 'User ID không có sẵn');
      return;
    }

    setIsLoading(true);
    try {
      const orderData = {
        orderId: 'ORD_001',
        orderStatus: 'delayed',
        previousStatus: 'shipping',
        estimatedDelivery: '2024-01-28',
        adminNote: 'Đơn hàng bị chậm trễ do thời tiết xấu. Xin lỗi vì sự bất tiện!',
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
      
      Alert.alert('Thành công', 'Đã tạo thông báo chậm trễ');
    } catch (error) {
      Alert.alert('Lỗi', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Test Thông Báo Đơn Hàng</Text>
      <Text style={styles.subtitle}>User ID: {userId || 'Không có'}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trạng thái đơn hàng</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={testNewOrderNotification}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>🆕 Đơn hàng mới</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={testOrderConfirmedNotification}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>✅ Xác nhận đơn hàng</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={testOrderProcessingNotification}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>🔧 Đang xử lý</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={testOrderShippingNotification}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>🚚 Đang giao hàng</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={testOrderDeliveredNotification}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>🎉 Giao hàng thành công</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trạng thái đặc biệt</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={testOrderCancelledNotification}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>❌ Hủy đơn hàng</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={testOrderRefundedNotification}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>💰 Hoàn tiền</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={testOrderDelayedNotification}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>⏰ Chậm trễ</Text>
        </TouchableOpacity>
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tạo thông báo...</Text>
        </View>
      )}
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
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
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
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
});

export default OrderNotificationTest;
