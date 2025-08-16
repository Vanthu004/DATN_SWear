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

const RelatedProducts = ({ 
  products, 
  loading, 
  title = "Sản phẩm liên quan",
  onViewAll,
  navigation 
}) => {
  if (!products?.length && !loading) return null;

  const renderProductItem = ({ item, index }) => (
    <View style={styles.productItem}>
      <ProductCard product={item} navigation={navigation} />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
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
          <Text style={styles.loadingText}>Đang tải sản phẩm liên quan...</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item, index) => item.id || item.product_id || index.toString()}
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
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
  },
  separator: {
    width: 12,
  },
});

export default RelatedProducts;
