import { Ionicons } from "@expo/vector-icons";
import {
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// Danh mục (dùng link ảnh)
const categories = [
  { id: "1", name: "Áo", image: "https://mcdn.coolmate.me/image/November2024/ao-the-thao.jpg" },
  { id: "2", name: "Quần", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8AhzfEeRqcZP7O_w_xe6WaBXBBv3yx1e2zQ&s" },
  { id: "3", name: "Giày", image: "https://product.hstatic.net/200000914145/product/2d33219dc1a64b109bd3c04e03cfcfde_e9a6cc60a3ae450282b77b70830c3b46.jpg" },
  { id: "4", name: "Túi", image: "https://fungift.vn/wp-content/uploads/2019/12/in-logo-tui-the-thao-1.jpg" },
  { id: "5", name: "Phụ kiện", image: "https://product.hstatic.net/1000288768/product/13_39815a14c48247499d33f5e0c2658575_grande.png" },
];

// Sản phẩm bán chạy
const bestSellers = [
  {
    id: "1",
    name: "Áo Polo Nam vải cá sấu",
    price: "519.000 VND",
    image: "https://mcdn.coolmate.me/image/November2024/ao-the-thao.jpg",
  },
  {
    id: "2",
    name: "Áo thun Nam Delta",
    price: "699.000 VND",
    oldPrice: "799.000 VND",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrjLryFzbqBHIBVTUPWCI6OdsCWqvsnOxR7gyhFPGMpC0_sxxKK_EdvQovIOku3VuqmxE&usqp=CAU",
  },
  {
    id: "3",
    name: "Quần Jeans Nam Trơn",
    price: "459.000 VND",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqPoClFNKF24VPaL3wdzKNwbSxhx_Sj8ir7El9PFVLpU9qdYPde6DT9mSTcxZPLHa7t30&usqp=CAU",
  },
  {
    id: "4",
    name: "Giày Sneaker Trắng Basic",
    price: "799.000 VND",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWNtuDe1RQkmD9OZIy1ar5ZazG3QptWzUQagVGxHfqG5guWF-tC_EHPM58_XUObnpGTZU&usqp=CAU",
  },
];

// Sản phẩm mới
const newProducts = [
  {
    id: "5",
    name: "Bộ thun nam ",
    price: "649.000 VND",
    image: "https://assets.adidas.com/images/w_940,f_auto,q_auto/a8dac888a08249f0a0225d4e53f1687f_9366/IZ2366_21_model.jpg",
  },
  {
    id: "6",
    name: "Bộ thể thao nam ",
    price: "599.000 VND",
    oldPrice: "699.000 VND",
    image: "https://product.hstatic.net/200000078815/product/jd1779-02_a091e9f755824d16a2859a5080c2459f_master.jpg",
  },
  {
    id: "7",
    name: "Áo Yonex",
    price: "329.000 VND",
    image: "https://bizweb.dktcdn.net/100/078/144/products/z4369805516867-9f4d1397d0c8c4caa8f586e06b5562f2.jpg?v=1684834275823",
  },
  {
    id: "8",
    name: "Áo thun ",
    price: "199.000 VND",
    image: "https://bizweb.dktcdn.net/thumb/large/100/078/144/products/2888-2.jpg?v=1742962093133",
  },
];

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{ uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHw2QkaKz5A0fJojQ8-9UMplLd0Iwh2N6qvQ&s" }}
          style={styles.avatar}
        />
        <Text style={styles.gender}>Nam ▼</Text>
        <Ionicons name="cart-outline" size={28} color="#007AFF" />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" />
        <TextInput placeholder="Tìm kiếm" style={{ flex: 1, marginLeft: 10 }} />
      </View>

      <ScrollView>
        {/* Danh mục */}
        <Section title="Danh mục">
          <FlatList
            data={categories}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.categoryItem}>
                <Image source={{ uri: item.image }} style={styles.categoryImage} />
                <Text style={styles.categoryName}>{item.name}</Text>
              </View>
            )}
          />
        </Section>

        {/* Bán chạy nhất */}
        <Section title="Bán chạy nhất">
          <FlatList
            data={bestSellers}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => <ProductCard product={item} />}
          />
        </Section>

        {/* Sản phẩm mới */}
        <Section title="Sản phẩm mới">
          <FlatList
            data={newProducts}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => <ProductCard product={item} />}
          />
        </Section>
      </ScrollView>

      {/* Navigation bottom tab */}
      <View style={styles.bottomNav}>
        <Ionicons name="home" size={24} color="#007AFF" />
        <Ionicons name="notifications-outline" size={24} color="#aaa" />
        <Ionicons name="heart-outline" size={24} color="#aaa" />
        <Ionicons name="person-outline" size={24} color="#aaa" />
      </View>
    </View>
  );
}

const Section = ({ title, children }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity>
        <Text style={styles.link}>Xem tất cả</Text>
      </TouchableOpacity>
    </View>
    {children}
  </View>
);

const ProductCard = ({ product }) => (
  <View style={styles.productCard}>
    <Image source={{ uri: product.image }} style={styles.productImage} />
    <Text numberOfLines={2} style={styles.productName}>
      {product.name}
    </Text>
    <Text style={styles.productPrice}>{product.price}</Text>
    {product.oldPrice && (
      <Text style={styles.oldPrice}>{product.oldPrice}</Text>
    )}
  </View>
);

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 50, paddingHorizontal: 16 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  avatar: { width: 32, height: 32, borderRadius: 16 },
  gender: { fontSize: 16, fontWeight: "500" },
  searchContainer: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 12,
    marginVertical: 16,
    alignItems: "center",
  },
  section: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: "row", justifyContent: "space-between", marginBottom: 10,
  },
  sectionTitle: { fontSize: 18, fontWeight: "600" },
  link: { color: "#007AFF" },
  categoryItem: { alignItems: "center", marginRight: 16 },
  categoryImage: { width: 60, height: 60, borderRadius: 30, marginBottom: 6 },
  categoryName: { fontSize: 14 },
  productCard: {
    width: 150,
    marginRight: 16,
    backgroundColor: "#fafafa",
    borderRadius: 12,
    padding: 10,
  },
  productImage: { width: "100%", height: 120, borderRadius: 8 },
  productName: { fontSize: 14, marginVertical: 4 },
  productPrice: { fontWeight: "bold", fontSize: 14 },
  oldPrice: {
    fontSize: 12,
    textDecorationLine: "line-through",
    color: "#aaa",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: "#eee",
  },
});