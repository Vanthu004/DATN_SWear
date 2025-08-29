import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useCart } from '../hooks/useCart';
import { api } from '../utils/api';
import ProductVariantInfo from './ProductVariantInfo';
import ProductVariantModal from './ProductVariantModal';

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
  const productId = product?._id || product?.id || product?.product_id;
  const { userInfo } = useAuth();

  // Thêm state cho modal biến thể - giống như ProductDetailScreen
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [variantActionType, setVariantActionType] = useState('cart');

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

  // Hàm xử lý hiển thị modal biến thể - GIỐNG HỆT ProductDetailScreen
  const handleShowVariantModal = (e) => {
    e.stopPropagation && e.stopPropagation();
    
    if (!productId) {
      Alert.alert('Lỗi', 'Sản phẩm không hợp lệ');
      return;
    }

    if (!userInfo?._id) {
      Alert.alert('Lỗi', 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      return;
    }

    // LUÔN hiển thị modal biến thể giống như ProductDetailScreen
    // console.log('��️ Hiển thị modal chọn biến thể cho sản phẩm:', product.name);
    setVariantActionType('cart');
    setShowVariantModal(true);
  };

  // Hàm thêm vào giỏ hàng - GIỐNG HỆT ProductDetailScreen
  const handleAddToCart = async ({ product, variant, quantity }) => {
    try {
      // console.log('��️ Thêm vào giỏ hàng:', { product: product.name, variant, quantity });
      
      // Lấy hoặc tạo giỏ hàng giống như ProductDetailScreen
      const cartRes = await api.get(`/cart/user/${userInfo._id}`);
      let cart = cartRes.data.data || cartRes.data;
      
      if (!cart?._id) {
        const createCartRes = await api.post('/cart', { user_id: userInfo._id });
        cart = createCartRes.data.data || createCartRes.data;
      }
      
      // Tạo payload giống hệt ProductDetailScreen
      const payload = {
        cart_id: cart._id,
        product_id: product._id,
        quantity,
      };
      
      // Nếu có biến thể thì thêm thông tin size, màu sắc
      if (variant && variant._id) {
        payload.product_variant_id = variant._id;
        const sizeName = variant.size || variant.attributes?.size?.name;
        const colorName = variant.color || variant.attributes?.color?.name;
        if (sizeName) payload.size = sizeName;
        if (colorName) payload.color = colorName;
      }
      
      // Gọi API thêm vào giỏ hàng
      await api.post('/cart-items', payload);
      Alert.alert('Thành công', 'Sản phẩm đã được thêm vào giỏ hàng');
      setShowVariantModal(false);
    } catch (error) {
      console.error('Lỗi thêm sản phẩm vào giỏ hàng:', error.response?.data || error.message);
      Alert.alert('Lỗi', 'Không thể thêm sản phẩm vào giỏ hàng');
    }
  };

  const imageSource = product.image_url
    ? { uri: product.image_url }
    : product.image
    ? { uri: product.image }
    : require("../../assets/images/box-icon.png");

      const price = product.price || "";
      const name = product.name || "";
      const rating = product.rating || 5.0;
      const stock = product.ratingCount || 0;
      
      // Debug: Log thông tin biến thể
      // console.log('🔍 Product variants:', product.variants);
      // console.log('🔍 Product ID:', productId);
      // console.log('🔍 Product name:', product.name);
      
  return (
    <>
      <Animated.View style={[styles.card, fixedHeight && styles.fixedCard, { transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={async () => {
            if (onPress) {
              onPress(product);
            } else if (navigation && navigation.navigate) {
              try {
                // Kiểm tra product._id có hợp lệ không
                if (!productId || typeof productId !== 'string') {
                  console.error('❌ Product ID không hợp lệ:', productId);
                  return;
                }
                
                const res = await api.get(`/products/${productId}`);
                // ⚠️ Gộp lại image_url từ sản phẩm gốc nếu API không trả về
                const fullProduct = { ...res.data, image_url: product.image_url, _id: productId };
                navigation.navigate("ProductDetail", { product: fullProduct });
              } catch (error) {
                console.error("❌ Lỗi khi lấy chi tiết sản phẩm:", error);
                // Fallback: navigate với dữ liệu hiện có
                navigation.navigate("ProductDetail", { product: { ...product, _id: productId } });
              }
            }
          }}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={{ flex: 1 }}
        >
          <View style={styles.imageWrap}>
            <Image source={imageSource} style={styles.productImage} />
            {showFavoriteIcon && (
              <TouchableOpacity
                style={styles.heartIcon}
                onPress={(e) => {
                  e.stopPropagation && e.stopPropagation();
                  console.log('🔍 Heart icon clicked for product:', product._id, 'isFavorite:', isFavorite);
                  if (onToggleFavorite) {
                    onToggleFavorite(product);
                  } else {
                    console.log('❌ onToggleFavorite is not provided');
                  }
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
          <Text style={styles.productPrice}>
            {product.variants && product.variants.length > 0 
              ? `${product.variants[0].price?.toLocaleString('vi-VN') || price?.toLocaleString('vi-VN') || ''} ₫`
              : `${price?.toLocaleString('vi-VN') || ''} ₫`
            }
          </Text>
          <Text style={styles.productName} numberOfLines={2} ellipsizeMode="tail">{name}</Text>
          <ProductVariantInfo product={product} />
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#222" style={{ marginRight: 2 }} />
            <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
            <Text style={styles.ratingCount}>({stock}) đánh giá</Text>
            <View style={{ flex: 1 }} />
            <TouchableOpacity
              style={[styles.cartBtn, isInCart(productId) && styles.cartBtnActive]}
              onPress={handleShowVariantModal}
            >
              <Image source={require("../../assets/images/moreCart.png")} style={{ width: 20, height: 20 }} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Modal chọn biến thể giống hệt màn chi tiết */}
      <ProductVariantModal
        visible={showVariantModal}
        onClose={() => setShowVariantModal(false)}
        product={product}
        onAddToCart={handleAddToCart}
        onBuyNow={null} // Không cần mua ngay ở home
        userInfo={userInfo}
        actionType={variantActionType}
      />
    </>
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