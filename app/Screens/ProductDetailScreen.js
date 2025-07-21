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
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

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

  const [isFavorite, setIsFavorite] = useState(false);
  const [size, setSize] = useState(product?.sizes?.[0] || 'S');
  const [color, setColor] = useState(product?.colors?.[0] || 'black');
  const [quantity, setQuantity] = useState(1);
  const [loadingAddCart, setLoadingAddCart] = useState(false);
  const [fullProduct, setFullProduct] = useState(product);

    useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const res = await api.get(`/products/${product._id}`);
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

  const handleAddToCart = async () => {
    if (!userInfo?._id) {
      Alert.alert('Lỗi', 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      return;
    }

    setLoadingAddCart(true);

    try {
      const cartRes = await api.get(`/cart/user/${userInfo._id}`);
      let cart = cartRes.data;

      if (!cart?._id) {
        const createCartRes = await api.post('/cart', { user_id: userInfo._id });
        cart = createCartRes.data;
        console.log('🛒 Giỏ hàng mới đã được tạo:', cart);
      }

      const addItemRes = await api.post('/cart-items', {cart_id: cart._id,
        product_id: product._id,
        quantity,
        size,
        color,
      });

      Alert.alert('Thành công', 'Sản phẩm đã được thêm vào giỏ hàng');
      console.log('🛒 Thêm sản phẩm vào giỏ hàng:', addItemRes.data);
    } catch (error) {
      console.error('Lỗi thêm sản phẩm vào giỏ hàng:', error.response?.data || error.message);
      Alert.alert('Lỗi', 'Không thể thêm sản phẩm vào giỏ hàng');
    } finally {
      setLoadingAddCart(false);
    }
  };

  if (!product) return <Text>Không có dữ liệu sản phẩm</Text>;

  // Lấy mảng url ảnh, ưu tiên lấy từ images nếu có, fallback dùng image_url
  const imageUrls =
<<<<<<< HEAD
    fullProduct.images && fullProduct.images.length > 0
      ? fullProduct.images.map(img => img.url)
      : [fullProduct.image_url];
console.log("🧪 product:", product);
console.log("🧪 images:", product.images);
=======
    product.images && product.images.length > 0
      ? product.images.map((img) => img.url)
      : product.image_url
      ? [product.image_url]
      : [];
  console.log("🔍 images:", product.images);
  console.log("🔍 image_url:", product.image_url);
>>>>>>> 18f2aa4ffc3a08e555f549b2b3e79d8202cbf14a
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

        {/* Size */}
        {product.sizes?.length > 0 && (
          <>
            <Text style={styles.label}>Kích cỡ</Text>
            <ScrollView horizontal style={{ marginVertical: 8 }} showsHorizontalScrollIndicator={false}>
              {product.sizes.map((item) => (
                <TouchableOpacity
                  key={item}
                  onPress={() => setSize(item)}style={[styles.variantBtn, size === item && styles.variantBtnActive]}
                >
                  <Text style={size === item && { color: '#3b82f6', fontWeight: 'bold' }}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* Color */}
        {product.colors?.length > 0 && (
          <>
            <Text style={styles.label}>Màu sắc</Text>
            <View style={{ flexDirection: 'row', marginVertical: 8 }}>
              {product.colors.map((item) => (
                <TouchableOpacity
                  key={item}
                  onPress={() => setColor(item)}
                  style={[
                    styles.colorDot,
                    {
                      backgroundColor: item,
                      borderWidth: color === item ? 2 : 0,
                      borderColor: '#3b82f6',
                    },
                  ]}
                />
              ))}
            </View>
          </>
        )}

        {typeof product.stock === 'number' && (
          <Text style={styles.stock}>Còn lại: {product.stock} sản phẩm</Text>
        )}

        {/* Quantity */}
        <Text style={styles.label}>Số lượng</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            onPress={() => quantity > 1 && setQuantity(quantity - 1)}
            style={styles.quantityBtn}
          >
            <Ionicons name="remove" size={16} />
          </TouchableOpacity>
          <Text style={{ marginHorizontal: 12 }}>{quantity}</Text>
          <TouchableOpacity
            onPress={() => quantity < (product.stock || 99) && setQuantity(quantity + 1)}
            style={styles.quantityBtn}
          >
            <Ionicons name="add" size={16} />
          </TouchableOpacity>
        </View>

        {/* Description */}
        <Text style={styles.label}>Mô tả sản phẩm</Text>
        {product.description && <Text style={styles.description}>{product.description}</Text>}

        {/* Rating */}
        <Text style={styles.label}>Đánh giá</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          {renderStars(product.rating || 5)}
          <Text style={{ marginLeft: 8, color: '#888' }}>
            {product.rating || 5} điểm ({product.rating_count || 0} đánh giá)
          </Text>
        </View>

        {/* Reviews */}
        {product.reviews?.length > 0 ? (
          product.reviews.map((review, idx) => (
            <View key={idx} style={{ marginBottom: 10 }}>
              <Text style={{ fontWeight: 'bold' }}>{review.name}</Text>
              {renderStars(review.rating)}
              <Text style={{ color: '#4b5563' }}>{review.comment}</Text>
            </View>
          ))
        ) : (
          <Text style={{ color: '#aaa', fontStyle: 'italic' }}>Chưa có đánh giá nào</Text>
        )}
      </ScrollView>{/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerPrice}>{product.price?.toLocaleString('vi-VN')} VND</Text>
        <TouchableOpacity
          style={[styles.addToCartBtn, loadingAddCart && { opacity: 0.6 }]}
          onPress={handleAddToCart}
          disabled={loadingAddCart}
        >
          <Text style={styles.cartBtnText}>
            {loadingAddCart ? 'Đang thêm...' : 'Thêm vào Giỏ hàng'}
          </Text>
        </TouchableOpacity>
      </View>
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
    marginTop: 16,
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
    color: '#16a34a',
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  quantityBtn: {
    backgroundColor: '#e5e7eb',
    padding: 8,
    borderRadius: 8,
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
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  cartBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
