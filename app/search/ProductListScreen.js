import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import { useState } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// Mô phỏng danh sách sản phẩm
const ALL_PRODUCTS = [
  { id: "1", name: "Áo thun Rocquet", category: "Áo", price: 187000, gender: "nam", onSale: true, image: require("../../assets/images/shirt.png") },
  { id: "2", name: "Áo thun U.S. Cotton", category: "Áo", price: 174000, gender: "nu", onSale: false, image: require("../../assets/images/shirt.png") },
  { id: "3", name: "Nón lưỡi trai", category: "Phụ kiện", price: 120000, gender: "unisex", onSale: true, image: require("../../assets/images/accessory.png") },
  { id: "4", name: "Quần short", category: "Quần", price: 199000, gender: "nam", onSale: true, image: require("../../assets/images/pants.png") },
  { id: "5", name: "Giày sneaker", category: "Giày", price: 399000, gender: "unisex", onSale: false, image: require("../../assets/images/shoes.png") },
  { id: "6", name: "Túi đeo chéo", category: "Túi", price: 250000, gender: "nu", onSale: true, image: require("../../assets/images/bag.png") },
];

const ProductListScreen = () => {
  const route = useRoute();
  const { category, filters } = route.params;
  const [searchText, setSearchText] = useState("");
  const [genderFilter, setGenderFilter] = useState(filters?.gender || "all");
  const [priceFilter, setPriceFilter] = useState(filters?.price || "all");

  const handleGenderChange = (value) => setGenderFilter(value);
  const handlePriceChange = (value) => setPriceFilter(value);

  const applyFilters = (products) => {
    return products
      .filter(p => p.category === category)
      .filter(p => p.name.toLowerCase().includes(searchText.toLowerCase()))
      .filter(p => filters?.onSale ? p.onSale : true)
      .filter(p => genderFilter === "all" ? true : p.gender === genderFilter)
      .filter(p => {
        if (priceFilter === "low") return p.price < 200000;
        if (priceFilter === "medium") return p.price >= 200000 && p.price <= 300000;
        if (priceFilter === "high") return p.price > 300000;
        return true;
      });
  };

  const filteredProducts = applyFilters(ALL_PRODUCTS);

  const renderProduct = ({ item }) => (
    <View style={styles.card}>
      <Image source={item.image} style={styles.productImage} />
      <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
      <Text style={styles.productPrice}>{item.price.toLocaleString()} VND</Text>
      <Ionicons name="heart-outline" size={20} color="#999" style={styles.heartIcon} />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Danh mục: {category}</Text>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#666" />
        <TextInput
          placeholder={`Tìm trong ${category}`}
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchInput}
        />
        <Ionicons name="close" size={20} color="#666" />
      </View>

      {/* Dropdown bộ lọc */}
      <View style={styles.filterRow}>
        <Text>Giới tính:</Text>
        <TouchableOpacity onPress={() => setGenderFilter("all")}><Text style={styles.filterOption(genderFilter === "all")}>Tất cả</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setGenderFilter("nam")}><Text style={styles.filterOption(genderFilter === "nam")}>Nam</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setGenderFilter("nu")}><Text style={styles.filterOption(genderFilter === "nu")}>Nữ</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setGenderFilter("unisex")}><Text style={styles.filterOption(genderFilter === "unisex")}>Unisex</Text></TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        <Text>Giá:</Text>
        <TouchableOpacity onPress={() => setPriceFilter("all")}><Text style={styles.filterOption(priceFilter === "all")}>Tất cả</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setPriceFilter("low")}><Text style={styles.filterOption(priceFilter === "low")}>Dưới 200k</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setPriceFilter("medium")}><Text style={styles.filterOption(priceFilter === "medium")}>200k–300k</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setPriceFilter("high")}><Text style={styles.filterOption(priceFilter === "high")}>Trên 300k</Text></TouchableOpacity>
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const CARD_WIDTH = (Dimensions.get("window").width - 60) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 10,
    fontSize: 16,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: "100%",
    height: 120,
    resizeMode: "contain",
    borderRadius: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: "500",
    marginVertical: 6,
  },
  productPrice: {
    fontSize: 13,
    color: "#FF3B30",
    fontWeight: "600",
  },
  heartIcon: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  filterOption: (active) => ({
    backgroundColor: active ? "#007AFF" : "#eee",
    color: active ? "#fff" : "#000",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 13,
  }),
});

export default ProductListScreen;
