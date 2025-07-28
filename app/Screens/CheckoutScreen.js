import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ROUTES } from "../constants/routes";
import { useCart } from "../hooks/useCart";
import { useOrder } from "../hooks/useOrder";
import api from '../utils/api'; // Thêm dòng này nếu chưa có
import { getPaymentMethods } from '../utils/paymentApi';

const CheckoutScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { createOrderFromCart, loading } = useOrder();
  const { removeFromCart, cartId } = useCart();

  const {
    checkedItems = [],
    subtotal = 0,
    shipping = 0,
    tax = 0,
    total = 0,
  } = route.params || {};

  // State cho thông tin đặt hàng
  const [shippingAddress, setShippingAddress] = useState(
    "18/9 Hồ Văn Nhân, Hồng Hà, Hà Nội"
  );
  // Gán ảnh cố định theo code
  const imageMap = {
    COD: "https://i.pinimg.com/564x/66/cb/6b/66cb6b04177ab07a60c17445011161ca.jpg",
    ZALOPAY: "https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay-Square.png",
  };

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(true);
  const [processingZaloPay, setProcessingZaloPay] = useState(false);
  const [orderMessage, setOrderMessage] = useState("");

  React.useEffect(() => {
    const fetchPaymentMethods = async () => {
      setLoadingPaymentMethods(true);
      try {
        const data = await getPaymentMethods();
        console.log("Payment methods from API:", data); // LOG 1
        // Lọc chỉ lấy COD và ZALOPAY, enrich thêm ảnh
        const filtered = data.filter(pm =>
          pm.code?.toUpperCase() === 'COD' || pm.code?.toUpperCase() === 'ZALOPAY'
        ).map(pm => ({ ...pm, image: imageMap[pm.code?.toUpperCase()] || null }));
        setPaymentMethods(filtered);
        // Mặc định chọn COD nếu có
        setSelectedPaymentMethod(filtered.find(pm => pm.code?.toUpperCase() === 'COD')?._id || null);
      } catch (err) {
        Alert.alert('Lỗi', 'Không tải được phương thức thanh toán');
      } finally {
        setLoadingPaymentMethods(false);
      }
    };
    fetchPaymentMethods();
  }, []);
  const [shippingMethod, setShippingMethod] = useState("Vận chuyển Thường");
  const [note, setNote] = useState("");

  // Xử lý đặt hàng
  const handlePlaceOrder = async () => {
    if (checkedItems.length === 0) {
      Alert.alert("Lỗi", "Không có sản phẩm nào để đặt hàng");
      return;
    }

    // Kiểm tra phương thức thanh toán
    const selectedMethod = paymentMethods.find(pm => pm._id === selectedPaymentMethod);
    const isOnlinePayment = selectedMethod && selectedMethod.code?.toUpperCase() === 'ZALOPAY';

    if (isOnlinePayment) {
      setOrderMessage("Vui lòng thanh toán để đặt hàng");
      setTimeout(async () => {
        setOrderMessage("");
        await processOrder();
      }, 1200);
    } else {
      // COD - hiển thị confirm dialog như cũ
      Alert.alert(
        "Xác nhận đặt hàng",
        `Bạn có chắc muốn đặt hàng với tổng tiền ${total.toLocaleString()} VND?`,
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
    }
  };

  // Xử lý tạo đơn hàng
  const processOrder = async () => {
    try {
      const orderData = {
        total: total,
        shippingAddress: shippingAddress,
        paymentMethodId: selectedPaymentMethod,
        shippingMethodId: "default_shipping_id",
        note: note,
      };
      // Tạo đơn hàng từ cart
      const result = await createOrderFromCart(checkedItems, orderData);
      if (result) {
        // Kiểm tra nếu chọn ZALOPAY thì gọi API lấy mã QR
        const selectedMethod = paymentMethods.find(pm => pm._id === selectedPaymentMethod);
        console.log("selectedPaymentMethod:", selectedPaymentMethod); // LOG 2
        console.log("selectedMethod:", selectedMethod); // LOG 3
        if (selectedMethod && selectedMethod.code?.toUpperCase() === 'ZALOPAY') {
          setProcessingZaloPay(true);
          try {
            // Tính tổng tiền đúng yêu cầu
            const productTotal = subtotal;
            const taxAmount = tax;
            const shippingFee = shipping;
            const voucherDiscount = route.params?.voucher_discount || 0;
            const totalAmount = productTotal + taxAmount + shippingFee - voucherDiscount;
            // Gọi API backend để lấy mã QR ZaloPay
            const paymentRes = await api.post('/payments/zalopay/payment', {
              orderId: result.order._id,
              product_total: productTotal,
              tax: taxAmount,
              shipping_fee: shippingFee,
              voucher_discount: voucherDiscount,
              amount: totalAmount,
              cart_id: cartId, // ✅ Truyền cart_id lên backend
            });
            const paymentData = paymentRes.data;
            console.log("ZaloPay paymentData:", paymentData); // LOG QR RESPONSE
            const qrValue = paymentData.qr_url || paymentData.order_url || paymentData.paymentUrl || paymentData.payUrl;
            // Chuyển sang màn hình QR, truyền thêm orderId để polling check trạng thái
            navigation.navigate('ZaloPayQRScreen', {
              orderId: paymentData.app_trans_id || result.order._id,
              responseTime: Date.now(),
              amount: paymentData.total_amount || totalAmount,
              qrCodeUrl: qrValue,
              paymentUrl: paymentData.order_url,
              backendOrderId: result.order._id, // truyền orderId backend để check trạng thái
              checkedItems: checkedItems, // truyền danh sách sản phẩm để xóa sau khi thanh toán thành công
            });
            // KHÔNG xóa sản phẩm khỏi giỏ hàng ở đây - chỉ xóa khi thanh toán thành công
          } catch (err) {
            Alert.alert('Lỗi', 'Không lấy được mã QR ZaloPay');
          } finally {
            setProcessingZaloPay(false);
          }
        } else {
          // Nếu là COD thì xử lý như cũ
          for (const item of checkedItems) {
            await removeFromCart(item._id);
          }
          Alert.alert("Thành công", `Đơn hàng ${result.order.order_code} đã được tạo thành công!`); // chỉ alert khi là COD
          navigation.navigate(ROUTES.ORDER_SUCCESS, {
            orderCode: result.order.order_code,
            orderId: result.order._id,
            total: total,
          });
        }
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tạo đơn hàng. Vui lòng thử lại.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Custom Header */}
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
        {/* Danh sách sản phẩm đã chọn */}
        {checkedItems.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 8 }}>
              Sản phẩm đã chọn ({checkedItems.length})
            </Text>
            {checkedItems.map((item) => (
              <View
                key={item._id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 10,
                  backgroundColor: "#f9f9f9",
                  borderRadius: 8,
                  padding: 8,
                }}
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
                    {(
                      item.price_at_time ||
                      item.product?.price ||
                      0
                    ).toLocaleString()}{" "}
                    đ
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Địa chỉ giao hàng */}
        <TouchableOpacity style={styles.card}>
          <Text style={styles.cardTitle}>Địa chỉ Giao hàng</Text>
          <Text style={styles.cardContent}>{shippingAddress}</Text>
          <Ionicons name="chevron-forward" size={20} style={styles.icon} />
        </TouchableOpacity>

        {/* Phương thức thanh toán - cải tiến */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Phương thức Thanh toán</Text>
          {loadingPaymentMethods ? (
            <Text style={styles.cardContent}>Đang tải...</Text>
          ) : paymentMethods.length === 0 ? (
            <Text style={styles.cardContent}>
              Không có phương thức thanh toán khả dụng
            </Text>
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
                  onPress={() => setSelectedPaymentMethod(method._id)}
                >
                  {method.image && (
                    <Image
                      source={{ uri: method.image }}
                      style={{ width: 40, height: 40, marginRight: 12 }}
                      resizeMode="contain"
                    />
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: "500" }}>
                      {method.name}
                    </Text>
                    {/* Dòng khuyến mãi chỉ hiện nếu được chọn và là ZALOPAY */}
                    {isSelected && method.code === "ZALOPAY" && (
                      <View
                        style={{
                          backgroundColor: "#e0f7fa",
                          borderRadius: 4,
                          paddingVertical: 2,
                          paddingHorizontal: 6,
                          marginTop: 4,
                          alignSelf: 'flex-start',
                        }}
                      >
                        {/* Có thể thêm khuyến mãi cho ZaloPay ở đây nếu cần */}
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

        {/* Phương thức vận chuyển */}
        <TouchableOpacity style={styles.card}>
          <Text style={styles.cardTitle}>Phương thức Vận chuyển</Text>
          <Text style={styles.cardContent}>{shippingMethod}</Text>
          <Ionicons name="chevron-forward" size={20} style={styles.icon} />
        </TouchableOpacity>

        {/* Ghi chú */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ghi chú</Text>
          <Text style={styles.cardContent}>{note || "Không có ghi chú"}</Text>
        </View>

        {/* Tóm tắt */}
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
          <View style={styles.row}>
            <Text style={styles.totalLabel}>Tổng</Text>
            <Text style={styles.total}>{total.toLocaleString()} VND</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer đặt hàng */}
      <View style={styles.footer}>
        <View style={styles.totalBox}>
          <Text style={styles.footerTotal}>{total.toLocaleString()} VND</Text>
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
      {orderMessage ? (
        <View style={styles.orderMessageBox}>
          <Text style={styles.orderMessageText}>{orderMessage}</Text>
        </View>
      ) : null}
    </View>
  );
};

export default CheckoutScreen;

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
  icon: {
    position: "absolute",
    right: 15,
    top: 20,
    color: "#888",
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
  orderMessageBox: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 90,
    alignItems: 'center',
    zIndex: 20,
  },
  orderMessageText: {
    backgroundColor: '#e6f7ff',
    color: '#228be6',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    fontSize: 15,
    fontWeight: '500',
    overflow: 'hidden',
    elevation: 2,
  },
});
