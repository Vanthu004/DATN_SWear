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

export default function SearchSc({ route, navigation }) {
  const dispatch = useDispatch();
  const { cartCount } = useCart();
  const keywordFromNav = route?.params?.keyword || "";

  const [input, setInput] = useState(keywordFromNav);
  const [sortVisible, setSortVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [sortedProducts, setSortedProducts] = useState([]);
  const [sortType, setSortType] = useState('none');
  const [priceFilter, setPriceFilter] = useState(null); // 'under100' | 'between100_500' | 'above500'

  const { searchResults, searchLoading, searchError } = useSelector((state) => state.home);

  useEffect(() => {
    if (keywordFromNav) {
      dispatch(searchProducts(keywordFromNav));
    }
    return () => {
      dispatch(clearSearchResults());
    };
  }, [dispatch, keywordFromNav]);

  useEffect(() => {
    if (searchResults?.products) {
      setSortedProducts(searchResults.products);
    }
  }, [searchResults]);

  useEffect(() => {
    if (!searchResults?.products) return;

    let filtered = [...searchResults.products];

    if (priceFilter === 'under100') {
      filtered = filtered.filter(p => p.price < 100000);
    } else if (priceFilter === 'between100_500') {
      filtered = filtered.filter(p => p.price >= 100000 && p.price <= 500000);
    } else if (priceFilter === 'above500') {
      filtered = filtered.filter(p => p.price > 500000);
    }

    setSortedProducts(filtered);
  }, [priceFilter, searchResults]);

  const handleSearch = () => {
    if (input.trim()) {
      dispatch(searchProducts(input.trim()));
    }
  };

  const handleSort = () => {
    setSortVisible(!sortVisible);
  };

  const handleSortType = (type) => {
    setSortType(type);
    setSortVisible(false);

    if (!searchResults?.products) return;

    let sorted = [...searchResults.products];

    if (type === 'priceAsc') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (type === 'priceDesc') {
      sorted.sort((a, b) => b.price - a.price);
    } else if (type === 'nameAZ') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    }

    setSortedProducts(type === 'none' ? searchResults.products : sorted);
  };

  const handleFilter = () => setFilterVisible(!filterVisible);

  return (
    <SafeAreaView style={styles.container}>
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
          <TouchableOpacity onPress={() => { setInput(''); dispatch(clearSearchResults()); }} style={styles.iconBtn}>
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

      <View style={styles.topBar}>
        <Text style={styles.resultCount}>
          {sortedProducts.length} Sản phẩm
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

      {sortVisible && (
        <View style={styles.sortBox}>
          <TouchableOpacity onPress={() => handleSortType('none')} style={styles.sortItem}>
            <Text>Mặc định</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleSortType('priceAsc')} style={styles.sortItem}>
            <Text>Giá tăng dần</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleSortType('priceDesc')} style={styles.sortItem}>
            <Text>Giá giảm dần</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleSortType('nameAZ')} style={styles.sortItem}>
            <Text>Tên (A–Z)</Text>
          </TouchableOpacity>
        </View>
      )}

      {filterVisible && (
        <View style={styles.sortBox}>
          <TouchableOpacity onPress={() => { setPriceFilter('under100'); setFilterVisible(false); }} style={styles.sortItem}>
            <Text>Giá dưới 100.000đ</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setPriceFilter('between100_500'); setFilterVisible(false); }} style={styles.sortItem}>
            <Text>Từ 100.000đ đến 500.000đ</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setPriceFilter('above500'); setFilterVisible(false); }} style={styles.sortItem}>
            <Text>Trên 500.000đ</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setPriceFilter(null); setFilterVisible(false); }} style={styles.sortItem}>
            <Text>Hủy lọc</Text>
          </TouchableOpacity>
        </View>
      )}

      {searchLoading && <ActivityIndicator size="large" color="#2979FF" style={{ marginTop: 20 }} />}
      {searchError && <Text style={{ color: "red", marginTop: 20 }}>{searchError}</Text>}
      {!searchLoading && sortedProducts?.length === 0 && (
        <Text style={{ marginTop: 20, color: '#888', textAlign: 'center' }}>Không tìm thấy sản phẩm phù hợp.</Text>
      )}

      <FlatList
        data={sortedProducts}
        keyExtractor={(item, index) => item._id || item.id || index.toString()}
        renderItem={({ item }) => (
          <ProductCard product={item} navigation={navigation} />
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
  sortBox: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
    zIndex: 10,
    elevation: 3,
  },
  sortItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
});
