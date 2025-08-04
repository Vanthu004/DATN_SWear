import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect } from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useCart } from '../hooks/useCart';
import api from '../utils/api';

const { width } = Dimensions.get("window");
const CARD_WIDTH = Math.min(width * 0.92, 380);

const ZaloPayQRScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { refreshCart } = useCart();

  // Mapping ZaloPay response sang layout
  const {
    orderId,
    responseTime,
    amount,
    qrCodeUrl,
    paymentUrl,
    backendOrderId, // orderId backend để check trạng thái
    checkedItems, // danh sách sản phẩm để xóa sau khi thanh toán thành công
  } = route.params || {};

  // Polling check trạng thái đơn hàng
  useEffect(() => {
    if (!backendOrderId) return;
    let interval = setInterval(async () => {
      try {
        // Gọi API check ZaloPay status với app_trans_id
        const res = await api.post('/payments/zalopay/check-status', {
          app_trans_id: orderId // orderId từ ZaloPay response
        });
        
        console.log('ZaloPay status check response:', res.data);
        
        // Kiểm tra trạng thái từ ZaloPay response
        if (res.data && res.data.return_code === 1) {
          // ZaloPay trả về thành công, kiểm tra trạng thái thanh toán
          if (res.data.return_message === 'Giao dịch thành công' || 
              res.data.return_message === 'Success' || 
              res.data.return_message === 'Thành công') {
            clearInterval(interval);
            console.log('🎉 Thanh toán thành công.....');
            // Chỉ cần refreshCart, không cần gọi removeFromCart từng item nữa
            await refreshCart();
            navigation.replace('OrderSuccess', {
              orderCode: orderId,
              orderId: backendOrderId,
              total: amount,
            });
          }
        } else if (res.data && res.data.return_code === 2) {
          // Thanh toán đang xử lý, tiếp tục polling
          console.log('Payment is being processed...');
        } else {
          // Có lỗi hoặc trạng thái khác
          console.log('ZaloPay status:', res.data);
        }
      } catch (err) {
        console.error('Error checking ZaloPay status:', err.response?.data || err.message);
        // Có thể log lỗi hoặc bỏ qua, tiếp tục polling
      }
    }, 3000); // 3s check 1 lần
    return () => clearInterval(interval);
  }, [backendOrderId, orderId, refreshCart]);

  useFocusEffect(
    React.useCallback(() => {
      refreshCart();
    }, [])
  );

  // Helper render 1 dòng info 2 cột
  const renderInfoRow = (label1, value1, label2, value2, customStyle = {}) => (
    <View style={[styles.infoGrid, customStyle]}>
      <View style={styles.infoCol}>
        <Text style={styles.infoLabelSmall}>{label1}</Text>
        <Text style={styles.infoValueSmall}>{value1 || "---"}</Text>
      </View>
      <View style={styles.infoCol}>
        <Text style={styles.infoLabelSmall}>{label2}</Text>
        <Text style={styles.infoValueSmall}>{value2 || "---"}</Text>
      </View>
    </View>
  );

  // Chọn QR code url ưu tiên: qrCodeUrl > paymentUrl
  const qrValue = qrCodeUrl || paymentUrl;

  return (
    <View style={styles.bg}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ZaloPay QR CODE</Text>
        <Ionicons name="share-outline" size={26} color="#222" />
      </View>

      {/* Card */}
      <View style={styles.card}>
        {/* Thông tin đơn hàng */}
        <View style={styles.routeBox}>
          <Text style={styles.routeName}>Thông tin đơn hàng</Text>
          <Text style={styles.routeDate}>{responseTime ? new Date(Number(responseTime)).toLocaleDateString("vi-VN") : "---"}</Text>
        </View>

        {/* Thông tin: mã đơn hàng và thời gian hết hiệu lực QR */}
        <View style={styles.infoGrid}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabelSmall}>Mã đơn hàng</Text>
            <Text style={styles.infoValueSmall}>{orderId || "---"}</Text>
          </View>
          <View style={[styles.infoCol,{alignItems:"flex-end"}]}> 
            <Text style={styles.infoLabelSmall}>QR hết hiệu lực</Text>
            <Text style={styles.infoValueSmall}>
              {responseTime ? new Date(Number(responseTime) + 15 * 60 * 1000).toLocaleTimeString("vi-VN", {
                hour: '2-digit',
                minute: '2-digit'
              }) : "---"}
            </Text>
          </View>
        </View>
        {/* Tổng tiền*/}
        <View style={styles.infoRowMoney}>
            <Text style={styles.infoLabelSmall}>Tổng tiền: </Text>
            <View style={{ flex: 1 }}>
          <Text style={[styles.infoValueMoney, { color: "#e63946", textAlign: "right" }]}> 
            {amount ? Number(amount).toLocaleString("vi-VN") + " đ" : "---"}
          </Text>
        </View>
        </View>

        {/* QR Code lớn, căn giữa */}
        <View style={styles.qrContainer}>
          {qrValue ? (
            <QRCode value={qrValue} size={220} />
          ) : (
            <Text style={styles.errorText}>Không có mã QR</Text>
          )}
        </View>

        {/* Note nhỏ màu cam nhạt */}
        <Text style={styles.note}>
          <Text style={{ color: "#e76f51", fontWeight: "bold" }}>Note:</Text> Vui lòng quét mã QR để thanh toán đơn hàng qua ZaloPay.
        </Text>

        {/* Nút Cancel - căn giữa */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: "#ffff",
    alignItems: "center",
    paddingTop: 48,
  },
  header: {
    width: "100%",
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#ffff"
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#222",
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    marginBottom: 18,
  },
  routeBox: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  routeName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#222",
    marginBottom: 2,
  },
  routeDate: {
    fontSize: 14,
    color: "#888",
  },
  infoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 6,
  },
  infoCol: {
    flex: 1,
    marginRight: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: "#888",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
    marginTop: 2,
  },
  qrContainer: {
    alignSelf: "center",
    marginVertical: 18,
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#eee",
  },
  note: {
    marginTop: 16,
    fontSize: 15,
    color: "#999",
    textAlign: "center",
    marginBottom: 10,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 18,
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: "#888",
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 40,
    backgroundColor: "#fff",
  },
  cancelText: {
    color: "#222",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 17,
  },

  errorText: {
    color: "red",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "600",
  },
  infoLabelSmall: {
    fontSize: 13,
    color: "#888",
    fontWeight: "500",
  },
  infoValueSmall: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    marginTop: 1,
  },
  infoRowMoney: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
    marginBottom: 10,
  },
  infoValueMoney: {
    fontSize: 22,
    fontWeight: "700",
    marginLeft: 4,
  },

  buttonContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 18,
  },
});
export default ZaloPayQRScreen;