import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useCart } from "../hooks/useCart";

function CartItem({ item, checked, onCheck, onRemove, onUpdate, onPress }) {
  const [showQtyModal, setShowQtyModal] = useState(false);
  const [newQty, setNewQty] = useState(item.quantity);

  return (
    <View
      style={{
        backgroundColor: "#fff",
        marginBottom: 12,
        borderRadius: 8,
        padding: 12,
        flexDirection: "row",
      }}
    >
      {/* Checkbox */}
      <TouchableOpacity
        onPress={onCheck}
        style={{ marginRight: 8, alignSelf: "flex-start", marginTop: 20 }}
      >
        <Ionicons
          name={checked ? "checkbox" : "square-outline"}
          size={24}
          color="#2979FF"
        />
      </TouchableOpacity>

      {/* Nội dung sản phẩm + ảnh */}
      <TouchableOpacity
        onPress={onPress}
        style={{ flex: 1, flexDirection: "row" }}
      >
        <Image
          source={
            item.product?.image_url
              ? { uri: item.product.image_url }
              : require("../../assets/images/box-icon.png")
          }
          style={{ width: 70, height: 70, borderRadius: 8, marginRight: 10 }}
        />
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: "bold", fontSize: 15 }}>
            {item.product?.name || "Sản phẩm không xác định"}
          </Text>
          <Text style={{ fontWeight: "bold", color: "#222", marginVertical: 2 }}>
            {(item.price_at_time || 0).toLocaleString()} đ
          </Text>
          <Text style={{ fontSize: 11, color: "#888" }}>
            Nhấn để xem chi tiết sản phẩm
          </Text>

          {/* Số lượng với nút + - */}
<View style={{ flexDirection: "row", marginTop: 4, alignItems: "center" }}>
  <Text style={{ fontSize: 12, color: "#888", marginRight: 8 }}>
    Số lượng:
  </Text>
  <TouchableOpacity
    onPress={() => onUpdate(item.quantity - 1)}
    disabled={item.quantity <= 1}
    style={{
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 4,
      marginRight: 4,
      opacity: item.quantity <= 1 ? 0.4 : 1,
    }}
  >
    <Text>-</Text>
  </TouchableOpacity>

  <TouchableOpacity onPress={() => setShowQtyModal(true)}>
    <Text
      style={{
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 2,
        minWidth: 40,
        textAlign: "center",
        marginRight: 4,
      }}
    >
      {item.quantity}
    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    onPress={() => onUpdate(item.quantity + 1)}
    style={{
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 4,
    }}
  >
    <Text>+</Text>
  </TouchableOpacity>
</View>

        </View>
      </TouchableOpacity>

      {/* Nút xóa */}
      <TouchableOpacity
        onPress={onRemove}
        style={{ alignSelf: "flex-start", marginLeft: 8 }}
      >
        <Ionicons name="trash-outline" size={22} color="#ef4444" />
      </TouchableOpacity>

      {/* Modal nhập số lượng */}
      <Modal visible={showQtyModal} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "#0008",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 8,
              padding: 20,
              width: 250,
            }}
          >
            <Text style={{ fontWeight: "bold", marginBottom: 8 }}>
              Nhập số lượng
            </Text>
            <TextInput
              keyboardType="number-pad"
              value={String(newQty)}
              onChangeText={(txt) => setNewQty(Number(txt) || 1)}
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 4,
                padding: 8,
                marginBottom: 12,
              }}
            />
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <TouchableOpacity
                onPress={() => setShowQtyModal(false)}
                style={{ marginRight: 12 }}
              >
                <Text>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowQtyModal(false);
                  onUpdate(newQty);
                }}
              >
                <Text style={{ color: "#2979FF" }}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <View style={{height: 50}}></View>
    </View>
  );
}

const CartScreen = () => {
  const navigation = useNavigation();
  const { 
    cartItems, 
    loading, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    refreshCart,
    getTotal 
  } = useCart();

  // State lưu trạng thái checked cho từng item
  const [checkedItems, setCheckedItems] = useState({}); // { [item._id]: true/false }

  const handleCheck = (itemId) => {
    setCheckedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleRemoveItem = (itemId) => {
    Alert.alert("Xác nhận", "Bạn có chắc muốn xoá sản phẩm khỏi giỏ hàng?", [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Xoá",
        style: "destructive",
        onPress: () => removeFromCart(itemId),
      },
    ]);
  };


  const handleClearCart = () => {
    Alert.alert(
      "Xác nhận", 
      "Bạn có chắc muốn xóa tất cả sản phẩm khỏi giỏ hàng?", 
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Xóa tất cả",
          style: "destructive",
          onPress: () => clearCart(),
        },
      ]
    );
  };

  // Tính tổng chỉ cho các item được chọn
  const subtotal = cartItems.reduce(
    (sum, item) =>
      checkedItems[item._id]
        ? sum + (item.price_at_time || item.product?.price || 0) * item.quantity
        : sum,
    0
  );
  const shipping = 15000;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + tax;

  const handleUpdateQuantity = (itemId, newQty) => {
    if (newQty < 1) return;
    updateQuantity(itemId, newQty);
  };

  useFocusEffect(
    useCallback(() => {
      refreshCart();
    }, [])
  );

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
            onPress={() => navigation.navigate("HomeScreen")}
          >
            <Text style={styles.shopNowText}>Mua sắm ngay</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.customHeader}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <View style={styles.backIconWrap}>
              <Ionicons name="arrow-back" size={22} color="#222" />
            </View>
          </TouchableOpacity>
        <Text style={styles.headerTitle}>Giỏ hàng ({cartItems.length})</Text>
        {cartItems.length > 0 && (
          <TouchableOpacity
            style={styles.clearCartButton}
            onPress={handleClearCart}
          >
            <Text style={styles.clearCartText}>Xóa tất cả</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <CartItem
            item={item}
            checked={!!checkedItems[item._id]}
            onCheck={() => handleCheck(item._id)}
            onRemove={() => handleRemoveItem(item._id)}
            onUpdate={(newQty) => handleUpdateQuantity(item._id, newQty)}
            onPress={() =>
              navigation.navigate("ProductDetail", { product: item.product })
            }
          />
        )}
      />
{/* 
      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.label}>Giá cố</Text>
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
      </View> */}

      <TouchableOpacity
        style={[
          styles.checkoutButton,
          Object.keys(checkedItems).length === 0 && styles.checkoutButtonDisabled,
        ]}
        onPress={() => {
          const selectedItems = cartItems.filter(
            (item) => checkedItems[item._id]
          );
          if (selectedItems.length === 0) {
            Alert.alert(
              "Thông báo",
              "Vui lòng chọn ít nhất một sản phẩm để thanh toán"
            );
            return;
          }
          navigation.navigate("Checkout", {
            checkedItems: selectedItems,
          });
        }}
        // disabled={Object.keys(checkedItems).length === 0}
      >
        <Text style={styles.checkoutText}>
          Thanh toán
        </Text>
      </TouchableOpacity>
      {/* Khoảng trống để tránh bị che */}
      <View style={{ height: 80 }} />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  customHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: 64,
    paddingTop: 24,
    marginBottom: 8,
    backgroundColor: "#fff",
    alignItems: "center",
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
  position: "absolute",
  left: 0,
  right: 0,
  top: 30,
  textAlign: "center",
  fontSize: 20,
  fontWeight: "bold",
  color: "#222",
},
  clearCartButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: "#FF6B6B",
  },
  clearCartText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
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
  label: {
    fontSize: 14,
    color: "#666",
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
  checkoutButtonDisabled: {
    backgroundColor: "#ccc",
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
});

export default CartScreen;