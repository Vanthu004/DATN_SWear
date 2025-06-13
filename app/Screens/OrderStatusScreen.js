import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const STATUS_TABS = ["Đang xử lý", "Đang vận chuyển", "Đã nhận", "Đã huỷ"];

const MOCK_ORDERS = [
  { id: "456765", products: 4 },
  { id: "454569", products: 2 },
  { id: "454809", products: 1 },
];

export default function Orders() {
  const [activeStatus, setActiveStatus] = useState("Đang xử lý");
  const navigation = useNavigation();

  const renderTab = (tab) => {
    return (
      <TouchableOpacity
        key={tab}
        style={[styles.tab, activeStatus === tab && styles.activeTab]}
        onPress={() => setActiveStatus(tab)}
      >
        <Text
          style={[styles.tabText, activeStatus === tab && styles.activeTabText]}
        >
          {tab}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("ScreenName")}
    >
      <View style={styles.cardLeft}>
        <Image
          source={require("../../assets/images/box-icon.png")} // thay bằng icon hộp bạn có
          style={styles.icon}
        />
        <View>
          <Text style={styles.orderText}>Đơn hàng #{item.id}</Text>
          <Text style={styles.subText}>{item.products} sản phẩm</Text>
        </View>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

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
        <Text style={styles.headerTitle}>Đơn hàng</Text>
      </View>

      <View style={styles.tabsContainer}>{STATUS_TABS.map(renderTab)}</View>

      <FlatList
        data={MOCK_ORDERS}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingHorizontal: 16,
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
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    flexWrap: "wrap",
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginBottom: 8,
  },
  activeTab: {
    backgroundColor: "#007bff",
  },
  tabText: {
    fontSize: 13,
    color: "#333",
  },
  activeTabText: {
    color: "white",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f6f6f6",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    justifyContent: "space-between",
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    width: 28,
    height: 28,
    marginRight: 12,
  },
  orderText: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  subText: {
    fontSize: 12,
    color: "#666",
  },
  arrow: {
    fontSize: 20,
    color: "#999",
    marginRight: 4,
  },
});
