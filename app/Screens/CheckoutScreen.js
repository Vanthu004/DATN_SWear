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

import { api, applyVoucherApi, decreaseProductStock, getAddressList, getPaymentMethods, getShippingMethods, getUserVouchers } from "../utils/api";
const CheckoutScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { createOrderFromCart, loading } = useOrder();
  const { removeFromCart, cartId } = useCart();
  const { userInfo } = useAuth();

  const { checkedItems = [], items = [], voucher_discount = 0 } = route.params || {};
  const selectedItems = checkedItems.length > 0 ? checkedItems : items;
  const subtotal = selectedItems.reduce((total, item) => {
  const price = item.price_at_time || item.product?.price || 0;
  return total + price * item.quantity;
    }, 0);
  // Image mapping for payment methods
  const imageMap = {
    COD: "https://i.pinimg.com/564x/66/cb/6b/66cb6b04177ab07a60c17445011161ca.jpg",
    ZALOPAY: "https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay-Square.png",
  };

  // State
  const [addressList, setAddressList] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [vouchers, setVouchers] = useState([]);
  const [selectedVoucherId, setSelectedVoucherId] = useState(null);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [shippingMethods, setShippingMethods] = useState([]);
  const [selectedShippingMethodId, setSelectedShippingMethodId] = useState(null);
  const [shippingFee, setShippingFee] = useState(0);
  const [note, setNote] = useState("");
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(true);
  const [processingZaloPay, setProcessingZaloPay] = useState(false);
  const [orderMessage, setOrderMessage] = useState("");

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      console.log("📦 Fetching data...");
      try {
        // Addresses
        try {
          const addrList = await getAddressList();
          setAddressList(addrList);
          console.log("📍 Loaded addresses:", addrList);
          const defaultAddress = addrList.find((a) => a.is_default);
          setSelectedAddressId(defaultAddress?._id || addrList[0]?._id);
        } catch (err) {
          console.error("❌ Error loading addresses:", err);
        }

        // Vouchers
        try {
          const allVouchers = userInfo?._id ? await getUserVouchers(userInfo._id) : [];
          console.log("🔥 User vouchers:", allVouchers);
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
          console.error("❌ Error loading vouchers:", err);
        }

        // Payment Methods
        setLoadingPaymentMethods(true);
        try {
          const data = await getPaymentMethods();
          console.log("💳 Payment methods from API:", data);
          const filtered = data
            .filter((pm) => pm.code?.toUpperCase() === "COD" || pm.code?.toUpperCase() === "ZALOPAY")
            .map((pm) => ({
              ...pm,
              image: imageMap[pm.code?.toUpperCase()] || null,
            }));
          setPaymentMethods(filtered);
          setSelectedPaymentMethod(filtered.find((pm) => pm.code?.toUpperCase() === "COD")?._id || null);
        } catch (err) {
          Alert.alert("Error", "Failed to load payment methods");
        } finally {
          setLoadingPaymentMethods(false);
        }

        // Shipping Methods
        try {
          const shipMethods = await getShippingMethods();
          console.log("🚚 Shipping methods:", shipMethods);
          setShippingMethods(shipMethods);
          if (shipMethods.length > 0) {
            setSelectedShippingMethodId(shipMethods[0]._id);
            setShippingFee(shipMethods[0].fee || 0);
          }
        } catch (err) {
          console.error("❌ Error loading shipping methods:", err);
        }
      } catch (error) {
        console.error("❌ General fetch error:", error);
      }
    };
    fetchData();
  }, []);

  // Handle voucher change
  const onVoucherChange = (voucherId) => {
    setSelectedVoucherId(voucherId);
    const voucher = vouchers.find((v) => v._id === voucherId);
    setSelectedVoucher(voucher);
  };

  // Handle payment method change
  const onPaymentChange = (paymentMethodId) => {
    setSelectedPaymentMethod(paymentMethodId);
  };

  // Handle shipping method change
  const onShippingChange = (shippingMethodId) => {
    setSelectedShippingMethodId(shippingMethodId);
    const method = shippingMethods.find((s) => s._id === shippingMethodId);
    setShippingFee(method?.fee || 0);
  };

  // Calculate total before voucher
  const totalBeforeVoucher = subtotal + shippingFee ;

  // Calculate total after voucher
 const calculateTotalAfterVoucher = () => {
  if (!selectedVoucher || !selectedVoucher.discount_value) return subtotal + shippingFee;
  const discountPercent = selectedVoucher.discount_value;
  const discountAmount = (subtotal + shippingFee) * (discountPercent / 100);
  return subtotal + shippingFee - discountAmount;
};

  // Format money
  const formatMoney = (amount) => {
    return amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
  };

  // Handle order placement
  const handlePlaceOrder = async () => {
    if (selectedItems.length === 0) {
      Alert.alert("Error", "No products selected for order");
      return;
    }
    if (!selectedAddressId) {
      Alert.alert("Error", "Please select a shipping address");
      return;
    }

    const selectedMethod = paymentMethods.find((pm) => pm._id === selectedPaymentMethod);
    const isOnlinePayment = selectedMethod && selectedMethod.code?.toUpperCase() === "ZALOPAY";

    if (isOnlinePayment) {
      setOrderMessage("Please proceed with payment to place the order");
      setTimeout(async () => {
        setOrderMessage("");
        await processOrder();
      }, 1200);
    } else {
      Alert.alert(
        "Xác nhận đặt hàng",
        `Bạn có chắc chắn muốn mua sản phẩm với tổng tiền: ${formatMoney(calculateTotalAfterVoucher())}?`,
        [
          { text: "không", style: "cancel" },
          {
            text: "Đặt hàng",
            style: "default",
            onPress: async () => {
              await processOrder();
            },
          },
        ]
      );
    }
  };

  // Process order
  const processOrder = async () => {
    try {
      const selectedAddressObj = addressList.find((a) => a._id === selectedAddressId);
      const selectedPaymentMethodObj = paymentMethods.find((p) => p._id === selectedPaymentMethod);
      const selectedShippingMethod = shippingMethods.find((s) => s._id === selectedShippingMethodId);

      const formatAddress = (addr) => {
        return `${addr.name} - ${addr.phone} - ${addr.street}, ${
          addr.ward ? addr.ward + ", " : ""
        }${addr.district}, ${addr.province}, ${addr.country || "Việt Nam"}`;
      };

        const orderData = {
        total: calculateTotalAfterVoucher(),
        shippingAddress: formatAddress(selectedAddressObj),
        paymentMethodId: selectedPaymentMethodObj?._id,
        shippingMethodId: selectedShippingMethod?._id,
        note,
        orderDetails: selectedItems.map((item) => ({
          product_id: item.product?._id || item.product_id,
          quantity: item.quantity,
        })),
        ...(selectedVoucher ? { voucherId: selectedVoucher._id } : {})
      };


      const result = await createOrderFromCart(selectedItems, orderData);
      if (result) {
          // --- Trừ kho ngay sau khi order thành công ---
  try {
    const stockItems = selectedItems.map(item => ({
      productId: item.product?._id || item.product_id,
      quantity: item.quantity,
    }));
    await decreaseProductStock(stockItems);
    console.log("✅ Stock decreased successfully");
  } catch (err) {
    console.error("❌ Error decreasing stock:", err);
    // Nếu muốn rollback order, có thể thêm logic gọi API server để hủy order
  }
        // Apply voucher if selected
        if (selectedVoucher && userInfo?._id) {
          try {
            if (userInfo && selectedVoucher) {
              await applyVoucherApi(userInfo._id, selectedVoucher.voucher_id);
            }
            console.log("✅ Voucher applied successfully after order");
          } catch (err) {
            console.error("❌ Error applying voucher after order:", err);
          }
        }
        
        console.log("id đơn hàng.......", result.data.order._id);
        
        // Handle ZaloPay payment        
        const selectedMethod = paymentMethods.find(pm => pm._id === selectedPaymentMethod);
        console.log("selectedPaymentMethod:", selectedPaymentMethod); // LOG 2
        console.log("selectedMethod:", selectedMethod); // LOG 3
        
        if (selectedMethod && selectedMethod.code?.toUpperCase() === 'ZALOPAY') {
          setProcessingZaloPay(true);
          try {
            // Tính tổng tiền đúng yêu cầu
            const productTotal = subtotal;
            const taxAmount = 0; // nếu bạn chưa có xử lý thuế
            const shippingAmount = shippingFee;
            const voucherDiscount = selectedVoucher?.discount_value
              ? (subtotal + shippingFee) * (selectedVoucher.discount_value / 100)
              : 0;

            const totalAmount = productTotal + taxAmount + shippingAmount - voucherDiscount;
            // Gọi API backend để lấy mã QR ZaloPay
            const paymentRes = await api.post('/payments/zalopay/payment', {
              orderId: result.data.order._id,
              product_total: productTotal,
              tax: taxAmount,
              shipping_fee: shippingAmount,
              voucher_discount: voucherDiscount,
              amount: totalAmount,
              cart_id: cartId,
            });

            const paymentData = paymentRes.data;
            console.log("ZaloPay paymentData:", paymentData); // LOG QR RESPONSE
            const qrValue = paymentData.qr_url || paymentData.order_url || paymentData.paymentUrl || paymentData.payUrl;
            // Chuyển sang màn hình QR, truyền thêm orderId để polling check trạng thái
            navigation.navigate(ROUTES.ZALOPAY_QR, {
              orderId: paymentData.app_trans_id || result.data.order._id,
              responseTime: Date.now(),
              amount: paymentData.total_amount || totalAmount,
              qrCodeUrl: qrValue,
              paymentUrl: paymentData.order_url,
              backendOrderId: result.data.order._id, // truyền orderId backend để check trạng thái
              selectedItems: selectedItems, // truyền danh sách sản phẩm để xóa sau khi thanh toán thành công
            });
            // KHÔNG xóa sản phẩm khỏi giỏ hàng ở đây - chỉ xóa khi thanh toán thành công
          } catch (err) {
            console.error("❌ Lỗi khi lấy QR ZaloPay:", err.response?.data || err.message);
            Alert.alert('Lỗi', 'Không lấy được mã QR ZaloPay');
          } finally {
            setProcessingZaloPay(false);
          }
        } else {
          // Handle COD - chỉ navigate đến success screen cho COD
          for (const item of selectedItems) {
            await removeFromCart(item._id);
          }
          // Alert.alert("Thành công", `Đơn hàng ${result.data.order.order_code} đã được tạo thành công!`);
          if (result && result.data && result.data.order) {
            navigation.navigate(ROUTES.ORDER_SUCCESS, {
              orderCode: result.data.order.order_code,
              orderId: result.data.order._id,
            });
          } else {
            console.error("❌ Không tìm thấy đơn hàng trong kết quả:", result);
          }
        }
      }
    } catch (error) {
      console.error("❌ Error processing order:", error);
      Alert.alert("Error", "Failed to create order. Please try again.");
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
        {/* Selected Products */}
        {selectedItems.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 8 }}>
              Sản phẩm đã chọn ({selectedItems.length})
            </Text>
            {selectedItems.map((item) => (
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
                  style={{ width: 50, height: 50, borderRadius: 8, marginRight: 12 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "500", fontSize: 15 }}>
                    {item.product?.name || item.product_name}
                  </Text>
                  <Text style={{ color: "#888", fontSize: 13 }}>Số lượng: {item.quantity}</Text>
                  <Text style={{ color: "#222", fontSize: 13 }}>
                    {formatMoney(item.price_at_time || item.product?.price || 0)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Shipping Address */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Địa chỉ giao hàng</Text>
          {addressList.length > 0 ? (
            <Picker
              selectedValue={selectedAddressId}
              onValueChange={(val) => setSelectedAddressId(val)}
              style={{ marginTop: 5 }}
              
            >
              {addressList.map((addr) => (
                <Picker.Item
                  key={addr._id}
                  label={`${addr.name} - ${addr.street}, ${addr.ward ? addr.ward + ", " : ""}${
                    addr.district
                  }, ${addr.province}`}
                  value={addr._id}
                  
                />
              ))}
            </Picker>
          ) : (
            <Text>Không có địa chỉ giao hàng</Text>
          )}
        </View>
        {/* Shipping Methods */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Phương thức vận chuyển</Text>
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
        {/* Voucher */}
<View style={styles.card}>
  <Text style={styles.cardTitle}>Voucher áp dụng</Text>
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
      <Picker.Item label="Không sử dụng voucher" value="none" />
      {vouchers.map((v) => {
        const isFreeShipping = v.title === "Miễn phí vận chuyển";
        const label = isFreeShipping
          ? `${v.title} - SL: ${v.usage_limit}`
          : `${v.title} - Giảm ${v.discount_value}% - SL: ${v.usage_limit}`;
        return <Picker.Item key={v._id} label={label} value={v._id} />;
      })}
    </Picker>
  ) : (
    <Text style={{ marginTop: 5, color: "#888" }}>Không có voucher áp dụng</Text>
  )}
</View>


        {/* Payment Methods */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Phương thức thanh toán</Text>
          {loadingPaymentMethods ? (
            <Text style={styles.cardContent}>Đang tải...</Text>
          ) : paymentMethods.length === 0 ? (
            <Text style={styles.cardContent}>Không có phương thức thanh toán khả dụng</Text>
          ) : (
            paymentMethods.map((method) => {
              const isSelected = selectedPaymentMethod === method._id;
              return (
                <TouchableOpacity
                  key={method._id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 12,
                    backgroundColor: "#f4f4f4",
                    borderRadius: 10,
                    marginBottom: 10,
                    borderWidth: 1,
                    borderColor: "#ccc",
                  }}
                  onPress={() => onPaymentChange(method._id)}
                >
                  {method.image && (
                    <Image
                      source={{ uri: method.image }}
                      style={{ width: 40, height: 40, marginRight: 12 }}
                      resizeMode="contain"
                    />
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: "500" }}>{method.name}</Text>
                    {isSelected && method.code?.toUpperCase() === "ZALOPAY" && (
                      <View
                        style={{
                          backgroundColor: "#e0f7fa",
                          borderRadius: 4,
                          paddingVertical: 2,
                          paddingHorizontal: 6,
                          marginTop: 4,
                          alignSelf: "flex-start",
                        }}
                      >
                        <Text style={{ color: "#007BFF", fontSize: 12 }}>ZaloPay Promotion</Text>
                      </View>
                    )}
                  </View>
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: "#888",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {isSelected && (
                      <View
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 6,
                          backgroundColor: "#007AFF",
                        }}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Note */}
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

        {/* Summary */}
        <View style={styles.summary}> 
          <View style={styles.row}>
            <Text style={styles.label}>Tạm tính</Text>
            <Text style={styles.value}>{formatMoney(subtotal)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Phí vận chuyển</Text>
            <Text style={styles.value}>
  {selectedVoucher?.title === "Miễn phí vận chuyển"
    ? formatMoney(0)
    : formatMoney(shippingFee)}
</Text>
          </View>

          {selectedVoucher && (
            <View style={styles.row}>
              <Text style={styles.label}>Voucher giảm</Text>
              <Text style={styles.value}>-{selectedVoucher.discount_value || 0}%</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.totalLabel}>Tổng</Text>
            <Text style={styles.total}>{formatMoney(calculateTotalAfterVoucher())}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.totalBox}>
          <Text style={styles.footerTotal}>{formatMoney(calculateTotalAfterVoucher())}</Text>
        </View>
        <TouchableOpacity
          style={[styles.orderButton, (loading || processingZaloPay) && styles.orderButtonDisabled]}
          onPress={handlePlaceOrder}
          disabled={loading || processingZaloPay || selectedItems.length === 0}
        >
          {loading || processingZaloPay ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.orderText}>Đặt hàng</Text>
          )}
        </TouchableOpacity>
      </View>

      {orderMessage ? (
        <View style={styles.orderMessageBox}>
          <Text style={styles.orderMessageText}>{orderMessage}</Text>
        </View>
      ) : null}
                  <View style={{height: 70}}></View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
  },
  customHeader: {
    height: 64,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    position: "relative",
    marginBottom: 8,
    paddingTop: 24,
  },
  backBtn: {
    position: "absolute",
    left: 16,
    top: 24,
    zIndex: 2,
  },
  backIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F6F6F6",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
  },
  content: {
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "#F4F4F4",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    position: "relative",
  },
  cardTitle: {
    fontSize: 12,
    color: "#888",
  },
  cardContent: {
    fontSize: 15,
    marginTop: 5,
    marginRight: 25,
  },
  summary: {
    marginTop: 20,
    paddingBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    color: "#888",
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    color: "#000",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  total: {
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  totalBox: {
    flex: 1,
  },
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
  orderButtonDisabled: {
    backgroundColor: "#ccc",
  },
  orderText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    backgroundColor: "#fff",
    marginTop: 5,
  },
  orderMessageBox: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 90,
    alignItems: "center",
    zIndex: 20,
  },
  orderMessageText: {
    backgroundColor: "#e6f7ff",
    color: "#228be6",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    fontSize: 15,
    fontWeight: "500",
    overflow: "hidden",
    elevation: 2,
  },
});

export default CheckoutScreen;