import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";

// 👇 user_id giả lập
const USER_ID = "684fff1dca202e28f58ddaf9";
const API_BASE = "http://192.168.52.106:3000/api"; 

const CartScreen = () => {
  const navigation = useNavigation();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ B1-3: Gọi dữ liệu
  useEffect(() => {
    const fetchCartData = async () => {
      try {
        // 1. Lấy Cart theo user_id
        console.log("🧪 Gọi API cart của user:", USER_ID);
        const cartRes = await axios.get(`${API_BASE}/cart/api/carts/user/${USER_ID}`);
        const cart = cartRes.data;
        console.log("Cart:", cart);
        // 2. Lấy CartItem theo cart_id
        const cartItemRes = await axios.get(`${API_BASE}/cart-items/api/cart-items/cart/${cart._id}`);
        const items = cartItemRes.data;
        console.log("CartItem:", items);
     
        // 3. Lấy Product cho từng CartItem
const itemsWithProduct = [];

for (const item of items) {
  try {
    const productId = item.product_id._id || item.product_id.toString();
    console.log("📦 Đang lấy sản phẩm với ID:", item.product_id);
    const productRes = await axios.get(`${API_BASE}/products/api/products/${productId}`);
    const product = productRes.data;
    console.log("✅ Sản phẩm lấy được:", product.name);

    itemsWithProduct.push({
      ...item,
      product: product,
    });
  } catch (err) {
    console.error(`❌ Không thể lấy sản phẩm ID ${item.product_id}:`, err.message);
    itemsWithProduct.push({
      ...item,
      product: null,
    });
  }
}


        setCartItems(itemsWithProduct.filter(item => item.product !== null));
      } catch (err) {
        console.error(err);
        Alert.alert("Lỗi", "Không thể tải dữ liệu giỏ hàng");
      } finally {
        setLoading(false);
      }
    };

    fetchCartData();
  }, []);

  const handleRemoveItem = async (itemId) => {
  Alert.alert(
    "Xác nhận",
    "Bạn có chắc muốn xoá sản phẩm khỏi giỏ hàng?",
    [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Xoá",
        style: "destructive",
        onPress: async () => {
          try {
            await axios.delete(`${API_BASE}/cart-items/api/cart-items/${itemId}`);
            setCartItems((prev) => prev.filter((item) => item._id !== itemId));
          } catch (err) {
            console.error("❌ Lỗi xoá sản phẩm:", err.message);
            Alert.alert("Lỗi", "Không thể xoá sản phẩm khỏi giỏ hàng");
          }
        },
      },
    ]
  );
};

  // ✅ Tính tổng
  const subtotal = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
  }, [cartItems]);

  const shipping = 15000;
const tax = Math.round(subtotal * 0.05);
const total = subtotal + shipping + tax;

  // ✅ Tăng/giảm số lượng
  const changeQuantity = async (index, delta) => {
    const item = cartItems[index];
    const newQty = item.quantity + delta;
    if (newQty < 1) return;

    try {
      await axios.put(`${API_BASE}/cart-items/api/cart-items/${item._id}`, {
        quantity: newQty,
      });

      // Cập nhật local state
      setCartItems((prev) => {
        const updated = [...prev];
        updated[index] = { ...item, quantity: newQty };
        return updated;
      });
    } catch (err) {
      console.error("Lỗi cập nhật số lượng", err);
      Alert.alert("Lỗi", "Không thể cập nhật số lượng");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.customHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <View style={styles.backIconWrap}>
            <Ionicons name="arrow-back" size={22} color="#222" />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Giỏ hàng</Text>
      </View>

      {/* List sản phẩm */}
      <ScrollView style={styles.productList}>
        {cartItems.map((item, index) => (
          <View key={item._id} style={styles.item}>
            <Image source={{ uri: item.product.image_url }} style={styles.image} />
            <TouchableOpacity
            style={styles.removeIcon}
            onPress={() => handleRemoveItem(item._id)}
             >
            <Ionicons name="close-circle" size={20} color="#ef4444" />
            </TouchableOpacity>

            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.product.name}</Text>
              <Text style={styles.price}>
                {(item.product.price * item.quantity).toLocaleString()} VND
              </Text>
              <Text style={styles.label}>Số lượng: {item.quantity}</Text>
            </View>
            <View style={styles.quantityControl}>
              <TouchableOpacity
                style={styles.qtyButton}
                onPress={() => changeQuantity(index, +1)}
              >
                <Text style={styles.qtyText}>+</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.qtyButton}
                onPress={() => changeQuantity(index, -1)}
              >
                <Text style={styles.qtyText}>-</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Tổng */}
      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.label}>Tạm tính</Text>
          <Text>{subtotal.toLocaleString()} VND</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.label}>Phí vận chuyển</Text>
          <Text>{shipping.toFixed(0)} VND</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.label}>Thuế</Text>
          <Text>{tax.toFixed(0)} VND</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Tổng</Text>
          <Text style={styles.totalAmount}>{total.toLocaleString()} VND</Text>
        </View>
      </View>

      {/* Nút thanh toán */}
      <TouchableOpacity
        style={styles.checkoutButton}
        onPress={() => navigation.navigate("Checkout")}
      >
        <Text style={styles.checkoutText}>Thanh toán</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CartScreen;

import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  customHeader: {
    height: 64,
    paddingTop: 24,
    marginBottom: 8,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  backBtn: {
    position: "absolute",
    top: 24,
    left: 16,
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

  productList: {
    marginTop: 20,
  },
  item: {
    flexDirection: "row",
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    alignItems: "center",
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  itemInfo: {
    flex: 1,
    justifyContent: "center",
  },
  itemName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
  },
  price: {
    marginTop: 4,
    fontWeight: "600",
    color: "#222",
  },
  label: {
    marginTop: 4,
    fontSize: 13,
    color: "#666",
  },

  quantityControl: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyButton: {
    backgroundColor: "#007BFF",
    borderRadius: 20,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 2,
  },
  qtyText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  summary: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  totalLabel: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#000",
  },
  totalAmount: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#000",
  },

  checkoutButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 14,
    borderRadius: 25,
    marginTop: 20,
    alignItems: "center",
  },
  checkoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  removeIcon: {
  position: "absolute",
  top: 3,
  right: 3,
  zIndex: 1,
  bottom: 3,
},

});



