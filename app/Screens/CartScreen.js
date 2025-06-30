import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useCart } from '../hooks/useCart';

const COLORS = ["XANH DENIM", "ĐEN", "XÁM"];
const SIZES = ["L", "M", "S", "XL"];

function CartItem({ item, checked, onCheck, onRemove, onUpdate }) {
  const [showQtyModal, setShowQtyModal] = useState(false);
  const [newQty, setNewQty] = useState(item.quantity);
  const [selectedColor, setSelectedColor] = useState(item.color || COLORS[0]);
  const [selectedSize, setSelectedSize] = useState(item.size || SIZES[0]);

  console.log("Cart item product:", item.product);

  return (
    <View style={{ backgroundColor: "#fff", marginBottom: 12, borderRadius: 8, padding: 12, flexDirection: "row" }}>
      {/* Checkbox */}
      <TouchableOpacity onPress={onCheck} style={{ marginRight: 8, alignSelf: "flex-start",marginTop:20 }}>
        <Ionicons name={checked ? "checkbox" : "square-outline"} size={24} color="#2979FF" />
      </TouchableOpacity>
      {/* Ảnh */}
      <Image
        source={
          item.product.image_url
            ? { uri: item.product.image_url}
            : require("../../assets/images/box-icon.png")
        }
        style={{ width: 70, height: 70, borderRadius: 8, marginRight: 10 }}
      />
      {/* Thông tin */}
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: "bold", fontSize: 15 }}>{item.product.name}</Text>
        <Text style={{ fontWeight: "bold", color: "#222", marginVertical: 2 }}>{item.product.price.toLocaleString()} đ</Text>
        {/* Dropdowns */}
        <View style={{ flexDirection: "row", marginTop: 4 }}>
          {/* Màu */}
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, color: "#888" }}>Màu</Text>
            <Picker
              selectedValue={selectedColor}
              style={{ height: 30, width: "100%" }}
              onValueChange={setSelectedColor}
            >
              {COLORS.map(c => <Picker.Item key={c} label={c} value={c} />)}
            </Picker>
          </View>
          {/* Size */}
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, color: "#888" }}>Kích cỡ</Text>
            <Picker
              selectedValue={selectedSize}
              style={{ height: 30, width: "100%" }}
              onValueChange={setSelectedSize}
            >
              {SIZES.map(s => <Picker.Item key={s} label={s} value={s} />)}
            </Picker>
          </View>
          {/* Số lượng */}
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, color: "#888" }}>Số lượng</Text>
            <TouchableOpacity onPress={() => setShowQtyModal(true)}>
              <Text style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 4, padding: 4, textAlign: "center" }}>{item.quantity}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {/* Nút xóa */}
      <TouchableOpacity onPress={onRemove} style={{ alignSelf: "flex-start", marginLeft: 8 }}>
        <Ionicons name="trash-outline" size={22} color="#ef4444" />
      </TouchableOpacity>

      {/* Modal nhập số lượng */}
      <Modal visible={showQtyModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "#0008", justifyContent: "center", alignItems: "center" }}>
          <View style={{ backgroundColor: "#fff", borderRadius: 8, padding: 20, width: 250 }}>
            <Text style={{ fontWeight: "bold", marginBottom: 8 }}>Nhập số lượng</Text>
            <TextInput
              keyboardType="number-pad"
              value={String(newQty)}
              onChangeText={txt => setNewQty(Number(txt))}
              style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 4, padding: 8, marginBottom: 12 }}
            />
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <TouchableOpacity onPress={() => setShowQtyModal(false)} style={{ marginRight: 12 }}>
                <Text>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setShowQtyModal(false); onUpdate(newQty, selectedColor, selectedSize); }}>
                <Text style={{ color: "#2979FF" }}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const CartScreen = () => {
  const navigation = useNavigation();
  const { cartItems, loading, updateQuantity, removeFromCart, getTotal } = useCart();

  // State lưu trạng thái checked cho từng item
  const [checkedItems, setCheckedItems] = useState({}); // { [item._id]: true/false }

  const handleCheck = (itemId) => {
    setCheckedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleRemoveItem = (itemId) => {
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc muốn xoá sản phẩm khỏi giỏ hàng?",
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Xoá",
          style: "destructive",
          onPress: () => removeFromCart(itemId),
        },
      ]
    );
  };

  // Tính tổng chỉ cho các item được chọn
  const subtotal = cartItems.reduce(
    (sum, item) =>
      checkedItems[item._id] ? sum + (item.product?.price || 0) * item.quantity : sum,
    0
  );
  const shipping = 15000;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + tax;

  // Tăng/giảm số lượng
  const changeQuantity = (itemId, currentQuantity, delta) => {
    const newQty = currentQuantity + delta;
    if (newQty < 1) return;
    updateQuantity(itemId, newQty);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  if (cartItems.length === 0) {
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

        {/* Empty state */}
        <View style={styles.emptyContainer}>
          <Image 
            source={require("../../assets/images/empty-box.png")} 
            style={styles.emptyImage}
          />
          <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
          <Text style={styles.emptySubtitle}>
            Bạn chưa có sản phẩm nào trong giỏ hàng
          </Text>
          <TouchableOpacity
            style={styles.shopNowButton}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.shopNowText}>Mua sắm ngay</Text>
          </TouchableOpacity>
        </View>
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
        <Text style={styles.headerTitle}>Giỏ hàng ({cartItems.length})</Text>
      </View>

      {/* List sản phẩm */}
      <FlatList
        data={cartItems}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <CartItem
            item={item}
            checked={!!checkedItems[item._id]}
            onCheck={() => handleCheck(item._id)}
            onRemove={() => handleRemoveItem(item._id)}
            onUpdate={(newQty, color, size) => {
              changeQuantity(item._id, item.quantity, newQty - item.quantity);
              // Assuming you want to update the color and size
              // You might want to implement this part to actually update the item
            }}
          />
        )}
      />

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
    paddingTop: 30,
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyImage: {
    width: 120,
    height: 120,
    marginBottom: 20,
    opacity: 0.6,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginBottom: 30,
  },
  shopNowButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  shopNowText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
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



