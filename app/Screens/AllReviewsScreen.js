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

// ... các import không đổi

export default function AllReviewsScreen({ route }) {
  const { productId } = route.params;
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedTab, setSelectedTab] = useState('all');
  const [showStarFilter, setShowStarFilter] = useState(false); // 👈 Hiện/ẩn tab sao

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

  const sortedReviews = [...reviews].sort((a, b) => {
    const timeA = new Date(a.create_date).getTime();
    const timeB = new Date(b.create_date).getTime();
    return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
  });

  const filteredReviews = sortedReviews.filter((r) =>
    selectedTab === 'all' ? true : r.rating === selectedTab
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Đánh giá sản phẩm ({filteredReviews.length})</Text>
      <Text style={styles.avgRating}>Trung bình: {avgRating} sao</Text>

      <View style={styles.buttonRow}>
        {/* 🔁 Nút sắp xếp thời gian */}
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        >
          <Text style={styles.sortText}>
            {sortOrder === 'asc' ? 'Cũ nhất' : 'Mới nhất'}
          </Text>
        </TouchableOpacity>

        {/* ⭐ Nút lọc theo sao */}
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowStarFilter(!showStarFilter)}
        >
          <Text style={styles.filterText}>Lọc theo sao</Text>
        </TouchableOpacity>
      </View>

      {/* ⭐ Hiển thị tab nếu bật lọc */}
      {showStarFilter && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer}>
          {['all', 5, 4, 3, 2, 1].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setSelectedTab(tab)}
              style={[
                styles.tabItem,
                selectedTab === tab && styles.tabItemActive,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === tab && styles.tabTextActive,
                ]}
              >
                {tab === 'all' ? 'Tất cả' : `${tab} ⭐`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Danh sách đánh giá */}
      {filteredReviews.map((review, idx) => (
        <View key={review._id || idx} style={styles.reviewItem}>
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
            <Text style={styles.date}>
              {new Date(review.create_date).toLocaleDateString('vi-VN')}
            </Text>
          </View>
        </View>
      ))}

      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff', flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  avgRating: { color: '#666', marginBottom: 12 },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sortButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sortText: { color: 'white', fontWeight: 'bold' },

  filterButton: {
    backgroundColor: '#6b7280',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  filterText: { color: 'white', fontWeight: 'bold' },

  // ⭐ Tabs
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tabItem: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    marginRight: 8,
  },
  tabItemActive: {
    backgroundColor: '#2563eb',
  },
  tabText: {
    color: '#000',
  },
  tabTextActive: {
    color: '#fff',
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
  date: { marginTop: 4, color: '#888', fontSize: 12 },
});
