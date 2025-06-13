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

  // Tính phần trăm giảm giá
  let discount = null;
  if (product.oldPrice) {
    const oldP = parseInt(product.oldPrice.replace(/\D/g, ""));
    const newP = parseInt(product.price.replace(/\D/g, ""));
    if (oldP && newP) {
      discount = `-${Math.round(100 - (newP / oldP) * 100)}%`;
    }
  }

  return (
    <Animated.View
      style={[styles.productCard, { transform: [{ scale: scaleAnim }] }]}
    >
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
        <View style={styles.imageWrap}>
          <Image source={{ uri: product.image }} style={styles.productImage} />
          {discount && (
            <View style={styles.badgeDiscount}>
              <Text style={styles.badgeText}>{discount}</Text>
            </View>
          )}
          {showFavoriteIcon && (
            <TouchableOpacity
              style={styles.heartIcon}
              onPress={onToggleFavorite}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={16}
                color={isFavorite ? "#e74c3c" : "#bbb"}
              />
            </TouchableOpacity>
          )}
        </View>
        <Text numberOfLines={2} style={styles.productName}>
          {product.name}
        </Text>
        <Text style={styles.productPrice}>{product.price}</Text>
        {product.oldPrice && (
          <Text style={styles.oldPrice}>{product.oldPrice}</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  productCard: {
    width: 150,
    minHeight: 210,
    marginRight: 16,
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  imageWrap: {
    width: "100%",
    height: 120,
    borderRadius: 16,
    backgroundColor: "#f8f8f8",
    marginBottom: 8,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  productImage: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    resizeMode: "cover",
  },
  productName: {
    fontSize: 14,
    marginVertical: 2,
    color: "#222",
    fontWeight: "500",
  },
  productPrice: { fontWeight: "bold", fontSize: 14, color: "#222" },
  oldPrice: {
    fontSize: 12,
    textDecorationLine: "line-through",
    color: "#bbb",
  },
  heartIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 2,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  badgeDiscount: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#FF4D4F",
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    zIndex: 2,
    minWidth: 32,
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
});
