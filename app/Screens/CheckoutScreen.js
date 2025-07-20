import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ROUTES } from "../constants/routes";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../hooks/useCart";
import { useOrder } from "../hooks/useOrder";
import {
  getAddressList,
  getPaymentMethods,
  getPublicVouchers,
  getShippingMethods,
  getUserVouchers,
} from "../utils/api";

const CheckoutScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { createOrderFromCart, loading } = useOrder();
  const { removeFromCart } = useCart();
  const { userInfo } = useAuth();

  const {
    checkedItems = [],
    subtotal = 0,
    shipping = 0,
    tax = 0,
    total = 0,
  } = route.params || {};

  // State
  const [addressList, setAddressList] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const [vouchers, setVouchers] = useState([]);
  const [selectedVoucherId, setSelectedVoucherId] = useState(null);
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState(null);

  const [shippingMethods, setShippingMethods] = useState([]);
  const [selectedShippingMethodId, setSelectedShippingMethodId] = useState(null);

  const [note, setNote] = useState("");
  // Load dữ liệu khi mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Load địa chỉ
      const addrList = await getAddressList();
      setAddressList(addrList);
      setSelectedAddressId(addrList.find((a) => a.is_default)?._id || addrList[0]?._id);

      // Load voucher công khai + voucher user
      const publicVouchers = await getPublicVouchers();
      const userVouchers = userInfo?._id ? await getUserVouchers(userInfo._id) : [];

      // Gộp và loại trùng voucher theo _id
      const allVouchers = [...publicVouchers, ...userVouchers];
      const uniqueVoucherMap = new Map();
      allVouchers.forEach((v) => {
        if (!uniqueVoucherMap.has(v._id)) uniqueVoucherMap.set(v._id, v);
      });
      const uniqueVouchers = Array.from(uniqueVoucherMap.values());
      setVouchers(uniqueVouchers);
      if (uniqueVouchers.length > 0) {
        setSelectedVoucherId(uniqueVouchers[0]._id);
        setSelectedVoucher(uniqueVouchers[0]);
      }

      // Load phương thức thanh toán
      const payMethods = await getPaymentMethods();
      setPaymentMethods(payMethods);
      if (payMethods.length > 0) setSelectedPaymentMethodId(payMethods[0]._id);

      // Load phương thức vận chuyển
      const shipMethods = await getShippingMethods();
      setShippingMethods(shipMethods);
      if (shipMethods.length > 0) setSelectedShippingMethodId(shipMethods[0]._id);
    } catch (error) {
      console.error("Lỗi fetch dữ liệu:", error);
    }
  };

  // Xử lý chọn voucher
  const onVoucherChange = (voucherId) => {
    setSelectedVoucherId(voucherId);
    const v = vouchers.find((v) => v._id === voucherId);
    setSelectedVoucher(v);
  };

  // Xử lý chọn payment method
  const onPaymentChange = (paymentMethodId) => {
    setSelectedPaymentMethodId(paymentMethodId);
  };

  // Xử lý chọn shipping method
  const onShippingChange = (shippingMethodId) => {
    setSelectedShippingMethodId(shippingMethodId);
  };

  // Tính tổng sau giảm voucher %
  const calculateTotalAfterVoucher = () => {
    if (!selectedVoucher || !selectedVoucher.discount_value) return total;
    const discountPercent = selectedVoucher.discount_value;
    const discounted = total * (1 - discountPercent / 100);
    return discounted > 0 ? discounted : 0;
  };

  // Hàm đặt hàng (giữ nguyên như bạn yêu cầu)
  const handlePlaceOrder = async () => {
    if (checkedItems.length === 0) {
      Alert.alert("Lỗi", "Không có sản phẩm nào để đặt hàng");
      return;
    }
    if (!selectedAddressId) {
      Alert.alert("Lỗi", "Vui lòng chọn địa chỉ giao hàng");
      return;
    }

    Alert.alert(
      "Xác nhận đặt hàng",
      `Bạn có chắc muốn đặt hàng với tổng tiền ${calculateTotalAfterVoucher().toLocaleString()} VND?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đặt hàng",
          style: "default",
          onPress: async () => {
            await processOrder();
          },
        },
      ]
    );
  };

const processOrder = async () => {
  try {
    const selectedAddressObj = addressList.find((a) => a._id === selectedAddressId);
    const selectedPaymentMethod = paymentMethods.find(p => p._id === selectedPaymentMethodId);
    const selectedShippingMethod = shippingMethods.find(s => s._id === selectedShippingMethodId);

    const formatAddress = (addr) => {
      return `${addr.name} - ${addr.phone} - ${addr.street}, ${addr.ward ? addr.ward + ', ' : ''}${addr.district}, ${addr.province}, ${addr.country || 'Việt Nam'}`;
    };

    console.log("🧾 ID Thanh toán:", selectedPaymentMethod?._id);
    console.log("🧾 ID Vận chuyển:", selectedShippingMethod?._id);

    const orderData = {
      total: calculateTotalAfterVoucher(),
      shippingAddress: formatAddress(selectedAddressObj),
      paymentMethodId: selectedPaymentMethod?._id ,       // ✅ đúng kiểu
      shippingMethodId: selectedShippingMethod?._id ,     // ✅ đúng kiểu
      note,
     
    };

      const result = await createOrderFromCart(checkedItems, orderData);

      if (result) {
        for (const item of checkedItems) {
          await removeFromCart(item._id);
        }

        navigation.navigate(ROUTES.ORDER_SUCCESS, {
          orderCode: result.order.order_code,
          orderId: result.order._id,
          total: calculateTotalAfterVoucher(),
        });
      }
    } catch (error) {
      console.error("❌ Lỗi xử lý đơn hàng:", error);
      Alert.alert("Lỗi", "Không thể tạo đơn hàng. Vui lòng thử lại.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.customHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <View style={styles.backIconWrap}>
            <Ionicons name="arrow-back" size={22} color="#222" />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {/* Sản phẩm đã chọn */}
        {checkedItems.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 8 }}>
              Sản phẩm đã chọn ({checkedItems.length})
            </Text>
            {checkedItems.map((item) => (
              <TouchableOpacity
                key={item._id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 10,
                  backgroundColor: "#f9f9f9",
                  borderRadius: 8,
                  padding: 8,
                }}
                activeOpacity={0.7}
                onPress={() =>
                  navigation.navigate(ROUTES.PRODUCT_DETAIL, {
                    product: item.product,
                    productId: item.product?._id,
                  })
                }
              >
                <Image
                  source={
                    item.product?.image_url
                      ? { uri: item.product.image_url }
                      : require("../../assets/images/box-icon.png")
                  }
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 8,
                    marginRight: 12,
                  }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "500", fontSize: 15 }}>
                    {item.product?.name || item.product_name}
                  </Text>
                  <Text style={{ color: "#888", fontSize: 13 }}>
                    Số lượng: {item.quantity}
                  </Text>
                  <Text style={{ color: "#222", fontSize: 13 }}>
                    {(item.price_at_time || item.product?.price || 0).toLocaleString()} đ
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Địa chỉ giao hàng */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Địa chỉ Giao hàng</Text>
          {addressList.length > 0 ? (
            <Picker
              selectedValue={selectedAddressId}
              onValueChange={(val) => setSelectedAddressId(val)}
              style={{ marginTop: 5 }}
            >
              {addressList.map((addr) => (
                <Picker.Item
                  key={addr._id}
                  label={`${addr.name} - ${addr.street}, ${addr.ward}, ${addr.district}`}
                  value={addr._id}
                />
              ))}
            </Picker>
          ) : (
            <Text>Không có địa chỉ giao hàng</Text>
          )}
        </View>

        {/* Voucher */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Voucher Áp dụng</Text>
          {vouchers.length > 0 ? (
            <Picker
              selectedValue={selectedVoucherId}
              onValueChange={onVoucherChange}
              style={{ marginTop: 5 }}
            >
              {vouchers.map((v) => (
                <Picker.Item
                  key={v._id}
                  label={`Mã: ${v.voucher_id || v.code || v._id} - Giảm ${v.discount_value || 0}% - HSD: ${new Date(
                    v.expiry_date
                  ).toLocaleDateString()}`}
                  value={v._id}
                />
              ))}
            </Picker>
          ) : (
            <Text style={{ marginTop: 5, color: "#888" }}>Không có voucher áp dụng</Text>
          )}
        </View>

        {/* Phương thức thanh toán */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Phương thức Thanh toán</Text>
          {paymentMethods.length > 0 ? (
            <Picker
              selectedValue={selectedPaymentMethodId}
              onValueChange={onPaymentChange}
              style={{ marginTop: 5 }}
            >
              {paymentMethods.map((pm) => (
                <Picker.Item key={pm._id} label={pm.name} value={pm._id} />
              ))}
            </Picker>
          ) : (
            <Text>Không có phương thức thanh toán</Text>
          )}
        </View>

        {/* Phương thức vận chuyển */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Phương thức Vận chuyển</Text>
          {shippingMethods.length > 0 ? (
            <Picker
              selectedValue={selectedShippingMethodId}
              onValueChange={onShippingChange}
              style={{ marginTop: 5 }}
            >
              {shippingMethods.map((sm) => (
                <Picker.Item key={sm._id} label={sm.name} value={sm._id} />
              ))}
            </Picker>
          ) : (
            <Text>Không có phương thức vận chuyển</Text>
          )}
        </View>

        {/* Ghi chú */}
        <View style={styles.card}>
  <Text style={styles.cardTitle}>Ghi chú</Text>
  <TextInput
    style={styles.input}
    value={note}
    onChangeText={setNote}
    placeholder="Nhập ghi chú (nếu có)"
    multiline
    numberOfLines={3}
  />
</View>

        {/* Tổng tiền */}
        <View style={styles.summary}>
          <View style={styles.row}>
            <Text style={styles.label}>Tạm tính</Text>
            <Text style={styles.value}>{subtotal.toLocaleString()} VND</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Phí vận chuyển</Text>
            <Text style={styles.value}>{shipping.toFixed(0)} VND</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Thuế</Text>
            <Text style={styles.value}>{tax.toFixed(0)} VND</Text>
          </View>
          {selectedVoucher && (
            <View style={styles.row}>
              <Text style={styles.label}>Voucher giảm</Text>
              <Text style={styles.value}>-{selectedVoucher.discount_value || 0}%</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.totalLabel}>Tổng</Text>
            <Text style={styles.total}>
              {calculateTotalAfterVoucher().toLocaleString()} VND
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.totalBox}>
          <Text style={styles.footerTotal}>
            {calculateTotalAfterVoucher().toLocaleString()} VND
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.orderButton, loading && styles.orderButtonDisabled]}
          onPress={handlePlaceOrder}
          disabled={loading || checkedItems.length === 0}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.orderText}>Đặt hàng</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 50 },
  customHeader: {
    height: 64,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    position: "relative",
    marginBottom: 8,
    paddingTop: 24,
  },
  backBtn: { position: "absolute", left: 16, top: 24, zIndex: 2 },
  backIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F6F6F6",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#222", textAlign: "center" },
  content: { paddingHorizontal: 20 },
  card: {
    backgroundColor: "#F4F4F4",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    position: "relative",
  },
  cardTitle: { fontSize: 12, color: "#888" },
  cardContent: { fontSize: 15, marginTop: 5, marginRight: 25 },
  icon: { position: "absolute", right: 15, top: 20, color: "#888" },
  summary: { marginTop: 20, paddingBottom: 20 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  label: { color: "#888", fontSize: 14 },
  value: { fontSize: 14, color: "#000" },
  totalLabel: { fontSize: 16, fontWeight: "bold" },
  total: { fontSize: 16, fontWeight: "bold" },
  footer: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  totalBox: { flex: 1 },
  footerTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopLeftRadius: 25,
    borderBottomLeftRadius: 25,
  },
  orderButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
    minWidth: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  orderButtonDisabled: { backgroundColor: "#ccc" },
  orderText: { color: "#fff", fontSize: 16, fontWeight: "500" },
});

export default CheckoutScreen;
