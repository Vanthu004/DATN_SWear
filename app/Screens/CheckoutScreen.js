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

const CheckoutScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { createOrderFromCart, loading } = useOrder();
  const { removeFromCart } = useCart();

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
  const [paymentMethod, setPaymentMethod] = useState("BIDV Bank");
  const [shippingMethod, setShippingMethod] = useState("Vận chuyển Thường");
  const [note, setNote] = useState("");

  // Xử lý đặt hàng
  const handlePlaceOrder = async () => {
    if (checkedItems.length === 0) {
      Alert.alert("Lỗi", "Không có sản phẩm nào để đặt hàng");
      return;
    }

    // Hiển thị confirm dialog
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
  };

  // Xử lý tạo đơn hàng
  const processOrder = async () => {
    try {
      // Dữ liệu đơn hàng
      const orderData = {
        total: total,
        shippingAddress: shippingAddress,
        paymentMethodId: "default_payment_id", // Sẽ cập nhật sau khi có API payment methods
        shippingMethodId: "default_shipping_id", // Sẽ cập nhật sau khi có API shipping methods
        note: note,
      };

      console.log("🛒 Bắt đầu tạo đơn hàng...");
      console.log("📦 Cart items:", checkedItems);
      console.log("💰 Order data:", orderData);

      // Tạo đơn hàng từ cart
      const result = await createOrderFromCart(checkedItems, orderData);

      if (result) {
        console.log("✅ Đơn hàng tạo thành công:", result);

        // Xóa các sản phẩm đã đặt khỏi cart
        for (const item of checkedItems) {
          await removeFromCart(item._id);
        }

        // Chuyển đến màn hình thành công
        navigation.navigate(ROUTES.ORDER_SUCCESS, {
          orderCode: result.order.order_code,
          orderId: result.order._id,
          total: total,
        });
      }
    } catch (error) {
      console.error("❌ Lỗi xử lý đơn hàng:", error);
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

        {/* Phương thức thanh toán */}
        <TouchableOpacity style={styles.card}>
          <Text style={styles.cardTitle}>Phương thức Thanh toán</Text>
          <Text style={[styles.cardContent, { fontWeight: "bold" }]}>
            {paymentMethod}
          </Text>
          <Ionicons name="chevron-forward" size={20} style={styles.icon} />
        </TouchableOpacity>

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
});
