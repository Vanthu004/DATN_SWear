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
import RelatedProducts from '../components/RelatedProducts';
import { useAuth } from '../context/AuthContext';
import { useReview } from "../hooks/useReview";

import { api, getRelatedProducts } from '../utils/api';
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
  const [loadingAddCart, setLoadingAddCart] = useState(false);
  const [fullProduct, setFullProduct] = useState(product);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Related products state
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  const { reviews, avgRating } = useReview(product?._id);

  useEffect(() => {
    const fetchProductDetail = async () => {
      setLoading(true);
      try {
        setLoading(true);
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

  // Fetch related products
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!product?._id) return;
      
      setRelatedLoading(true);
      try {
        const response = await getRelatedProducts(product._id, 6);
        if (response.success) {
          setRelatedProducts(response.relatedProducts || []);
        }
      } catch (error) {
        console.error('Error fetching related products:', error);
      } finally {
        setRelatedLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [product?._id]);

  // Load first variant
  useEffect(() => {
    if (fullProduct?._id && !selectedVariant) {
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
    if (!userInfo?._id) {
      Alert.alert('Vui lòng đăng nhập để thêm vào giỏ hàng');
      return;
    }

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
      if (variant && variant._id) {
        payload.product_variant_id = variant._id;
        payload.size = variant.size;
        payload.color = variant.color;
      }
      await api.post('/cart-items', payload);

      Alert.alert('Thành công', 'Sản phẩm đã được thêm vào giỏ hàng');
    } catch (error) {
      console.error('Lỗi thêm sản phẩm vào giỏ hàng:', error.response?.data || error.message);
      Alert.alert('Lỗi', 'Không thể thêm sản phẩm vào giỏ hàng');
    } finally {
      setLoadingAddCart(false);
    }
  };

  const handleBuyNow = ({ product, variant, quantity }) => {

//     if (!userInfo?._id) {
//       Alert.alert('Vui lòng đăng nhập để mua sản phẩm');
//       return;
//     }
//     navigation.navigate('Checkout', {
//       items: [{
//         product,
//         product_id: product?._id,
//         variant,
//         quantity,
//         price_at_time: variant?.price || product?.price || 0,

    navigation.navigate('Checkout', {
      items: [{
        product,
        variant,
        quantity,
        price: (variant?.price || product?.price || 0),
      }],
      isDirectPurchase: true,
    });
  };

  const handleShowVariantModal = (type) => {
    if (!fullProduct.variants || fullProduct.variants.length === 0) {
      if (type === 'buy') {
        handleBuyNow({ product: fullProduct, variant: null, quantity: 1 });
      } else {
        handleAddToCart({ product: fullProduct, variant: null, quantity: 1 });
      }
    } else {
      setVariantActionType(type);
      setShowVariantModal(true);
    }
  };

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Không có dữ liệu sản phẩm</Text>
      </SafeAreaView>
    );
  }

  const imageUrls =
    fullProduct.images && fullProduct.images.length > 0
      ? fullProduct.images.map(img => img?.url || '')
      : [fullProduct.image_url || 'https://via.placeholder.com/300'];

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
        {/* Ảnh sản phẩm */}

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

        {/* Tên, giá */}
        <Text style={styles.title}>{fullProduct.name}</Text>
        <Text style={styles.price}>
          {fullProduct.price?.toLocaleString('vi-VN')} VND
        </Text>
          {/* Số lượng tồn kho
        <Text style={styles.stock}>
        Còn: {fullProduct.stock_quantity ?? 0} sản phẩm
        </Text>
        {fullProduct.category && (
          <Text style={styles.category}>Danh mục: {fullProduct.category.name || fullProduct.category}</Text>
        )} */}
        {/* Số lượng tồn kho */}
        <Text style={styles.stock}>
        Còn: {fullProduct.stock_quantity ?? 0} sản phẩm
        </Text>

        {/* Mô tả */}
        <Text style={styles.label}>Mô tả sản phẩm</Text>
        {product.description && <Text style={styles.description}>{product.description}</Text>}

    {/* Đánh giá */}
        <View style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
          {/* Hàng tiêu đề */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={[styles.label, { fontSize: 16, fontWeight: 'bold' }]}>Đánh giá</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllReviews', { productId: product._id })}>
              <Text style={{ color: '#3b82f6', fontWeight: '600',marginTop:17 }}>Xem tất cả</Text>
            </TouchableOpacity> 
          </View>

          {/* Hàng rating */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            {renderStars(avgRating || 0)}
            <Text style={{ marginLeft: 8, color: '#555', fontSize: 14 }}>
              {avgRating
                ? `${avgRating} điểm (${reviews?.length || 0} đánh giá)`
                : 'Chưa có đánh giá'}
            </Text>
          </View>
        </View>


{/* Reviews */}
{reviews?.length > 0 ? (
  <>
    {reviews.slice(0, 2).map((review, idx) => (
      <View key={idx} style={{ marginBottom: 16 }}>
        {/* Review chính */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <Image
            source={{
              uri: review.user_id?.avata_url ||
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
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: 'bold' }}>{review.user_id?.name || 'Người dùng'}</Text>
            <View style={{ flexDirection: 'row', marginVertical: 4 }}>
              {[...Array(review.rating)].map((_, i) => (
                <Text key={i} style={{ color: '#facc15' }}>★</Text>
              ))}
            </View>
            <Text>{review.comment || ''}</Text>
          </View>
        </View>

        {/* Replies */}
        {review.replies?.length > 0 && (
          <View style={{ marginLeft: 44, marginTop: 8 }}>
            {review.replies.map((reply, ridx) => (
              <View key={ridx} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 }}>
                <Image
                  source={{
                    uri: reply.user_id?.avata_url ||
                      'https://cdn-icons-png.flaticon.com/512/149/149071.png',
                  }}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: '#eee',
                    marginRight: 6,
                  }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 13 }}>
                    {reply.user_id?.name || 'Người dùng'}
                  </Text>
                  <Text style={{ fontSize: 13 }}>{reply.comment}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    ))}
  </>
) : (
  <Text style={{ color: '#888', marginTop: 8 }}>Chưa có đánh giá nào.</Text>
)}

        {/* Related Products */}
        <RelatedProducts
          products={relatedProducts}
          loading={relatedLoading}
          title="Sản phẩm liên quan"
          navigation={navigation}
          onViewAll={() => navigation.navigate('SearchSc', { keyword: 'related' })}
        />

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerPrice}>
          {(selectedVariant?.price ?? fullProduct?.price)?.toLocaleString('vi-VN')} VND
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
      <View style={{ height: 70 }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', marginTop: 60, paddingBottom: 80 },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 12, marginBottom: 4 },
  headerBtn: { padding: 8, borderRadius: 20, backgroundColor: '#f6f6f6' },
  image: { height: 250, borderRadius: 12, marginRight: 12, backgroundColor: '#f6f6f6' },
  title: { fontSize: 20, fontWeight: 'bold', marginTop: 8 },
  price: { color: '#3b82f6', fontWeight: 'bold', marginVertical: 8, fontSize: 18 },
  category: { color: '#888', fontSize: 14, marginBottom: 8 },
  label: { marginTop: 16, fontWeight: '500', fontSize: 15 },
  description: { marginTop: 16, color: '#6b7280', lineHeight: 20, fontSize: 15 },
  footer: { 
    padding: 16, 
    borderTopWidth: 1, 
    borderColor: '#e5e7eb', 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  footerPrice: { fontSize: 18, fontWeight: 'bold', color: '#3b82f6' },
  addToCartBtn: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 10 },
  cartBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  stock: {
  fontSize: 14,
  color: '#555',
  marginTop: 4,
},
});

