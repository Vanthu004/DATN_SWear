import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ProductCard from "../components/ProductCard";

// Danh mục (dùng link ảnh)
const categories = [
  {
    id: "1",
    name: "Áo",
    image: "https://mcdn.coolmate.me/image/November2024/ao-the-thao.jpg",
  },
  {
    id: "2",
    name: "Quần",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8AhzfEeRqcZP7O_w_xe6WaBXBBv3yx1e2zQ&s",
  },
  {
    id: "3",
    name: "Giày",
    image:
      "https://product.hstatic.net/200000914145/product/2d33219dc1a64b109bd3c04e03cfcfde_e9a6cc60a3ae450282b77b70830c3b46.jpg",
  },
  {
    id: "4",
    name: "Túi",
    image:
      "https://fungift.vn/wp-content/uploads/2019/12/in-logo-tui-the-thao-1.jpg",
  },
  {
    id: "5",
    name: "Phụ kiện",
    image:
      "https://product.hstatic.net/1000288768/product/13_39815a14c48247499d33f5e0c2658575_grande.png",
  },
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
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrjLryFzbqBHIBVTUPWCI6OdsCWqvsnOxR7gyhFPGMpC0_sxxKK_EdvQovIOku3VuqmxE&usqp=CAU",
  },
  {
    id: "3",
    name: "Quần Jeans Nam Trơn",
    price: "459.000 VND",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqPoClFNKF24VPaL3wdzKNwbSxhx_Sj8ir7El9PFVLpU9qdYPde6DT9mSTcxZPLHa7t30&usqp=CAU",
  },
  {
    id: "4",
    name: "Giày Sneaker Trắng Basic",
    price: "799.000 VND",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWNtuDe1RQkmD9OZIy1ar5ZazG3QptWzUQagVGxHfqG5guWF-tC_EHPM58_XUObnpGTZU&usqp=CAU",
  },
];

// Sản phẩm mới
const newProducts = [
  {
    id: "5",
    name: "Bộ thun nam ",
    price: "649.000 VND",
    image:
      "https://assets.adidas.com/images/w_940,f_auto,q_auto/a8dac888a08249f0a0225d4e53f1687f_9366/IZ2366_21_model.jpg",
  },
  {
    id: "6",
    name: "Bộ thể thao nam ",
    price: "599.000 VND",
    oldPrice: "699.000 VND",
    image:
      "https://product.hstatic.net/200000078815/product/jd1779-02_a091e9f755824d16a2859a5080c2459f_master.jpg",
  },
  {
    id: "7",
    name: "Áo Yonex",
    price: "329.000 VND",
    image:
      "https://bizweb.dktcdn.net/100/078/144/products/z4369805516867-9f4d1397d0c8c4caa8f586e06b5562f2.jpg?v=1684834275823",
  },
  {
    id: "8",
    name: "Áo thun ",
    price: "199.000 VND",
    image:
      "https://bizweb.dktcdn.net/thumb/large/100/078/144/products/2888-2.jpg?v=1742962093133",
  },
];

// Section component tách riêng
const Section = ({
  title,
  data,
  horizontal,
  renderItem,
  onSeeAll,
  titleColor,
}) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, titleColor && { color: titleColor }]}>
        {title}
      </Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={styles.link}>Xem tất cả</Text>
        </TouchableOpacity>
      )}
    </View>
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      horizontal={horizontal}
      showsHorizontalScrollIndicator={false}
      renderItem={renderItem}
      contentContainerStyle={horizontal ? { paddingLeft: 2 } : {}}
    />
  </View>
);

export default function HomeScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.bgGray}>
      <View style={styles.cardContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={{
              uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHw2QkaKz5A0fJojQ8-9UMplLd0Iwh2N6qvQ&s",
            }}
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.genderBtn}>
            <Text style={styles.gender}>Nam</Text>
            <Ionicons
              name="chevron-down"
              size={16}
              color="#222"
              style={{ marginLeft: 2 }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cartBtn}
            onPress={() => navigation.navigate("Cart")}
          >
            <Ionicons name="cart-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainerImproved}>
          <Ionicons name="search" size={18} color="#888" />
          <TextInput
            placeholder="Tìm kiếm"
            style={styles.searchInput}
            placeholderTextColor="#888"
          />
        </View>

        {/* Danh mục */}
        <View style={{ marginBottom: 18 }}>
          <FlatList
            data={categories}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [
                  styles.categoryItem,
                  pressed && { opacity: 0.7, transform: [{ scale: 0.96 }] },
                ]}
                android_ripple={{ color: "#eee" }}
              >
                <View style={styles.categoryIconWrap}>
                  <Image
                    source={{ uri: item.image }}
                    style={styles.categoryImage}
                  />
                </View>
                <Text style={styles.categoryName}>{item.name}</Text>
              </Pressable>
            )}
            contentContainerStyle={{ paddingLeft: 2, paddingRight: 8 }}
          />
        </View>

        {/* Sản phẩm bán chạy nhất */}
        <Section
          title="Bán chạy nhất"
          data={bestSellers}
          horizontal
          renderItem={({ item }) => (
            <ProductCard product={item} navigation={navigation} />
          )}
          onSeeAll={() => {}}
        />

        {/* Sản phẩm mới */}
        <Section
          title="Mới nhất"
          data={newProducts}
          horizontal
          renderItem={({ item }) => (
            <ProductCard product={item} navigation={navigation} />
          )}
          onSeeAll={() => {}}
          titleColor="#6C63FF"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bgGray: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  cardContainer: {
    flex: 1,
    backgroundColor: "#fff",
    margin: 0,
    borderRadius: 0,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 0,
    paddingTop: 12,
  },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  genderBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F6F6F6",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginHorizontal: 8,
  },
  gender: { fontSize: 16, fontWeight: "500", color: "#222" },
  cartBtn: {
    backgroundColor: "#2979FF",
    borderRadius: 18,
    padding: 8,
  },
  searchContainerImproved: {
    flexDirection: "row",
    backgroundColor: "#F6F6F6",
    padding: 10,
    borderRadius: 18,
    marginVertical: 12,
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: "#222",
  },
  section: { marginBottom: 18 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    alignItems: "center",
  },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#222" },
  link: { color: "#2979FF", fontSize: 14 },
  categoryItem: {
    alignItems: "center",
    marginRight: 18,
    padding: 4,
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  categoryIconWrap: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    marginBottom: 4,
  },
  categoryImage: { width: 40, height: 40, borderRadius: 20 },
  categoryName: { fontSize: 13, color: "#222" },
});
