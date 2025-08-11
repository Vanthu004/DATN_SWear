import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ProductVariantModal from '../components/ProductVariantModal';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';


import { useReview } from "../hooks/useReview";

const calculateAvg = (reviews) => {
  if (!reviews || reviews.length === 0) return 0;
  const total = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
  return (total / reviews.length).toFixed(1);
};


const renderStars = (rating) => (
  <View style={{ flexDirection: 'row' }}>
    {Array.from({ length: 5 }).map((_, idx) => (
      <Ionicons
        key={idx}
        name={idx < rating ? 'star' : 'star-outline'}
        size={16}
        color="#facc15"
      />
    ))}
  </View>
);

export default function ProductDetailScreen({ route, navigation }) {
  const { product } = route.params || {};
  const { userInfo } = useAuth();
  const [variantActionType, setVariantActionType] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [loadingAddCart, setLoadingAddCart] = useState(false);
  const [fullProduct, setFullProduct] = useState(product);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const { reviews, avgRating, addReview } = useReview(product?._id);
  const [selectedColor, setSelectedColor] = useState(null);

    useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const res = await api.get(`/products/${product._id}/frontend`);
        setFullProduct(res.data);
      } catch (error) {
        console.error('❌ Lỗi lấy sản phẩm:', error.message);
      } finally {
        setLoading(false);
      }
    };

    if (product?._id) {
      fetchProductDetail();
    }
  }, [product]);

  // Load first variant when product loads
  useEffect(() => {
    if (fullProduct?._id && !selectedVariant) {
      // Try to get variants from product or fetch them
      if (fullProduct.variants && fullProduct.variants.length > 0) {
        setSelectedVariant(fullProduct.variants[0]);
      }
    }
  }, [fullProduct, selectedVariant]);

  useEffect(() => {
    const checkIsFavorite = async () => {
      if (!userInfo?._id || !product?._id) return;
      try {
        const res = await api.get(`/favorites/${userInfo._id}`);
        const favoriteList = res.data || [];
        const isFav = favoriteList.some(
          (item) =>
            item.product_id === product._id || item.product_id?._id === product._id
        );
        setIsFavorite(isFav);
      } catch (err) {
        console.error('❌ Lỗi kiểm tra yêu thích:', err.message);
      }
    };
    checkIsFavorite();
  }, [userInfo, product]);

  const handleToggleFavorite = async () => {
    if (!userInfo?._id) {
      Alert.alert('Lỗi', 'Vui lòng đăng nhập để thêm vào yêu thích');
      return;
    }

    try {
      if (isFavorite) {
        await api.delete(`/favorites/${userInfo._id}/${product._id}`);
        setIsFavorite(false);
        Alert.alert('Đã xoá khỏi yêu thích');
      } else {
        await api.post('/favorites', {
          user_id: userInfo._id,
          product_id: product._id,
        });
        setIsFavorite(true);
        Alert.alert('Đã thêm vào yêu thích');
      }
    } catch (error) {
      console.log('❌ Lỗi khi thêm/xoá yêu thích:', error.message);
      Alert.alert('Lỗi', 'Không thể thực hiện thao tác');
    }
  };

const handleAddToCart = async ({ product, variant, quantity }) => {
  setLoadingAddCart(true);

  try {
    const cartRes = await api.get(`/cart/user/${userInfo._id}`);
    let cart = cartRes.data.data || cartRes.data;

    if (!cart?._id) {
      const createCartRes = await api.post('/cart', { user_id: userInfo._id });
      cart = createCartRes.data.data || createCartRes.data;
    }

    const payload = {
      cart_id: cart._id,
      product_id: product._id,
      quantity,
    };

    // Nếu có variant thì thêm các thông tin biến thể
    if (variant && variant._id) {
      payload.product_variant_id = variant._id;
      payload.size = variant.size;
      payload.color = variant.color;
    }

    const addItemRes = await api.post('/cart-items', payload);

    Alert.alert('Thành công', 'Sản phẩm đã được thêm vào giỏ hàng');
  } catch (error) {
    console.error('Lỗi thêm sản phẩm vào giỏ hàng:', error.response?.data || error.message);
    Alert.alert('Lỗi', 'Không thể thêm sản phẩm vào giỏ hàng');
    throw error;
  } finally {
    setLoadingAddCart(false);
  }
};


const handleBuyNow = ({ product, variant, quantity }) => {
  navigation.navigate('Checkout', {
    items: [{
      product,
      product_id: product?._id,
      variant,
      quantity,
      price_at_time: variant?.price || product?.price || 0,
    }],
    isDirectPurchase: true,
  });
};


const handleShowVariantModal = (type) => {
  if (!fullProduct.variants || fullProduct.variants.length === 0) {
    // Không có biến thể → thêm trực tiếp
    if (type === 'buy') {
      handleBuyNow({
        product: fullProduct,
        variant: null,
        quantity: 1,
      });
    } else {
      handleAddToCart({
        product: fullProduct,
        variant: null,
        quantity: 1,
      });
    }
  } else {
    setVariantActionType(type); // 'buy' or 'cart'
    setShowVariantModal(true); // mở modal
  }
};

  if (!product) {
  return (
    <SafeAreaView style={styles.container}>
      <Text>Không có dữ liệu sản phẩm</Text>
    </SafeAreaView>
  );
}
  // Lấy mảng url ảnh, ưu tiên lấy từ images nếu có, fallback dùng image_url
const imageUrls =
  fullProduct.images && fullProduct.images.length > 0
    ? fullProduct.images.map(img => img?.url || '')
    : [fullProduct.image_url || ''];

  console.log("🔍 images:", product.images);
  console.log("🔍 image_url:", product.image_url);
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={handleToggleFavorite} style={styles.headerBtn}>
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite ? 'red' : '#222'}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={styles.headerBtn}>
          <Ionicons name="cart-outline" size={26} color="#222" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
          {imageUrls.map((uri, idx) => (
            <Image
              key={idx}
              source={{ uri }}
              style={[styles.image, { width: Dimensions.get('window').width - 32, height: 220 }]}
              resizeMode="cover"
            />
          ))}
        </ScrollView>

        {/* Tên, giá, danh mục */}
        <Text style={styles.title}>{product.name}</Text>
        <Text style={styles.price}>{product.price?.toLocaleString('vi-VN')} VND</Text>
        {product.category && (
          <Text style={styles.category}>Danh mục: {product.category.name || product.category}</Text>
        )}
        {/* Quantity - Removed as it's now in Modal */}

        {/* Description */}
        <Text style={styles.label}>Mô tả sản phẩm</Text>
        {product.description && <Text style={styles.description}>{product.description}</Text>}

        {/* Rating */}
        <View style={{flexDirection:'row',justifyContent:'space-between', alignItems:'center', marginTop:16, marginBottom:8}}>
        <Text style={styles.label}>Đánh giá</Text>
          {/* 👉 Nút Xem tất cả đánh giá */}
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('AllReviews', {
                productId: product._id, // Truyền productId sang AllReviews screen
              });
            }}
          >
            <Text
              style={{
                color: '#3b82f6',
                fontWeight: 'bold',
              }}
            >
              Xem tất cả
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          {renderStars(product.rating || 5)}
        <Text style={{ marginLeft: 8, color: '#888' }}>
          {`${avgRating || 0} điểm (${reviews?.length || 0} đánh giá)`}
        </Text>
        </View>

{/* Reviews */}
{reviews?.length > 0 ? (
  <>
    {/* Hiển thị 2 đánh giá mới nhất */}
    {reviews.slice(0, 2).map((review, idx) => (
      <View
        key={idx}
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          marginBottom: 16,
        }}
      >
        {/* Avatar */}
        <Image
          source={{
            uri:
              review.user_id?.avata_url ||
              'https://cdn-icons-png.flaticon.com/512/149/149071.png',
          }}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: '#eee',
            marginRight: 8,
          }}
        />
        {/* Nội dung */}
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: 'bold' }}>
            {review.user_id?.name || 'Người dùng'}
          </Text>
          {/* Số sao */}
          <View style={{ flexDirection: 'row', marginVertical: 4 }}>
            {[...Array(review.rating)].map((_, i) => (
              <Text key={i} style={{ color: '#facc15' }}>
                ★
              </Text>
            ))}
          </View>
          <Text>{review.comment}</Text>
        </View>
      </View>
    ))}
  </>
) : (
  <Text style={{ color: '#888', marginTop: 8 }}>Chưa có đánh giá nào.</Text>
)}

      </ScrollView>                {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerPrice}>
            {selectedVariant?.price?.toLocaleString('vi-VN') || product.price?.toLocaleString('vi-VN')} VND
          </Text>
           <TouchableOpacity
              style={[styles.addToCartBtn, { backgroundColor: '#0ce001ff' }]}
              onPress={() => handleShowVariantModal('buy')}
            >
              <Text style={styles.cartBtnText}>Mua ngay</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.addToCartBtn, { backgroundColor: '#3b82f6' }]}
              onPress={() => handleShowVariantModal('cart')}
            >
              <Text style={styles.cartBtnText}>Thêm vào Giỏ hàng</Text>
            </TouchableOpacity>
        </View>
        
    

        {/* Product Variant Modal */}
        <ProductVariantModal
          visible={showVariantModal}
          onClose={() => setShowVariantModal(false)}
          product={fullProduct}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          userInfo={userInfo}
          actionType={variantActionType}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
        />

                  <View style={{height: 70}}></View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 60,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 12,
    marginBottom: 4,
  },
  headerBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f6f6f6',
  },
  image: {
    height: 250,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#f6f6f6',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  price: {
    color: '#3b82f6',
    fontWeight: 'bold',
    marginVertical: 8,
    fontSize: 18,
  },
  category: {
    color: '#888',
    fontSize: 14,
    marginBottom: 8,
  },
  label: {
    fontWeight: '500',
    fontSize: 15,
  },
  variantBtn: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#fff',
  },
  variantBtnActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#e0eaff',
  },
  colorDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 12,
  },
  stock: {
    color: '#656565ff',
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 4,
  },

  description: {
    marginTop: 16,
    color: '#6b7280',
    lineHeight: 20,
    fontSize: 15,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  footerPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  addToCartBtn: {
    backgroundColor: '#3b82f6',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  cartBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  variantInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  variantPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  stockInfo: {
    fontSize: 14,
    fontWeight: '500',
  },
  inStock: {
    color: '#16a34a',
  },
  outOfStock: {
    color: '#dc2626',
  },
});
