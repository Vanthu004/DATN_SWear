import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const cartItems = [
  {
    name: "Áo Polo Nam thêu chữ rã",
    image: require("../../assets/images/anhtt1.png"),
    price: 249000,
  },
  {
    name: "Áo thể thao Nam Recycle",
    image: require("../../assets/images/anhtt2.png"),
    price: 269000,
  },
];

const CartScreen = () => {
  const navigation = useNavigation();
  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  const shipping = 0;
  const tax = 0;
  const total = subtotal + shipping + tax;

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
        <Text style={styles.headerTitle}>Giỏ hàng</Text>
      </View>

      {/* Product List */}
      <ScrollView style={styles.productList}>
        {cartItems.map((item, index) => (
          <View key={index} style={styles.item}>
            <Image source={item.image} style={styles.image} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemDetail}>
                Kích cỡ - <Text style={styles.bold}>M</Text> Màu -{" "}
                <Text style={styles.bold}>Trắng</Text>
              </Text>
              <Text style={styles.price}>
                {item.price.toLocaleString()} VND
              </Text>
            </View>
            <View style={styles.quantityControl}>
              <TouchableOpacity style={styles.qtyButton}>
                <Text style={styles.qtyText}>+</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.qtyButton}>
                <Text style={styles.qtyText}>-</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.label}>Tạm tính</Text>
          <Text>{subtotal.toLocaleString()} VND</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.label}>Phí vận chuyển</Text>
          <Text>{shipping.toFixed(2)} VND</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.label}>Thuế</Text>
          <Text>{tax.toFixed(2)} VND</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Tổng</Text>
          <Text style={styles.totalAmount}>{total.toLocaleString()} VND</Text>
        </View>
      </View>

      {/* Checkout */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingHorizontal: 20,
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
  },
  itemName: {
    fontSize: 14,
    fontWeight: "500",
  },
  itemDetail: {
    color: "#666",
    fontSize: 13,
    marginTop: 4,
  },
  bold: {
    fontWeight: "bold",
    color: "#000",
  },
  price: {
    marginTop: 4,
    fontWeight: "600",
  },
  quantityControl: {
    flexDirection: "column",
    alignItems: "center",
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
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  label: {
    color: "#999",
  },
  totalLabel: {
    fontWeight: "bold",
  },
  totalAmount: {
    fontWeight: "bold",
    fontSize: 16,
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
});
