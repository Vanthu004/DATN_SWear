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
        // handle error
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

  // Lấy thông tin sản phẩm đầu tiên để hiển thị ảnh
  const firstDetail = orderDetails[0];
  const images = orderDetails.map((d) => d.product_image).filter(Boolean);

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

      {/* Images */}
      <View style={styles.imagesRow}>
        {images.length > 0 ? (
          images.map((img, idx) => (
            <Image
              key={idx}
              source={{ uri: img }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ))
        ) : (
          <Image
            source={require("../../assets/images/box-icon.png")}
            style={styles.productImage}
          />
        )}
      </View>

      {/* Product name & price */}
      <Text style={styles.productName}>
        {firstDetail?.product_name || "Sản phẩm"}
      </Text>
      <Text style={styles.productPrice}>
        {firstDetail?.product_price?.toLocaleString()} VND
      </Text>

      {/* Order code */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>Mã đơn hàng</Text>
        <Text style={styles.infoValue}>{order.order_code}</Text>
      </View>
      {/* Ngày tạo */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>Ngày tạo</Text>
        <Text style={styles.infoValue}>
          {new Date(order.createdAt).toLocaleString()}
        </Text>
      </View>

      {/* Thuộc tính sản phẩm */}
      <View style={styles.infoBoxRow}>
        <View style={styles.infoCol}>
          <Text style={styles.infoText}>Kích cỡ</Text>
          <Text style={styles.infoValue}>{firstDetail?.size || "-"}</Text>
        </View>
        <View style={styles.infoCol}>
          <Text style={styles.infoText}>Màu sắc</Text>
          <Text style={styles.infoValue}>{firstDetail?.color || "-"}</Text>
        </View>
        <View style={styles.infoCol}>
          <Text style={styles.infoText}>Số lượng</Text>
          <Text style={styles.infoValue}>{firstDetail?.quantity || 1}</Text>
        </View>
      </View>

      {/* Tổng tiền */}
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
        <Text style={styles.infoText}>Phí VAT</Text>
        <Text style={styles.infoValue}>00.000 VND</Text>
      </View>
      <View style={styles.infoBox}>
        <Text style={styles.infoTextBold}>Thành tiền</Text>
        <Text style={styles.infoValueBold}>
          {order.total_price?.toLocaleString()} VND
        </Text>
      </View>

      {/* Thông tin người nhận */}
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
        <Text style={styles.infoValue}>**** 94545457 BIDV Bank</Text>
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
  imagesRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 12,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  productName: {
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
    marginTop: 8,
  },
  productPrice: {
    color: "#E53935",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 8,
  },
  infoBox: {
    backgroundColor: "#F6F6F6",
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 16,
    marginVertical: 4,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoBoxRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginVertical: 4,
  },
  infoCol: { flex: 1, alignItems: "center" },
  infoText: { color: "#888", fontSize: 13 },
  infoTextBold: { color: "#222", fontWeight: "bold", fontSize: 14 },
  infoValue: { color: "#222", fontWeight: "500", fontSize: 14 },
  infoValueBold: { color: "#E53935", fontWeight: "bold", fontSize: 16 },
  infoValueStatus: { color: "#007BFF", fontWeight: "bold", fontSize: 14 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
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
