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
import { useCart } from '../hooks/useCart';
import api from '../utils/api';

export default function ProductCard({
  product,
  navigation,
  isFavorite,
  onToggleFavorite,
  showFavoriteIcon = true,
  fixedHeight = false,
  onPress,
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const { addToCart, isInCart } = useCart();

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

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    await addToCart(product, 1);
  };

  const handleProductPress = async () => {
    try {
      console.log('ProductCard - Original product data:', product);
      console.log('ProductCard - Has description:', !!product.description);
      console.log('ProductCard - Has rating:', !!product.rating);
      console.log('ProductCard - Has stock:', product.stock !== undefined);
      console.log('ProductCard - Has reviews:', !!product.reviews);
      
      // Fetch chi tiết sản phẩm nếu chưa có đầy đủ thông tin
      if (!product.description || !product.rating || product.stock === undefined) {
        console.log('ProductCard - Fetching detailed product data...');
        const response = await api.get(`/products/${product._id}`);
        const detailedProduct = response.data;
        console.log('ProductCard - Detailed product data:', detailedProduct);
        console.log('ProductCard - Detailed description:', detailedProduct.description);
        console.log('ProductCard - Detailed rating:', detailedProduct.rating);
        console.log('ProductCard - Detailed stock:', detailedProduct.stock);
        console.log('ProductCard - Detailed reviews:', detailedProduct.reviews);
        navigation.navigate("ProductDetail", { product: detailedProduct });
      } else {
        console.log('ProductCard - Using existing product data');
        navigation.navigate("ProductDetail", { product });
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      // Fallback to original product data
      navigation.navigate("ProductDetail", { product });
    }
  };

  // Lấy ảnh sản phẩm với fallback tốt hơn
  const getImageSource = () => {
    if (product.image_url) {
      return { uri: product.image_url };
    }
    if (product.image) {
      return { uri: product.image };
    }
    if (product.images && product.images.length > 0) {
      return { uri: product.images[0] };
    }
    return require("../../assets/images/box-icon.png");
  };

  const imageSource = getImageSource();

  // Giá và tên
  const price = product.price || "";
  const name = product.name || "";

  // Rating demo nếu chưa có dữ liệu
  const rating = product.rating || 5.0;
  const ratingCount = product.ratingCount || 1000;

  return (
    <Animated.View style={[styles.card, fixedHeight && styles.fixedCard, { transform: [{ scale: scaleAnim }] }]}>  
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress ? () => onPress(product) : handleProductPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{ flex: 1 }}
      >
        {/* Ảnh sản phẩm */}
        <View style={styles.imageWrap}>
          <Image source={imageSource} style={styles.productImage} />
          {showFavoriteIcon && (
            <TouchableOpacity
              style={styles.heartIcon}
              onPress={(e) => {
                e.stopPropagation && e.stopPropagation();
                onToggleFavorite && onToggleFavorite(product);
              }}
            >
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={15}
                color={isFavorite ? "#1e90ff" : "#bbb"}
              />
            </TouchableOpacity>
          )}
        </View>
        {/* Giá */}
        <Text style={styles.productPrice}>{price?.toLocaleString('vi-VN') || ''} ₫</Text>
        <Text style={styles.productPrice}></Text>
        {/* Tên sản phẩm */}
        <Text numberOfLines={2} ellipsizeMode="tail" style={styles.productName}>{name}</Text>
        {/* Rating và icon khoá */}
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color="#222" style={{ marginRight: 2 }} />
          <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
          <Text style={styles.ratingCount}>({ratingCount})</Text>
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            style={[styles.cartBtn, isInCart(product._id) && styles.cartBtnActive]}
            onPress={handleAddToCart}
          >
            {/* <Ionicons 
              name={isInCart(product._id) ? "checkmark" : "add"} 
              size={16} 
              color={isInCart(product._id) ? "#fff" : "#222"} 
            /> */}
            <Image source={require("../../assets/images/moreCart.png")} style={{ width: 20, height: 20 }} />
          </TouchableOpacity>
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
    padding: 0,
    marginTop: 10,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  imageWrap: {
    width: "100%",
    height: 170,
    backgroundColor: "#f8f8f8",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  productPrice: {
    fontWeight: "500",
    fontSize: 18,
    color: "#222",
    marginTop: 5,
    marginLeft: 10,
  },
  productName: {
    fontSize: 15,
    color: "#222",
    marginHorizontal: 10,
    marginTop: 0,
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
  cartBtn: {
    backgroundColor: "#F6F6F6",
    borderRadius: 20,
    padding: 8,
  },
  // cartBtnActive: {
  //   backgroundColor: "#007BFF",
  // },
  heartIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 999,
    padding: 4,
    zIndex: 2,
  },
});
