import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import ProductCard from "../components/ProductCard";
import { useCart } from "../hooks/useCart";
import {
  clearSearchResults,
  searchProducts
} from "../reudx/homeSlice";
// ... import và các hook như cũ ...

export default function SearchSc({ route, navigation }) {
  const dispatch = useDispatch();
  const { cartCount } = useCart();
  const keywordFromNav = route?.params?.keyword || "";
  const [input, setInput] = useState(keywordFromNav);
  const [sortVisible, setSortVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);

  const { searchResults, searchLoading, searchError } = useSelector((state) => state.home);

  useEffect(() => {
    if (keywordFromNav) {
      dispatch(searchProducts(keywordFromNav));
    }
    return () => {
      dispatch(clearSearchResults());
    };
  }, [dispatch, keywordFromNav]);

  const handleSearch = () => {
    if (input.trim()) {
      dispatch(searchProducts(input.trim()));
    }
  };
  const handleProductPress = (product) => {
    const productData = {
      ...product,
      images: product.images && product.images.length > 0
        ? product.images
        : product.image_url
          ? [product.image_url]
          : product.image
            ? [product.image]
            : [],
    };
    navigation.navigate('ProductDetail', { product: productData });
  };
  // Dummy filter/sort handlers
  const handleSort = () => setSortVisible(!sortVisible);
  const handleFilter = () => setFilterVisible(!filterVisible);

  console.log('searchResults:', searchResults);

  return (
    <SafeAreaView style={styles.container}>
      {/* Thanh tìm kiếm với nút close và giỏ hàng */}
      <View style={styles.searchBarRow}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={26} color="#000" />
          </TouchableOpacity>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.input}
            placeholder="Tìm kiếm sản phẩm..."
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        <TouchableOpacity onPress={() => {setInput(''); dispatch(clearSearchResults())}} style={styles.iconBtn}>
          <Ionicons name="close" size={26} color="#000" />
        </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={[styles.iconBtn, { marginLeft: 8 }]}> 
          <Ionicons name="cart-outline" size={26} color="#000" />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Số lượng sản phẩm và các nút filter/sort */}
      <View style={styles.topBar}>
        <Text style={styles.resultCount}>
          {searchResults?.total ? `${searchResults.total} Sản phẩm` : "0 Sản phẩm"}
        </Text>
        <View style={styles.actionBtns}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleSort}>
            <Ionicons name="swap-vertical" size={18} color="#2979FF" />
            <Text style={styles.actionText}>Sắp xếp</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={handleFilter}>
            <Ionicons name="options" size={18} color="#2979FF" />
            <Text style={styles.actionText}>Bộ lọc</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Loading/Error/Empty */}
      {searchLoading && <ActivityIndicator size="large" color="#2979FF" style={{ marginTop: 20 }} />}
      {searchError && <Text style={{ color: "red", marginTop: 20 }}>{searchError}</Text>}
      {!searchLoading && searchResults && searchResults.length === 0 && (
        <Text style={{ marginTop: 20, color: '#888', textAlign: 'center' }}>Không tìm thấy sản phẩm phù hợp.</Text>
      )}

      {/* Danh sách sản phẩm */}
      <FlatList
        data={searchResults?.products || []}
        keyExtractor={(item) => item._id || item.id}
        renderItem={({ item }) => (
          <ProductCard product={item} navigation={navigation}  onPress={handleProductPress}/>
        )}
        numColumns={2}
        contentContainerStyle={{ padding: 12 }}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', marginTop: 0 },
  searchBarRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, marginTop: 60, marginBottom: 8, backgroundColor: '#fff',
  },
  iconBtn: {
    padding: 4,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    borderRadius: 18,
    paddingHorizontal: 10,
    marginHorizontal: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
    color: '#222',
  },
  cartBadge: {
    position: 'absolute', top: -6, right: -10, backgroundColor: '#FF5252',
    borderRadius: 8, minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center',
  },
  cartBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold', paddingHorizontal: 2 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 8,
    marginTop: 8,
  },
  resultCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  actionBtns: {
    flexDirection: 'row',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  actionText: {
    marginLeft: 4,
    color: '#2979FF',
    fontWeight: '500',
  },
});