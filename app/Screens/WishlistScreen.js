import React, { useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import ProductCard from "../components/ProductCard";

// Dữ liệu mẫu wishlist
const wishlistData = [
  {
    id: "1",
    name: "Áo thun Nam US Cotton",
    price: "560.000 VND",
    image:
      "https://bizweb.dktcdn.net/100/078/144/products/z4369805516867-9f4d1397d0c8c4caa8f586e06b5562f2.jpg?v=1684834275823",
  },
  {
    id: "2",
    name: "Áo thun thể thao Nam",
    price: "480.000 VND",
    image:
      "https://product.hstatic.net/200000078815/product/jd1779-02_a091e9f755824d16a2859a5080c2459f_master.jpg",
  },
  {
    id: "3",
    name: "Áo thun Nam Delta",
    price: "327.000 VND",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrjLryFzbqBHIBVTUPWCI6OdsCWqvsnOxR7gyhFPGMpC0_sxxKK_EdvQovIOku3VuqmxE&usqp=CAU",
  },
  {
    id: "4",
    name: "Áo thun thể thao Nam",
    price: "599.000 VND",
    image:
      "https://assets.adidas.com/images/w_940,f_auto,q_auto/a8dac888a08249f0a0225d4e53f1687f_9366/IZ2366_21_model.jpg",
  },
];

export default function WishlistScreen({ navigation }) {
  const [wishlist, setWishlist] = useState(wishlistData);

  // Xử lý xóa khỏi wishlist (demo)
  const handleToggleFavorite = (productId) => {
    setWishlist((prev) => prev.filter((item) => item.id !== productId));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sản phẩm Yêu thích ({wishlist.length})</Text>
      <FlatList
        data={wishlist}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            navigation={navigation}
            isFavorite={true}
            onToggleFavorite={() => handleToggleFavorite(item.id)}
            showFavoriteIcon={true}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Chưa có sản phẩm yêu thích.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 32,
    alignItems:'center'

  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    alignSelf: "center",
  },
  list: {
    paddingBottom: 24,
  },
  empty: {
    textAlign: "center",
    color: "#aaa",
    marginTop: 40,
    fontSize: 16,
  },
});
