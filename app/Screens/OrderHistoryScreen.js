import { useNavigation } from "@react-navigation/native";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const statusSteps = [
  { label: "Đã nhận hàng", date: "30/05/2025", done: true },
  { label: "Được vận chuyển", date: "29/05/2025", done: true },
  { label: "Đã xác nhận Đơn hàng", date: "28/05/2025", done: true },
  { label: "Đã Đặt hàng", date: "28/05/2025", done: true },
];

export default function OrderDetail() {
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("ScreenName")}>
          <Text style={styles.back}>{"<"} </Text>
        </TouchableOpacity>
        <Text style={styles.title}>Đơn hàng #456765</Text>
      </View>

      {/* Status timeline */}
      <View style={styles.statusContainer}>
        {statusSteps.map((step, index) => (
          <View key={index} style={styles.statusRow}>
            <View
              style={[
                styles.dot,
                { backgroundColor: step.done ? "#007bff" : "#ccc" },
              ]}
            />
            <View style={styles.statusText}>
              <Text
                style={[styles.statusLabel, step.done ? styles.doneText : null]}
              >
                {step.label}
              </Text>
              <Text style={styles.date}>{step.date}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Ordered Products */}
      <View style={styles.card}>
        <View style={styles.row}>
          <Image
            source={require("../../assets/images/box-icon.png")}
            style={styles.icon}
          />
          <Text style={styles.productsText}>4 mặt hàng</Text>
        </View>
        <TouchableOpacity>
          <Text style={styles.linkText}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>

      {/* Shipping Info */}
      <Text style={styles.sectionTitle}>Chi tiết vận chuyển</Text>
      <View style={styles.shippingCard}>
        <Text style={styles.shippingText}>
          18/9 Hồ Duy Dung, Cao Duyên, TP. Hà Tây, Việt Nam{"\n"}09473747534
        </Text>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  back: {
    fontSize: 24,
    color: "#333",
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  statusContainer: {
    marginBottom: 24,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 12,
  },
  statusText: {
    flex: 1,
    borderBottomColor: "#eee",
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
  },
  doneText: {
    color: "#000",
  },
  date: {
    fontSize: 12,
    color: "#666",
  },
  card: {
    backgroundColor: "#f5f5f5",
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    width: 26,
    height: 26,
    marginRight: 10,
  },
  productsText: {
    fontSize: 14,
    fontWeight: "500",
  },
  linkText: {
    color: "#007bff",
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  shippingCard: {
    backgroundColor: "#f2f2f2",
    padding: 12,
    borderRadius: 10,
    marginBottom: 40,
  },
  shippingText: {
    fontSize: 13,
    color: "#333",
  },
});
