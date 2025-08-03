// screens/AllReviewsScreen.js
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import api from '../utils/api';
import { renderStars } from '../utils/renderStars';

export default function AllReviewsScreen({ route }) {
  const { productId } = route.params;
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get(`/reviews/product/${productId}`);
        const data = res.data || [];

        setReviews(data);

        const avg =
          data.length > 0
            ? (data.reduce((sum, r) => sum + (r.rating || 0), 0) / data.length).toFixed(1)
            : 0;
        setAvgRating(avg);
      } catch (error) {
        console.error('❌ Lỗi khi lấy đánh giá theo sản phẩm:', error.message);
      } finally {
        setLoading(false);
      }
    };

    if (productId) fetchReviews();
  }, [productId]);

  // Sắp xếp theo thời gian
  const sortedReviews = [...reviews].sort((a, b) => {
    const timeA = new Date(a.create_date).getTime();
    const timeB = new Date(b.create_date).getTime();
    return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
  });

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Đánh giá sản phẩm ({sortedReviews.length})</Text>
      <Text style={styles.avgRating}>Trung bình: {avgRating} sao</Text>

      {/* 🔁 Nút sắp xếp thời gian */}
      <TouchableOpacity
        style={styles.sortButton}
        onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
      >
        <Text style={styles.sortText}>
          Sắp xếp: {sortOrder === 'asc' ? 'Cũ nhất' : 'Mới nhất'}
        </Text>
      </TouchableOpacity>

      {/* Danh sách đánh giá */}
      {sortedReviews.map((review, idx) => (
        <View key={review._id || idx} style={styles.reviewItem}>
          {/* Avatar người dùng */}
          <Image
            source={{
              uri:
                review.user_id?.avata_url ||
                'https://cdn-icons-png.flaticon.com/512/149/149071.png',
            }}
            style={styles.avatar}
          />

          <View style={styles.content}>
            <Text style={styles.name}>{review.user_id?.name || 'Người dùng'}</Text>
            {renderStars(review.rating)}
            <Text style={styles.comment}>{review.comment}</Text>

            {/* Ngày tạo */}
            <Text style={styles.date}>
              {new Date(review.create_date).toLocaleDateString('vi-VN')}
            </Text>
          </View>
        </View>
      ))}
                  <View style={{height: 50}}></View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff', flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  avgRating: { color: '#666', marginBottom: 8 },
  sortButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 16,
  },
  sortText: {
    color: 'white',
    fontWeight: 'bold',
  },
  reviewItem: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#eee' },
  content: { flex: 1 },
  name: { fontWeight: 'bold' },
  comment: { color: '#555', marginTop: 4 },
  date: {
    marginTop: 4,
    color: '#888',
    fontSize: 12,
  },
});
