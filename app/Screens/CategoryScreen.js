import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, FlatList, Image,
  SafeAreaView,
  StyleSheet, Text, TouchableOpacity, View
} from 'react-native';
import api from '../utils/api';

const formatPrice = (price) => price?.toLocaleString('vi-VN') + ' đ';

const ProductItem = ({ item, onPress }) => {
  // Giả sử item.colors là mảng màu, item.badge là text badge, item.info là mảng info phụ
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item)}>
      
      <View>
        <Image source={{ uri: item.image_url }} style={styles.image} resizeMode="contain" />
        {item.badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        )}
        {item.info && (
          <View style={styles.infoRow}>
            {item.info.map((info, idx) => (
              <View key={idx} style={styles.infoBox}>
                <Text style={styles.infoText}>{info}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
      <View style={styles.colorRow}>
        {item.colors?.map((color, idx) => (
          <View key={idx} style={[styles.colorDot, { backgroundColor: color }]} />
        ))}
      </View>
      <Text style={styles.price}>{formatPrice(item.price)}</Text>
      <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
      <Text style={styles.brand}>{item.brand}</Text>
      <View style={styles.bottomRow}>
        <View style={styles.ratingRow}>
          <Text style={styles.rating}>★ {item.rating || '5.0'}</Text>
          <Text style={styles.count}>({item.rating_count || '0'})</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="cart-outline" size={22} color="#222" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const CategoryScreen = ({ route, navigation }) => {
  const category = route?.params?.category;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api.get(`/products/category/${category._id}`)
      .then(res => {
        if (isMounted) setProducts(res.data || []);
      })
      .catch(() => {
        if (isMounted) setProducts([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    // Lấy số lượng sản phẩm trong giỏ hàng
    api.get('/cart/count').then(res => {
      if (isMounted) setCartCount(res.data?.count || 0);
    });
    return () => { isMounted = false; };
  }, [category]);

  const handleProductPress = (product) => {
    navigation.navigate('ProductDetail', { product });
  };

  // Header tuỳ chỉnh
  React.useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <SafeAreaView style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={26} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{category.name}</Text>
          <View style={styles.headerRight}>
            {/* <TouchableOpacity style={{ marginRight: 18 }}>
              <Ionicons name="funnel-outline" size={24} color="#fff" />
            </TouchableOpacity> */}
            <TouchableOpacity>
              <Ionicons name="cart-outline" size={26} color="#000" />
              {cartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      ),
    });
  }, [navigation, cartCount, category]);

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#2979FF" />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Thanh info dưới header */}
      <View style={styles.infoBar}>
        <Text style={styles.infoBarText}>{products.length} Sản phẩm</Text>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity style={styles.infoBarBtn}>
            <Ionicons name="swap-vertical-outline" size={18} color="#222" />
            <Text style={styles.infoBarBtnText}>Sắp xếp</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.infoBarBtn}>
            <Ionicons name="options-outline" size={18} color="#222" />
            <Text style={styles.infoBarBtnText}>Bộ lọc</Text>
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={products}
        keyExtractor={item => item._id}
        renderItem={({ item }) => <ProductItem item={item} onPress={handleProductPress} />}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapperStyle}
        contentContainerStyle={styles.flatListContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
 flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 12, height: 56,
    marginTop: 60, backgroundColor:"#fff"
  },
  headerTitle: { color: '#000', fontSize: 20, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  cartBadge: {
    position: 'absolute', top: -6, right: -10, backgroundColor: '#FF5252',
    borderRadius: 8, minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center',
  },
  cartBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold', paddingHorizontal: 2 },
  infoBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee'
  },
  infoBarText: { fontWeight: 'bold', color: '#222' },
  infoBarBtn: { flexDirection: 'row', alignItems: 'center', marginLeft: 16 },
  infoBarBtnText: { marginLeft: 4, color: '#222', fontSize: 14 },
  card: {
    backgroundColor: '#fff', borderRadius: 10, margin: 6, flex: 1, padding: 8,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  image: { width: '100%', height: 120, borderRadius: 8, backgroundColor: '#f6f6f6' },
  badge: { position: 'absolute', top: 6, left: 6, backgroundColor: '#BDBDF7', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { color: '#222', fontSize: 12, fontWeight: 'bold' },
  infoRow: { flexDirection: 'row', marginTop: 4, flexWrap: 'wrap' },
  infoBox: { backgroundColor: '#E3E3F7', borderRadius: 4, marginRight: 4, paddingHorizontal: 4, paddingVertical: 2 },
  infoText: { fontSize: 11, color: '#222' },
  colorRow: { flexDirection: 'row', marginTop: 6, marginBottom: 2 },
  colorDot: { width: 12, height: 12, borderRadius: 6, marginRight: 4, borderWidth: 1, borderColor: '#eee' },
  price: { fontWeight: 'bold', color: '#222', fontSize: 16, marginTop: 2 },
  name: { fontSize: 14, color: '#222', marginTop: 4, minHeight: 36 },
  brand: { fontSize: 12, color: '#888', marginTop: 2 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  rating: { color: '#FFA000', fontSize: 13 },
  count: { color: '#888', fontSize: 12, marginLeft: 4 },
  columnWrapperStyle: { justifyContent: 'space-between' },
  flatListContent: { paddingBottom: 20 },
});

export default CategoryScreen;