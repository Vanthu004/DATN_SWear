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
  applyVoucherApi,
  getAddressList,
  getPaymentMethods,
  getShippingMethods,
  getUserVouchers,
} from "../utils/api";

const formatMoney = (amount) => {
  if (typeof amount !== "number") return "";
  const integerPart = Math.floor(amount).toString();
  return integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const CheckoutScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { createOrderFromCart, loading } = useOrder();
  const { removeFromCart } = useCart();
  const { userInfo } = useAuth();

  const {
    checkedItems = [],
    subtotal = 0,
    tax = 0,
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

  // Lấy phí vận chuyển từ phương thức được chọn
  const selectedShippingMethod = shippingMethods.find(
    (sm) => sm._id === selectedShippingMethodId
  );
  const shippingFee = selectedShippingMethod ? selectedShippingMethod.fee : 0;

  // Tổng tiền trước khi áp voucher
  const totalBeforeVoucher = subtotal + shippingFee + tax;

  // Load dữ liệu khi mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    console.log("📦 Gọi fetchData");

    try {
      // ======= Địa chỉ =======
      try {
        const addrList = await getAddressList();
        setAddressList(addrList);
        console.log("📍 Địa chỉ tải về:", addrList);
        const defaultAddress = addrList.find((a) => a.is_default);
        setSelectedAddressId(defaultAddress?._id || addrList[0]?._id);
      } catch (err) {
        console.error("❌ Lỗi tải địa chỉ:", err);
      }

      // ======= Voucher =======
      try {
        const allVouchers = userInfo?._id ? await getUserVouchers(userInfo._id) : [];
        console.log("🔥 User Vouchers:", allVouchers);

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
      } catch (err) {
        console.error("❌ Lỗi tải voucher:", err);
      }

      // ======= Phương thức thanh toán =======
      try {
        const payMethods = await getPaymentMethods();
        console.log("💳 Phương thức thanh toán:", payMethods);
        setPaymentMethods(payMethods);
        if (payMethods.length > 0) {
          setSelectedPaymentMethodId(payMethods[0]._id);
        }
      } catch (err) {
        console.error("❌ Lỗi tải phương thức thanh toán:", err);
      }

      // ======= Phương thức vận chuyển =======
      try {
        const shipMethods = await getShippingMethods();
        console.log("🚚 Phương thức vận chuyển:", shipMethods);
        setShippingMethods(shipMethods);
        if (shipMethods.length > 0) {
          setSelectedShippingMethodId(shipMethods[0]._id);
        }
      } catch (err) {
        console.error("❌ Lỗi tải phương thức vận chuyển:", err);
      }
    } catch (error) {
      console.error("❌ Lỗi fetch tổng thể:", error);
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
    if (!selectedVoucher || !selectedVoucher.discount_value) return totalBeforeVoucher;
    const discountPercent = selectedVoucher.discount_value;
    const discounted = totalBeforeVoucher * (1 - discountPercent / 100);
    return discounted > 0 ? discounted : 0;
  };

  // Hàm đặt hàng
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
      `Bạn có chắc muốn đặt hàng với tổng tiền ${formatMoney(calculateTotalAfterVoucher())} VND?`,
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

    const orderData = {
      total: calculateTotalAfterVoucher(),
      shippingAddress: formatAddress(selectedAddressObj),
      paymentMethodId: selectedPaymentMethod?._id,
      shippingMethodId: selectedShippingMethod?._id,
      note,
      voucherId: selectedVoucher?._id || null, // gửi voucherId nếu có
    };

    // Tạo đơn hàng
    const result = await createOrderFromCart(checkedItems, orderData);

    if (result) {
      // Nếu có voucher được chọn, gọi applyVoucher
      if (selectedVoucher && userInfo?._id) {
        try {
          await applyVoucherApi(userInfo._id, selectedVoucher.voucher_id);
          console.log("✅ Voucher đã được áp dụng thành công sau khi đặt hàng");
        } catch (err) {
          console.error("❌ Lỗi khi áp dụng voucher sau đặt hàng:", err);
          // Có thể xử lý hiển thị cảnh báo hoặc bỏ qua tùy ý
        }
      }

      // Xóa sản phẩm đã đặt khỏi giỏ hàng
      for (const item of checkedItems) {
        await removeFromCart(item._id);
      }

      // Điều hướng sang màn thành công
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
                    {formatMoney(item.price_at_time || item.product?.price || 0)} đ
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
    onValueChange={(val) => {
      if (val === "none") {
        setSelectedVoucherId(null);
        setSelectedVoucher(null);
      } else {
        onVoucherChange(val);
      }
    }}
    style={{ marginTop: 5 }}
  >
    {/* Tuỳ chọn không chọn voucher */}
    <Picker.Item label="Không sử dụng voucher" value="none" />
    
    {/* Các voucher có sẵn */}
    {vouchers.map((v) => (
      <Picker.Item
        key={v._id}
        label={`Mã: ${v.voucher_id}-Giảm ${v.discount_value}%-SL: ${v.usage_limit}`}
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
            <Text style={styles.value}>{formatMoney(subtotal)} VND</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Phí vận chuyển</Text>
            <Text style={styles.value}>{formatMoney(shippingFee)} VND</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Thuế</Text>
            <Text style={styles.value}>{formatMoney(tax)} VND</Text>
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
              {formatMoney(calculateTotalAfterVoucher())} VND
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.totalBox}>
          <Text style={styles.footerTotal}>
            {formatMoney(calculateTotalAfterVoucher())} VND
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
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    backgroundColor: "#fff",
    marginTop: 5,
  },
});

export default CheckoutScreen;
