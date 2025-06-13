import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const notifications = [
  {
    id: "1",
    icon: require("../..//assets/images/bell-red.png"), // hình chuông có chấm đỏ
    text: "Này Quân! Đơn hàng của bạn đã được đặt thành công! Nhấn vào để xem chi t...",
  },
  {
    id: "2",
    icon: require("../../assets/images/bell-gray.png"), // chuông bình thường
    text: "Chào Quân! Đơn hàng #56868 đã được huỷ thành công.",
  },
  {
    id: "3",
    icon: require("../../assets/images/bell-gray.png"),
    text: "Này Quân! Đơn hàng #85659 của bạn sẽ được giao vào ngày mai. Nhớ hãy ki...",
  },
];

const NotificationItem = ({ item, navigation }) => (
  <TouchableOpacity
    style={styles.card}
    onPress={() => navigation.navigate("OrderStatus", { orderId: item.id })}
  >
    <Image source={item.icon} style={styles.icon} resizeMode="contain" />
    <Text style={styles.text}>{item.text}</Text>
  </TouchableOpacity>
);

export default function NotificationsScreen() {
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
        <Text style={styles.headerTitle}>Thông báo</Text>
      </View>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationItem item={item} navigation={navigation} />
        )}
        contentContainerStyle={{ gap: 12 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 24,
    textAlign: "center",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#F6F6F6",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  text: {
    flex: 1,
    color: "#333",
    fontSize: 14,
  },
  customHeader: {
    height: 64,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    position: "relative",
    marginBottom: 8,
    paddingTop: 24, // status bar padding
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
});
