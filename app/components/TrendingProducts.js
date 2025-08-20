import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import ProductCard from './ProductCard';

const TrendingProducts = ({ 
  products, 
  loading, 
  title = "Sản phẩm phổ biến",
  onViewAll,
  navigation,
  timeRange = 'all'
}) => {
  if (!products?.length && !loading) return null;

  const getTimeRangeText = (range) => {
    switch (range) {
      case 'today': return 'Hôm nay';
      case 'week': return 'Tuần này';
      case 'month': return 'Tháng này';
      default: return 'Tất cả';
    }
  };

  const renderProductItem = ({ item, index }) => (
    <View style={styles.productItem}>
      <ProductCard product={item} navigation={navigation} />
      {item.popularity_score && (
        <View style={styles.popularityBadge}>
          <Ionicons name="trending-up" size={12} color="#fff" />
          <Text style={styles.popularityText}>{item.popularity_score}</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.timeRangeText}>{getTimeRangeText(timeRange)}</Text>
        </View>
        {onViewAll && (
          <TouchableOpacity onPress={onViewAll} style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>Xem tất cả</Text>
            <Ionicons name="chevron-forward" size={16} color="#2979FF" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2979FF" />
          <Text style={styles.loadingText}>Đang tải sản phẩm phổ biến...</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item, index) => item._id || item.id || item.product_id || index.toString()}
          renderItem={renderProductItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productsList}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  timeRangeText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: '#2979FF',
    marginRight: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
  productsList: {
    paddingHorizontal: 16,
  },
  productItem: {
    width: 160,
    position: 'relative',
  },
  separator: {
    width: 12,
  },
  popularityBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  popularityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 2,
  },
});

export default TrendingProducts;
