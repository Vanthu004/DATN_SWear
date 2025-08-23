import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Alert, Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { ROUTES } from '../constants/routes';
import { useCart } from '../hooks/useCart';
import { api } from '../utils/api';
const { width } = Dimensions.get("window");
const CARD_WIDTH = Math.min(width * 0.92, 380);
const ZaloPayQRScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { refreshCart, removeFromCart } = useCart();
  
  // State để quản lý countdown và trạng thái QR
  const [timeLeft, setTimeLeft] = useState(null);
  const [isExpired, setIsExpired] = useState(false);
  const [expiryTime, setExpiryTime] = useState(null);

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

  // Tính toán thời gian hết hạn và khởi tạo countdown
  useEffect(() => {
    if (responseTime) {
      const expiry = new Date(Number(responseTime) + 15 * 60 * 1000); // 15 phút
      setExpiryTime(expiry);
      
      // Tính thời gian còn lại ban đầu
      const now = new Date();
      const initialTimeLeft = Math.max(0, expiry.getTime() - now.getTime());
      setTimeLeft(initialTimeLeft);
      
      // Kiểm tra xem đã hết hạn chưa
      if (initialTimeLeft <= 0) {
        setIsExpired(true);
      }
    }
  }, [responseTime]);

  // Countdown timer chạy mỗi giây
  useEffect(() => {
    if (!expiryTime || isExpired) return;

    const timer = setInterval(() => {
      const now = new Date();
      const remaining = Math.max(0, expiryTime.getTime() - now.getTime());
      
      if (remaining <= 0) {
        setIsExpired(true);
        setTimeLeft(0);
        clearInterval(timer);
        
        // Hiển thị thông báo hết hạn
        Alert.alert(
          "QR Code đã hết hạn",
          "QR Code đã hết hiệu lực. Vui lòng đặt lại đơn hàng.",
          [
            {
              text: "Đặt lại đơn hàng",
              onPress: () => navigation.navigate(ROUTES.HOME)
            },
            {
              text: "Đóng",
              style: "cancel"
            }
          ]
        );
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiryTime, isExpired, navigation]);

  // Format thời gian còn lại thành mm:ss
  const formatTimeLeft = (milliseconds) => {
    if (!milliseconds) return "00:00";
    
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Polling check trạng thái đơn hàng
  useEffect(() => {
    if (!backendOrderId || isExpired) return;
    
    console.log('Bắt đầu check ZaloPay status...');
    
    let isActive = true;
    let interval = setInterval(async () => {
      if (!isActive) return;
      
      try {
        console.log('Đang gọi API check ZaloPay status...');
        
        // Gọi API check ZaloPay status
        const res = await api.post('/payments/zalopay/check-status', {
          app_trans_id: orderId
        });
        
        console.log('ZaloPay response:', res.data);
        
        // Kiểm tra trạng thái từ ZaloPay response
        if (res.data && res.data.return_code === 1) {
          // ZaloPay trả về thành công - kiểm tra cả "success" và "Giao dịch thành công"
          if (res.data.return_message === 'success' || 
              res.data.return_message === 'Giao dịch thành công' ||
              res.data.return_message === 'Success') {
            
            console.log('Thanh toán thành công!');
            isActive = false;
            clearInterval(interval);
            
            // Refresh giỏ hàng (server đã xóa cart items rồi)
            await refreshCart();
            
            // Chuyển màn hình đến OrderSuccess
            navigation.replace(ROUTES.ORDER_SUCCESS, {
              orderCode: orderId,
              orderId: backendOrderId,
              total: amount,
            });
          }
        }
      } catch (err) {
        console.error('Error checking ZaloPay status:', err.message);
        console.error('Error details:', err.response?.data);
      }
    }, 3000); // 3s check 1 lần
    
    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, [backendOrderId, orderId, isExpired]); // Bỏ refreshCart và navigation khỏi dependencies

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
            <Text style={[
              styles.infoValueSmall, 
              isExpired && styles.expiredText
            ]}>
              {isExpired ? "Hết hạn" : formatTimeLeft(timeLeft)}
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
          {!isExpired && qrValue ? (
            <QRCode value={qrValue} size={220} />
          ) : (
            <View style={styles.expiredContainer}>
              <Ionicons name="time-outline" size={80} color="#e63946" />
              <Text style={styles.expiredTitle}>QR Code đã hết hạn</Text>
              <Text style={styles.expiredSubtitle}>Vui lòng đặt lại đơn hàng</Text>
            </View>
          )}
        </View>

        {/* Note nhỏ màu cam nhạt */}
        <Text style={styles.note}>
          <Text style={{ color: "#e76f51", fontWeight: "bold" }}>Note:</Text> 
          {isExpired 
            ? " QR Code đã hết hiệu lực. Vui lòng đặt lại đơn hàng."
            : " Vui lòng quét mã QR để thanh toán đơn hàng qua ZaloPay."
          }
        </Text>

        {/* Nút Cancel - căn giữa */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.cancelBtn, isExpired && styles.expiredButton]} 
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.cancelText, isExpired && styles.expiredButtonText]}>
              {isExpired ? "Về trang chủ" : "Cancel"}
            </Text>
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
    minHeight: 250,
    justifyContent: "center",
    alignItems: "center",
  },
  expiredContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  expiredTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#e63946",
    marginTop: 12,
    textAlign: "center",
  },
  expiredSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
  expiredText: {
    color: "#e63946",
    fontWeight: "700",
  },
  expiredButton: {
    backgroundColor: "#e63946",
    borderColor: "#e63946",
  },
  expiredButtonText: {
    color: "#fff",
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
});
export default ZaloPayQRScreen;