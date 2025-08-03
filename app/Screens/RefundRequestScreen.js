import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useState } from "react";
import {
    Alert,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";

const REASONS = [
  "Sản phẩm bị lỗi",
  "Không đúng mô tả",
  "Không nhận được hàng",
  "Muốn đổi/trả sản phẩm",
  "Khác (ghi rõ lý do)",
];

export default function RefundRequestScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId, orderCode, orderDetails } = route.params || {};

  const { userInfo } = useAuth();

  const [selectedReason, setSelectedReason] = useState(null);
  const [customReason, setCustomReason] = useState("");

  const submitRefundRequest = async () => {
    if (!orderId || !userInfo?._id) {
      Alert.alert("Lỗi", "Thiếu thông tin đơn hàng hoặc người dùng.");
      return;
    }

    if (!selectedReason) {
      Alert.alert("Thông báo", "Vui lòng chọn lý do yêu cầu hoàn tiền.");
      return;
    }

    if (selectedReason === "Khác (ghi rõ lý do)" && !customReason.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập lý do cụ thể.");
      return;
    }

    const finalReason =
      selectedReason === "Khác (ghi rõ lý do)" ? customReason.trim() : selectedReason;

    try {
      const res = await api.post("/refund-requests", {
        orderId,
        userId: userInfo._id,
        reason: finalReason,
      });

      Alert.alert("Thành công", "Yêu cầu hoàn tiền của bạn đã được gửi.");
      navigation.goBack();
    } catch (error) {
      console.error("❌ Lỗi gửi yêu cầu hoàn tiền:", error);
      Alert.alert("Lỗi", "Không thể gửi yêu cầu hoàn tiền. Vui lòng thử lại.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Yêu cầu hoàn tiền</Text>
      <Text style={styles.subtitle}>Đơn hàng: {orderCode}</Text>

      <FlatList
        data={orderDetails || []}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.productItem}>
            <Image
              source={
                item.product_image
                  ? { uri: item.product_image }
                  : require("../../assets/images/box-icon.png")
              }
              style={styles.productImage}
            />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.product_name}</Text>
              <Text style={styles.productDetail}>
                x{item.quantity || 1} - {(item.product_price || 0).toLocaleString()}₫
              </Text>
            </View>
          </View>
        )}
        style={{ marginTop: 16 }}
      />

      <Text style={{ fontSize: 16, fontWeight: "bold", marginVertical: 16 }}>Chọn lý do:</Text>
      {REASONS.map((reason, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.reasonItem,
            selectedReason === reason && styles.reasonSelected,
          ]}
          onPress={() => setSelectedReason(reason)}
        >
          <Text style={styles.reasonText}>{reason}</Text>
        </TouchableOpacity>
      ))}

      {selectedReason === "Khác (ghi rõ lý do)" && (
        <TextInput
          style={styles.input}
          placeholder="Nhập lý do cụ thể..."
          value={customReason}
          onChangeText={setCustomReason}
          multiline
        />
      )}

      <TouchableOpacity style={styles.submitBtn} onPress={submitRefundRequest}>
        <Text style={styles.submitText}>Gửi yêu cầu</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 8, color: "#222" },
  subtitle: { fontSize: 16, color: "#555", marginBottom: 20 },
  reasonItem: {
    padding: 14,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 10,
  },
  reasonSelected: {
    borderColor: "#007bff",
    backgroundColor: "#e6f0ff",
  },
  reasonText: {
    fontSize: 16,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: "#f5f5f5",
    color: "#333",
  },
  submitBtn: {
    backgroundColor: "#007bff",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  submitText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  productItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#eee",
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 4,
  },
  productDetail: {
    fontSize: 14,
    color: "#555",
  },
});
