import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { TabBar, TabView } from 'react-native-tab-view';
import { useAuth } from "../context/AuthContext";
import { getOrderDetailsByOrderId, getOrdersByUser } from "../utils/api";

const ORDER_TABS = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ xử lý" },
  { key: "confirmed", label: "Đã xác nhận" },
  { key: "shipping", label: "Đang vận chuyển" },
  { key: "delivered", label: "Đã giao hàng" },
  { key: "completed", label: "Hoàn thành" },
  { key: "cancelled", label: "Đã hủy" },
];

const STATUS_MAP = {
  pending: ["pending", "created", "chờ xử lý"],
  confirmed: ["confirmed", "đã xác nhận"],
  shipping: ["shipping", "shipped", "in_transit", "đang vận chuyển"],
  delivered: ["delivered", "received", "đã giao hàng"],
  completed: ["completed", "hoàn thành", "done", "success"],
  cancelled: ["cancelled", "canceled", "đã hủy", "hủy", "refunded"],
};

function getTabKeyFromStatus(status) {
  if (!status) return "pending";
  status = status.toLowerCase();
  for (const [tab, arr] of Object.entries(STATUS_MAP)) {
    if (arr.includes(status)) return tab;
  }
  return "pending";
}

export default function OrderHistoryScreen() {
  const navigation = useNavigation();
  const { userInfo } = useAuth();
  const [ordersWithDetails, setOrdersWithDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const layout = useRef(Dimensions.get('window')).current;
  const [index, setIndex] = useState(0);
  const [routes] = useState(ORDER_TABS.map(tab => ({ key: tab.key, title: tab.label })));
  const [modalVisible, setModalVisible] = useState(false);

  // Handler cho các lựa chọn trong modal
  const handleMenuSelect = (key) => {
    setModalVisible(false);
    if (key === 'cart') {
      navigation.navigate('CartScreen');
    } else if (key === 'shipping') {
      navigation.navigate('AddressListScreen');
    } else if (key === 'payment') {
      navigation.navigate('PaymentScreen');
    } else {
      // fallback
      console.log('Selected:', key);
    }
  };

  // Fetch orders and their details
  const fetchOrdersWithDetails = async () => {
    if (!userInfo?._id) return;
    try {
      setLoading(true);
      const userOrders = await getOrdersByUser(userInfo._id);
      const ordersWithDetailsPromises = userOrders.map(async (order) => {
        const details = await getOrderDetailsByOrderId(order._id);
        return {
          ...order,
          orderDetails: details
        };
      });
      const completedOrders = await Promise.all(ordersWithDetailsPromises);

      // Sắp xếp theo updatedAt (nếu không có thì dùng createdAt)
      completedOrders.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || 0);
        const dateB = new Date(b.updatedAt || b.createdAt || 0);
        return dateB - dateA; // Mới nhất lên đầu
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

  // Lọc đơn hàng theo tab và tìm kiếm
  const getFilteredOrders = (tabKey) => {
    let filtered = ordersWithDetails;
    if (tabKey !== "all") {
      filtered = filtered.filter((order) =>
        getTabKeyFromStatus(order.status) === tabKey
      );
    }
    if (search.trim()) {
      const keyword = search.trim().toLowerCase();
      filtered = filtered.filter((order) => {
        const matchOrderCode = order.order_code?.toLowerCase().includes(keyword);
        const matchProductName = order.orderDetails?.some(
          (prod) => prod.product_name?.toLowerCase().includes(keyword)
        );
        return matchOrderCode || matchProductName;
      });
    }
    return filtered;
  };

  // Render từng đơn hàng
  const renderOrderItem = ({ item }) => {
    const firstProduct = item.orderDetails?.[0] || {};
    const tabKey = getTabKeyFromStatus(item.status);
    const tabLabel = ORDER_TABS.find(t => t.key === tabKey)?.label || item.status || "";
    // Tổng số lượng sản phẩm trong đơn hàng
    const totalQuantity = item.orderDetails?.reduce((sum, prod) => sum + (prod.quantity || 0), 0) || 0;
    return (
      <TouchableOpacity 
        style={styles.orderCard}
        onPress={() => navigation.navigate("OrderDetail", { orderId: item._id })}
      >
        <View style={{ flexDirection: "row" }}>
          <Image
            source={firstProduct.product_image ? { uri: firstProduct.product_image } : require("../../assets/images/box-icon.png")}
            style={styles.productImage}
          />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.orderCode}>Mã đơn: {item.order_code}</Text>
            <Text style={styles.productName} numberOfLines={1}>
              {firstProduct.product_name || "Sản phẩm"}
              {item.orderDetails?.length > 1 ? ` và ${item.orderDetails.length - 1} sản phẩm khác` : ""}
            </Text>
            <Text style={styles.productInfoRow}>
              x{firstProduct.quantity || 1} {(firstProduct.product_price || 0).toLocaleString()}₫
            </Text>
            {/* <Text style={styles.productTotalQty}>
              Tổng số lượng: {totalQuantity}
            </Text> */}
            <Text style={styles.totalPrice}>
              Tổng: {(item.total_price || 0).toLocaleString()}₫
            </Text>
            <Text style={styles.orderStatus}>
              Trạng thái: {tabLabel}
            </Text>
          </View>
        </View>
        <View style={styles.orderActions}>
          {getTabKeyFromStatus(item.status) === "pending" && (
            <TouchableOpacity 
              style={styles.cancelBtn}
              onPress={() => {/* Handle cancel order */}}
            >
              <Text style={styles.cancelBtnText}>Hủy đơn hàng</Text>
            </TouchableOpacity>
          )}
          {getTabKeyFromStatus(item.status) === "delivered" && (
            <>
             <TouchableOpacity 
  style={styles.refundBtn}
  onPress={() => {
    navigation.navigate("RefundRequest", {
      orderId: item._id,
      orderCode: item.order_code,
      orderDetails: item.orderDetails,
    });
  }}
>
  <Text style={styles.refundBtnText}>Yêu cầu hoàn tiền</Text>
</TouchableOpacity>

              <TouchableOpacity 
  style={styles.reviewBtn}
  onPress={() => navigation.navigate("WriteReview", {
    orderId: item._id,
    orderDetails: item.orderDetails,
    orderCode: item.order_code
  })}
>
  <Text style={styles.reviewBtnText}>Viết đánh giá</Text>
</TouchableOpacity>

            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Render scene cho từng tab
  const renderScene = ({ route }) => {
    const filteredOrders = getFilteredOrders(route.key);
    if (loading) {
      return <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#007BFF" />;
    }
    if (filteredOrders.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Image 
            source={require("../../assets/images/empty-box.png")}
            style={styles.emptyImage}
          />
          <Text style={styles.emptyText}>Không có đơn hàng nào</Text>
        </View>
      );
    }
    return (
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item._id}
        renderItem={renderOrderItem}
        contentContainerStyle={{ paddingBottom: 30 }}
        style={{ marginTop: 10 }}
        refreshing={loading}
        onRefresh={fetchOrdersWithDetails}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <View style={styles.backIconWrap}>
            <Ionicons name="arrow-back" size={22} color="#222" />
          </View>
        </TouchableOpacity>
        <View style={styles.searchBarWrap}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm đơn hàng của bạn"
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => setModalVisible(true)}
        >
          <View style={styles.backIconWrap}>
            <Ionicons name="options-outline" size={22} color="#222" />
          </View>
        </TouchableOpacity>
      </View>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={props => (
          <TabBar
            {...props}
            scrollEnabled
            indicatorStyle={{ backgroundColor: '#007bff' }}
            style={{ backgroundColor: '#fff' }}
            labelStyle={{ color: '#222', fontWeight: 'bold' }}
            activeColor="#007bff"
            inactiveColor="#888"
          />
        )}
      />
      {/* Modal menu */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={styles.menuModal}>
            <Text style={styles.menuTitle}>Chọn chức năng</Text>
            <TouchableOpacity style={styles.menuBtn} onPress={() => handleMenuSelect('cart')}>
              <Ionicons name="cart-outline" size={20} color="#007bff" style={{marginRight:8}}/>
              <Text style={styles.menuBtnText}>Giỏ hàng</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuBtn} onPress={() => handleMenuSelect('shipping')}>
              <Ionicons name="location-outline" size={20} color="#007bff" style={{marginRight:8}}/>
              <Text style={styles.menuBtnText}>Thông tin vận chuyển</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuBtn} onPress={() => handleMenuSelect('payment')}>
              <Ionicons name="card-outline" size={20} color="#007bff" style={{marginRight:8}}/>
              <Text style={styles.menuBtnText}>Thanh toán</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
      <View style={{height: 50}}></View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff", 
    marginTop:40
  },
  header:{
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    marginBottom: 8,
    minHeight: 56,
  },
  backBtn: {
    padding: 8,
  },
  backIconWrap: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBarWrap: {
    flex: 1,
    marginHorizontal: 8,
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F6F6F6",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 3,
    marginBottom: 0,
    marginTop: 0,
  },

  searchInput: {
    marginLeft: 8,
    flex: 1,
    color: "#222",
  },
  tabsRow: {
    flexGrow: 0,
    marginBottom: 10,
    marginLeft: 8,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: "#007bff",
  },
  tabText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#fff",
  },
  orderCard: {
    backgroundColor: "#f6f6f6",
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  orderCode: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  productName: {
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 4,
    color: "#222",
  },
  productInfoRow: {
    fontSize: 13,
    color: "#000",
    marginBottom: 2,
  },
  productTotalQty: {
    fontSize: 13,
    color: "#666",
    marginBottom: 2,
  },
  orderStatus: {
    fontSize: 14,
    color: "#007bff",
    marginTop:10,
    textAlign:'right'
  },
  totalPrice: {
    textAlign:'right',
    fontWeight: "bold",
    color: "#222",
    fontSize: 15,
    marginTop:10
  },
  orderActions: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent: "flex-end",
  },
  cancelBtn: {
    backgroundColor: "#eee",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelBtnText: {
    color: "#222",
    fontWeight: "bold",
  },
  refundBtn: {
    backgroundColor: "#eee",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  refundBtnText: {
    color: "#222",
    fontWeight: "bold",
  },
  reviewBtn: {
    backgroundColor: "#FF5252",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  reviewBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
  },
  emptyImage: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  emptyText: {
    color: "#888",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    minWidth: 260,
    alignItems: 'flex-start',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  menuTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 16,
    color: '#222',
  },
  menuBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    width: '100%',
  },
  menuBtnText: {
    fontSize: 15,
    color: '#222',
  },
}); 