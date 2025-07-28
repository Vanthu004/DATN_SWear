import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getOrderById, getOrderDetailsByOrderId } from "../utils/api";

const OrderDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId } = route.params || {};

  const [order, setOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const orderData = await getOrderById(orderId);
        setOrder(orderData);
        const details = await getOrderDetailsByOrderId(orderId);
        setOrderDetails(details);
      } catch (error) {
        console.log("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };
    if (orderId) fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.centered}>
        <Text>Không tìm thấy đơn hàng</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
      </View>

      {/* Mã đơn hàng */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>Mã đơn hàng</Text>
        <Text style={styles.infoValue}>{order.order_code}</Text>
      </View>

      {/* Danh sách sản phẩm */}
      <Text style={styles.sectionTitle}>Sản phẩm</Text>
      {orderDetails.map((item, index) => (
        <View key={index} style={styles.productBox}>
          <Image
            source={{ uri: item.product_image }}
            style={styles.productImage}
          />
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{item.product_name}</Text>
            <Text style={styles.productPrice}>
              {item.product_price?.toLocaleString()} VND
            </Text>
            <Text style={styles.productAttr}>
              Kích cỡ: {item.size || "-"} | Màu: {item.color || "-"}
            </Text>
            <Text style={styles.productAttr}>
              Số lượng: {item.quantity}
            </Text>
          </View>
        </View>
      ))}

      {/* Tổng thanh toán */}
      <Text style={styles.sectionTitle}>Thanh toán</Text>
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>Tổng</Text>
        <Text style={styles.infoValue}>
          {order.total_price?.toLocaleString()} VND
        </Text>
      </View>
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>Phí vận chuyển</Text>
        <Text style={styles.infoValue}>20.000 VND</Text>
      </View>
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>VAT</Text>
        <Text style={styles.infoValue}>0 VND</Text>
      </View>
      <View style={styles.infoBox}>
        <Text style={styles.infoTextBold}>Thành tiền</Text>
        <Text style={styles.infoValueBold}>
          {order.total_price?.toLocaleString()} VND
        </Text>
      </View>

      {/* Thông tin giao hàng */}
      <Text style={styles.sectionTitle}>Thông tin giao hàng</Text>
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>Người nhận</Text>
        <Text style={styles.infoValue}>Nguyễn Văn A</Text>
      </View>
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>SĐT</Text>
        <Text style={styles.infoValue}>098383246</Text>
      </View>
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>Địa chỉ giao hàng</Text>
        <Text style={styles.infoValue}>{order.shipping_address}</Text>
      </View>
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>Phương thức Thanh toán</Text>
        <Text style={styles.infoValue}>**** 9454 BIDV</Text>
      </View>
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>Hình thức vận chuyển</Text>
        <Text style={styles.infoValue}>Giao hàng tiết kiệm</Text>
      </View>
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>Trạng thái đơn hàng</Text>
        <Text style={styles.infoValueStatus}>Đang giao</Text>
      </View>

      {/* Action buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Hủy đơn</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.confirmBtn}>
          <Text style={styles.confirmText}>Hoàn hàng</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: 40,
  },
  backBtn: { marginRight: 12 },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 18,
  },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },

  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    marginHorizontal: 16,
    fontWeight: "bold",
    fontSize: 16,
  },

  productBox: {
    flexDirection: "row",
    backgroundColor: "#F9F9F9",
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 10,
    padding: 10,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  productName: { fontWeight: "bold", fontSize: 15 },
  productPrice: { color: "#E53935", fontWeight: "bold" },
  productAttr: { fontSize: 13, color: "#555" },

  infoBox: {
    backgroundColor: "#F6F6F6",
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 16,
    marginVertical: 4,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoText: { color: "#888", fontSize: 13 },
  infoTextBold: { color: "#222", fontWeight: "bold", fontSize: 14 },
  infoValue: { color: "#222", fontWeight: "500", fontSize: 14 },
  infoValueBold: { color: "#E53935", fontWeight: "bold", fontSize: 16 },
  infoValueStatus: { color: "#007BFF", fontWeight: "bold", fontSize: 14 },

  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    margin: 16,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#FF5252",
    padding: 12,
    borderRadius: 25,
    alignItems: "center",
    marginRight: 8,
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 25,
    alignItems: "center",
    marginLeft: 8,
  },
  cancelText: { color: "#fff", fontWeight: "bold" },
  confirmText: { color: "#fff", fontWeight: "bold" },
});

export default OrderDetailScreen;
