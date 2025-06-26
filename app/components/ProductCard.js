import { Ionicons } from "@expo/vector-icons";
import React, { useRef } from "react";
import {
    Animated,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function ProductCard({
  product,
  navigation,
  isFavorite,
  onToggleFavorite,
  showFavoriteIcon = true,
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
      bounciness: 8,
    }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 8,
    }).start();
  };

  // Lấy ảnh sản phẩm
  const imageSource = product.image_url
    ? { uri: product.image_url }
    : product.image
    ? { uri: product.image }
    : require("../../assets/images/box-icon.png");

  // Giá và tên
  const price = product.price || "";
  const name = product.name || "";

  // Rating demo nếu chưa có dữ liệu
  const rating = product.rating || 5.0;
  const ratingCount = product.ratingCount || 1000;

  return (
    <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>  
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() =>
          navigation &&
          navigation.navigate &&
          navigation.navigate("ProductDetail", { product })
        }
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{ flex: 1 }}
      >
        {/* Ảnh sản phẩm */}
        <View style={styles.imageWrap}>
          <Image source={imageSource} style={styles.productImage} />
        </View>
        {/* Giá */}
        <Text style={styles.productPrice}>{price}</Text>
        {/* Tên sản phẩm */}
        <Text numberOfLines={2} style={styles.productName}>{name}</Text>
        {/* Rating và icon khoá */}
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color="#222" style={{ marginRight: 2 }} />
          <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
          <Text style={styles.ratingCount}>({ratingCount})</Text>
          <View style={{ flex: 1 }} />
          <Ionicons name="lock-closed-outline" size={18} color="#888" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 170,
    minHeight: 300,
    marginRight: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 0,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#1e90ff",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  imageWrap: {
    width: "100%",
    height: 150,
    backgroundColor: "#f8f8f8",
    justifyContent: "center",
    alignItems: "center",
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  productPrice: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#222",
    marginTop: 8,
    marginLeft: 10,
  },
  productName: {
    fontSize: 15,
    color: "#222",
    marginHorizontal: 10,
    marginTop: 4,
    marginBottom: 6,
    fontWeight: "400",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 14,
    color: "#222",
    marginLeft: 2,
    fontWeight: "500",
  },
  ratingCount: {
    fontSize: 13,
    color: "#888",
    marginLeft: 4,
  },
});
