import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View
} from 'react-native';
import ProductCard from '../components/ProductCard';
import { useCart } from '../hooks/useCart';
import api from '../utils/api';

const CategoryScreen = ({ route, navigation }) => {
  const category = route?.params?.category;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { cartCount } = useCart();

  const [showSortPopup, setShowSortPopup] = useState(false);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [sortOption, setSortOption] = useState('Mặc định');
  const [filterOption, setFilterOption] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api.get(`/products/category/${category._id}`)
      .then(res => {
        if (!isMounted) return;
        let data = res.data || [];

        // Apply filter
        if (filterOption === 'Giá dưới 100.000đ') {
          data = data.filter(p => p.price < 100000);
        } else if (filterOption === 'Từ 100.000đ đến 500.000đ') {
          data = data.filter(p => p.price >= 100000 && p.price <= 500000);
        } else if (filterOption === 'Trên 500.000đ') {
          data = data.filter(p => p.price > 500000);
        }

        // Apply sort
        if (sortOption === 'Giá tăng dần') {
          data.sort((a, b) => a.price - b.price);
        } else if (sortOption === 'Giá giảm dần') {
          data.sort((a, b) => b.price - a.price);
        } else if (sortOption === 'Tên (A – Z)') {
          data.sort((a, b) => a.name.localeCompare(b.name));
        }

        setProducts(data);
      })
      .catch(() => {
        if (isMounted) setProducts([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [category, sortOption, filterOption]);

  const handleProductPress = (product) => {
    const productData = {
      ...product,
      images: product.images?.length > 0
        ? product.images
        : product.image_url
          ? [product.image_url]
          : product.image
            ? [product.image]
            : [],
    };
    navigation.navigate('ProductDetail', { product: productData });
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <SafeAreaView style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={26} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{category.name}</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
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
      <View style={styles.infoBar}>
        <Text style={styles.infoBarText}>{products.length} Sản phẩm</Text>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity style={styles.infoBarBtn} onPress={() => setShowSortPopup(!showSortPopup)}>
            <Ionicons name="swap-vertical-outline" size={18} color="#222" />
            <Text style={styles.infoBarBtnText}>Sắp xếp</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.infoBarBtn} onPress={() => setShowFilterPopup(!showFilterPopup)}>
            <Ionicons name="options-outline" size={18} color="#222" />
            <Text style={styles.infoBarBtnText}>Bộ lọc</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showSortPopup && (
        <View style={popupStyles.container}>
          {['Mặc định', 'Giá tăng dần', 'Giá giảm dần', 'Tên (A – Z)'].map((option, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => {
                setSortOption(option);
                setShowSortPopup(false);
              }}
            >
              <Text style={popupStyles.item}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {showFilterPopup && (
        <View style={popupStyles.container}>
          {['Giá dưới 100.000đ', 'Từ 100.000đ đến 500.000đ', 'Trên 500.000đ'].map((option, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => {
                setFilterOption(option);
                setShowFilterPopup(false);
              }}
            >
              <Text style={popupStyles.item}>{option}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            onPress={() => {
              setFilterOption(null);
              setShowFilterPopup(false);
            }}
          >
            <Text style={[popupStyles.item, { color: 'red' }]}>Hủy lọc</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={products}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <ProductCard product={item} navigation={navigation} onPress={handleProductPress} />
        )}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapperStyle}
        contentContainerStyle={styles.flatListContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    height: 56,
    marginTop: 30,
    backgroundColor: "#fff"
  },
  headerTitle: {
    color: '#000',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center'
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: '#FF5252',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 2
  },
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#eee'
  },
  infoBarText: {
    fontWeight: 'bold',
    color: '#222'
  },
  infoBarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16
  },
  infoBarBtnText: {
    marginLeft: 4,
    color: '#222',
    fontSize: 14
  },
  columnWrapperStyle: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  flatListContent: {
    paddingBottom: 20,
  },
});

const popupStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: '70%',
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 5,
    padding: 12,
    zIndex: 10,
  },
  item: {
    paddingVertical: 10,
    fontSize: 16,
    color: '#000',
  },
});

export default CategoryScreen;
