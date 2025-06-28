import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function ProductScreen() {
  const [size, setSize] = useState('S');
  const [color, setColor] = useState('black');
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);

  const productId = '60d5f8c8b1f9c70b3c4d8f8f'; // hoặc nhận từ route.params
  const sizes = ['S', 'M', 'L'];
  const colors = ['black', 'white'];

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`http://192.168.1.5:3000/api/reviews?productId=${productId}`);
        console.log('✅ Response:', res.data); // 👈 In ra để kiểm tra có name/avata_url không
        setReviews(res.data);
      } catch (err) {
        console.error('❌ Lỗi khi lấy đánh giá:', err.message);
      }
    };
    fetchReviews();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Ảnh sản phẩm */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Image source={{ uri: 'https://example.com/image1.jpg' }} style={styles.image} />
          <Image source={{ uri: 'https://example.com/image2.jpg' }} style={styles.image} />
        </ScrollView>

        {/* Tên sản phẩm */}
        <Text style={styles.title}>Áo bơi Rash Guard nữ</Text>
        <Text style={styles.price}>341.000 VND</Text>

        {/* Kích cỡ */}
        <Text style={styles.label}>Kích cỡ</Text>
        <View style={styles.dropdown}>
          <Text>{size}</Text>
          <Ionicons name="chevron-down" size={18} />
        </View>

        {/* Màu sắc */}
        <Text style={styles.label}>Màu sắc</Text>
        <View style={styles.dropdown}>
          <View style={[styles.colorDot, { backgroundColor: color }]} />
          <Ionicons name="chevron-down" size={18} />
        </View>

        {/* Số lượng */}
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
            onPress={() => setQuantity(quantity + 1)}
            style={styles.quantityBtn}
          >
            <Ionicons name="add" size={16} />
          </TouchableOpacity>
        </View>

        {/* Mô tả */}
        <Text style={styles.description}>
          Tính năng Anti – Chlorine giúp tăng độ bền vải, giữ màu lâu hơn, duy trì form dáng tốt và thân thiện với da.
        </Text>

        {/* Đánh giá sản phẩm */}
        <View style={{ marginTop: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Đánh giá</Text>
          <Text style={{ marginTop: 4, fontSize: 14, color: '#6b7280' }}>
            {reviews.length > 0
              ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
              : 'Chưa có đánh giá'} Điểm
          </Text>
          <Text style={{ fontSize: 12, color: '#9ca3af' }}>{reviews.length} Đánh giá</Text>

{reviews.map((review, index) => (
  <View key={index} style={styles.reviewItem}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Image
        source={{ uri: review.user_id?.avata_url || 'https://randomuser.me/api/portraits/lego/1.jpg' }}
        style={styles.avatar}
      />
      <View style={{ marginLeft: 12 }}>
        <Text style={{ fontWeight: '600' }}>{review.user_id?.name || 'Ẩn danh'}</Text>
        <View style={{ flexDirection: 'row', marginTop: 2 }}>
          {[...Array(5)].map((_, i) => (
            <Ionicons
              key={i}
              name={i < review.rating ? 'star' : 'star-outline'}
              size={14}
              color="#facc15"
            />
          ))}
        </View>
      </View>
    </View>
    <Text style={styles.reviewText}>{review.comment}</Text>
    <Text style={styles.reviewDate}>
      {new Date(review.create_date).toLocaleDateString('vi-VN')}
    </Text>
  </View>
))}

        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerPrice}>341.000 VND</Text>
        <TouchableOpacity style={styles.addToCartBtn}>
          <Text style={styles.cartBtnText}>Thêm vào Giỏ hàng</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  image: { width: 250, height: 250, borderRadius: 12, marginRight: 12 },
  title: { fontSize: 18, fontWeight: 'bold', marginTop: 16 },
  price: { color: '#3b82f6', fontWeight: 'bold', marginVertical: 8 },
  label: { marginTop: 16, fontWeight: '500' },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginTop: 8,
  },
  colorDot: { width: 20, height: 20, borderRadius: 10 },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  quantityBtn: { backgroundColor: '#e5e7eb', padding: 8, borderRadius: 8 },
  description: { marginTop: 16, color: '#6b7280', lineHeight: 20 },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerPrice: { fontSize: 16, fontWeight: 'bold', color: '#3b82f6' },
  addToCartBtn: {
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  cartBtnText: { color: '#fff', fontWeight: 'bold' },
  reviewItem: {
    marginTop: 16,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
  },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  reviewText: { marginTop: 8, fontSize: 14, color: '#374151', lineHeight: 20 },
  reviewDate: { marginTop: 4, fontSize: 12, color: '#9ca3af' },
});
