import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ROUTES } from "../constants/routes";
import {
  deletePaymentMethod,
  getPaymentMethods,
  selectPaymentMethod
} from "../utils/paymentApi";

const PaymentScreen = ({ navigation, route }) => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Lấy thông tin order từ route params
  const orderData = route.params?.orderData;
  const totalAmount = route.params?.totalAmount;

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadPaymentMethods();
    }, [])
  );

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const data = await getPaymentMethods();
      setPaymentMethods(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách phương thức thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMethod = async (method) => {
    try {
      const result = await selectPaymentMethod(method._id || method.id, 'user_id_cua_ban');
      if (result.success) {
        setSelectedMethod(method._id || method.id);
      }
    } catch (error) {
      console.error('Error selecting method:', error);
    }
  };

  const handleDeleteMethod = async (methodId) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa phương thức thanh toán này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePaymentMethod(methodId);
              await loadPaymentMethods();
              Alert.alert('Thành công', 'Đã xóa phương thức thanh toán');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa phương thức thanh toán');
            }
          }
        }
      ]
    );
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      Alert.alert('Thông báo', 'Vui lòng chọn phương thức thanh toán');
      return;
    }

    if (!orderData) {
      Alert.alert('Lỗi', 'Không có thông tin đơn hàng');
      return;
    }

    try {
      setProcessing(true);
      
      // Import processPayment function
      const { processPayment } = await import('../utils/paymentApi');
      const result = await processPayment(orderData, selectedMethod);
      
      if (result.success) {
        Alert.alert(
          'Thanh toán thành công',
          'Đơn hàng của bạn đã được xử lý thành công',
          [
            {
              text: 'Xem đơn hàng',
              onPress: () => navigation.navigate(ROUTES.ORDERS_TAB, {
                screen: ROUTES.ORDER_STATUS,
                params: { 
                  orderId: result.order._id,
                  paymentId: result.payment._id 
                }
              })
            },
            {
              text: 'Về trang chủ',
              onPress: () => navigation.navigate(ROUTES.HOME_TAB, {
                screen: ROUTES.HOME
              })
            }
          ]
        );
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Lỗi', 'Thanh toán thất bại. Vui lòng thử lại.');
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirm = async () => {
    // Giả sử bạn có userId từ context hoặc props
    await fetch('http://your-backend/api/user-payment-method', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'user_id_cua_ban',
        paymentMethodId: selectedMethod,
      }),
    });
    // Có thể chuyển màn hoặc thông báo thành công ở đây
  };

  const renderPaymentMethod = ({ item }) => (
    <TouchableOpacity 
      style={[styles.paymentCard, selectedMethod === (item._id || item.id) && styles.selectedCard]}
      onPress={() => handleSelectMethod(item)}
      activeOpacity={0.8}
    >
      <View style={styles.paymentInfo}>
        <Ionicons 
          name={item.type === 'card' ? 'card-outline' : 'wallet-outline'} 
          size={24} 
          color="#007AFF" 
        />
        <View style={styles.paymentDetails}>
          <Text style={styles.paymentType}>{item.name}</Text>
          <Text style={styles.cardNumber}>{item.description || item.discription}</Text>
        </View>
      </View>
      {selectedMethod === (item._id || item.id) && (
        <Ionicons name="checkmark-circle" size={22} color="#007AFF" style={{ marginLeft: 8 }} />
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán</Text>
        <TouchableOpacity onPress={() => navigation.navigate(ROUTES.ADD_BANK_CARD)} style={styles.addBtn}>
          <Ionicons name="add-circle-outline" size={28} color="#007AFF" />
        </TouchableOpacity>
      </View>
      <Text style={styles.sectionTitle}>Thêm thẻ Ngân hàng</Text>
      {loading ? (
        <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#007AFF" /></View>
      ) : (
        <FlatList
          data={paymentMethods}
          keyExtractor={item => item._id || item.id}
          renderItem={renderPaymentMethod}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8 }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  backBtn: { marginRight: 12 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  addBtn: { marginLeft: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', margin: 16, marginBottom: 8 },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#007AFF',
    backgroundColor: '#e6f0ff',
  },
  paymentInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  paymentDetails: { marginLeft: 12 },
  paymentType: { fontWeight: 'bold', fontSize: 15 },
  cardNumber: { color: '#666', fontSize: 13, marginTop: 2 },
  payButton: {
    backgroundColor: '#007AFF',
    margin: 16,
    borderRadius: 10,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonDisabled: { backgroundColor: '#b0c4de' },
  payButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default PaymentScreen;