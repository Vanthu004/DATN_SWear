import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const CheckoutScreen = () => {
  const subtotal = 518000;
  const shipping = 0;
  const tax = 0;
  const total = subtotal + shipping + tax;
  const navigation = useNavigation();

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
        {/* Địa chỉ giao hàng */}
        <TouchableOpacity style={styles.card}>
          <Text style={styles.cardTitle}>Địa chỉ Giao hàng</Text>
          <Text style={styles.cardContent}>
            18/9 Hồ Văn Nhân, Hồng Hà, Hà..
          </Text>
          <Ionicons name="chevron-forward" size={20} style={styles.icon} />
        </TouchableOpacity>

        {/* Phương thức thanh toán */}
        <TouchableOpacity style={styles.card}>
          <Text style={styles.cardTitle}>Phương thức Thanh toán</Text>
          <Text style={[styles.cardContent, { fontWeight: "bold" }]}>
            **** 94545457 BIDV Bank
          </Text>
          <Ionicons name="chevron-forward" size={20} style={styles.icon} />
        </TouchableOpacity>

        {/* Phương thức vận chuyển */}
        <TouchableOpacity style={styles.card}>
          <Text style={styles.cardTitle}>Phương thức Vận chuyển</Text>
          <Text style={styles.cardContent}>Vận chuyển Thường</Text>
          <Ionicons name="chevron-forward" size={20} style={styles.icon} />
        </TouchableOpacity>

        {/* Tóm tắt */}
        <View style={styles.summary}>
          <View style={styles.row}>
            <Text style={styles.label}>Tạm tính</Text>
            <Text style={styles.value}>{subtotal.toLocaleString()} VND</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Phí vận chuyển</Text>
            <Text style={styles.value}>{shipping.toFixed(2)} VND</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Thuế</Text>
            <Text style={styles.value}>{tax.toFixed(2)} VND</Text>
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
        <TouchableOpacity style={styles.orderButton}>
          <Text style={styles.orderText}>Đặt hàng</Text>
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
  },
  orderText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});
