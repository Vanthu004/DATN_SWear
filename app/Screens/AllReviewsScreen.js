// screens/AllReviewsScreen.js
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { getAllReviews } from '../utils/api';
import { renderStars } from '../utils/renderStars';

export default function AllReviewsScreen() {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [avgRating, setAvgRating] = useState(0);
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await getAllReviews();
        setReviews(data);

        const avg =
          data.length > 0
            ? (data.reduce((sum, r) => sum + (r.rating || 0), 0) / data.length).toFixed(1)
            : 0;
        setAvgRating(avg);
      } catch (error) {
        console.error('❌ Lỗi khi lấy tất cả đánh giá:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  useEffect(() => {
    let updated = [...reviews];

    // Lọc theo tên sản phẩm
    if (searchKeyword.trim() !== '') {
      updated = updated.filter((review) =>
        review.product_id?.name?.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }

    // Sắp xếp theo thời gian
    updated.sort((a, b) => {
      const timeA = new Date(a.create_date).getTime();
      const timeB = new Date(b.create_date).getTime();
      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    });

    setFilteredReviews(updated);
  }, [searchKeyword, sortOrder, reviews]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Tất cả đánh giá ({filteredReviews.length})</Text>
      <Text style={styles.avgRating}>Trung bình: {avgRating} sao</Text>

      {/* 🔍 Tìm kiếm theo tên sản phẩm */}
      <TextInput
        placeholder="Tìm theo tên sản phẩm..."
        style={styles.input}
        value={searchKeyword}
        onChangeText={setSearchKeyword}
      />

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
      {filteredReviews.map((review, idx) => (
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

            {/* Thông tin sản phẩm */}
            <View style={styles.productInfo}>
              <Image
                source={{
                  uri:
                    review.product_id?.image_url ||
                    'https://cdn-icons-png.flaticon.com/512/102/102661.png',
                }}
                style={styles.productImage}
              />
              <Text style={styles.productName}>
                {review.product_id?.name || 'Tên sản phẩm không có'}
              </Text>
            </View>

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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
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
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  productImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
  },
  productName: {
    fontStyle: 'italic',
    color: '#444',
    flexShrink: 1,
  },
  date: {
    marginTop: 4,
    color: '#888',
    fontSize: 12,
  },
});
