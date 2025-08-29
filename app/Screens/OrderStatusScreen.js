import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { getOrderDetailsByOrderId, getOrdersByUser } from "../utils/api";

const STATUS_TABS = ["Đang xử lý", "Đang vận chuyển", "Đã nhận", "Đã huỷ"];

export default function Orders() {
  const [activeStatus, setActiveStatus] = useState("Đang xử lý");
  const [ordersWithDetails, setOrdersWithDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const { userInfo } = useAuth();

  // Fetch orders and their details
  const fetchOrdersWithDetails = async () => {
    if (!userInfo?._id) return;
    try {
      setLoading(true);
      const ordersArray = await getOrdersByUser(userInfo._id);
      const ordersWithDetailsPromises = ordersArray.map(async (order) => {
        let details = await getOrderDetailsByOrderId(order._id);
        if (!Array.isArray(details)) details = [];
        return {
          ...order,
          orderDetails: details
        };
      });
      const completedOrders = await Promise.all(ordersWithDetailsPromises);
      completedOrders.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || 0);
        const dateB = new Date(b.updatedAt || b.createdAt || 0);
        return dateB - dateA;
      });
      setOrdersWithDetails(completedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersWithDetails();
  }, [userInfo]);

  // Lọc đơn hàng theo trạng thái
  const getFilteredOrders = (status) => {
    if (status === "Đang xử lý") {
      return ordersWithDetails.filter(order => 
        ["pending", "created", "chờ xử lý"].includes(order.status?.toLowerCase())
      );
    } else if (status === "Đang vận chuyển") {
      return ordersWithDetails.filter(order => 
        ["shipping", "shipped", "in_transit", "đang vận chuyển"].includes(order.status?.toLowerCase())
      );
    } else if (status === "Đã nhận") {
      return ordersWithDetails.filter(order => 
        ["delivered", "received", "đã giao hàng", "completed", "hoàn thành"].includes(order.status?.toLowerCase())
      );
    } else if (status === "Đã huỷ") {
      return ordersWithDetails.filter(order => 
        ["cancelled", "canceled", "đã hủy", "hủy", "refunded"].includes(order.status?.toLowerCase())
      );
    }
    return ordersWithDetails;
  };

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

  const renderOrderItem = ({ item }) => {
    const firstProduct = item.orderDetails?.[0] || {};
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("OrderDetail", { orderId: item._id })}
      >
        <View style={styles.cardLeft}>
          <Image
            source={firstProduct.product_image ? { uri: firstProduct.product_image } : require("../../assets/images/box-icon.png")}
            style={styles.icon}
          />
          <View>
            <Text style={styles.orderText}>Đơn hàng #{item.order_code}</Text>
            <Text style={styles.subText}>
              {firstProduct.product_name || "Sản phẩm"}
              {item.orderDetails?.length > 1 ? ` và ${item.orderDetails.length - 1} sản phẩm khác` : ""}
            </Text>
            {/* Hiển thị biến thể nếu có */}
            {(firstProduct.size || firstProduct.color || firstProduct.variant_name || firstProduct.product_variant) && (
              <Text style={styles.productVariant}>
                {[
                  firstProduct.size && `Kích cỡ: ${firstProduct.size}`,
                  firstProduct.color && `Màu: ${firstProduct.color}`,
                  firstProduct.variant_name && `Biến thể: ${firstProduct.variant_name}`,
                  firstProduct.product_variant && `Biến thể: ${firstProduct.product_variant}`
                ].filter(Boolean).join(" | ")}
              </Text>
            )}
          </View>
        </View>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>
    );
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
        <Text style={styles.headerTitle}>Đơn hàng</Text>
      </View>

      <View style={styles.tabsContainer}>{STATUS_TABS.map(renderTab)}</View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#007BFF" />
      ) : (
        <FlatList
          data={getFilteredOrders(activeStatus)}
          keyExtractor={(item) => item._id}
          renderItem={renderOrderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshing={loading}
          onRefresh={fetchOrdersWithDetails}
        />
      )}
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
  productVariant: {
    fontSize: 11,
    color: "#888",
    marginTop: 2,
    fontStyle: "italic",
  },
  arrow: {
    fontSize: 20,
    color: "#999",
    marginRight: 4,
  },
});
