import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
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
import PopularKeywords from "../components/PopularKeywords";
import ProductCard from "../components/ProductCard";
import ProductSuggestions from "../components/ProductSuggestions";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../hooks/useCart";
import { useSearchHistory } from "../hooks/useSearchHistory";
import {
  clearSearchResults,
  searchProducts
} from "../reudx/homeSlice";
import { getProductSuggestions } from "../utils/api";

export default function SearchSc({ route, navigation }) {
  const dispatch = useDispatch();
  const { cartCount } = useCart();
  const { userInfo } = useAuth();
  const keywordFromNav = route?.params?.keyword || "";

  const [input, setInput] = useState(keywordFromNav);
  const [sortVisible, setSortVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [sortedProducts, setSortedProducts] = useState([]);
  const [sortType, setSortType] = useState('none');
  const [priceFilter, setPriceFilter] = useState(null); // 'under100' | 'between100_500' | 'above500'

  // Product suggestions state
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Search history state
  const [showSearchHistory, setShowSearchHistory] = useState(true);
  const [showSmartSuggestions, setShowSmartSuggestions] = useState(false);

  const { searchResults, searchLoading, searchError } = useSelector((state) => state.home);

  // Search history hook
  const {
    popularKeywords,
    recentHistory,
    searchSuggestions,
    loading: searchHistoryLoading,
    fetchPopularKeywords,
    fetchRecentHistory,
    fetchSearchSuggestions,
    addToSearchHistory,
    removeFromSearchHistory,
    clearSuggestions
  } = useSearchHistory();

  useEffect(() => {
    if (keywordFromNav) {
      dispatch(searchProducts(keywordFromNav));
      setShowSearchHistory(false);
    } else {
      // Load search history when no keyword
      fetchPopularKeywords(8, 'week');
      if (userInfo?._id) {
        fetchRecentHistory(5);
      }
    }
    return () => {
      dispatch(clearSearchResults());
    };
  }, [dispatch, keywordFromNav, fetchPopularKeywords, fetchRecentHistory, userInfo]);

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

  // Debounced search suggestions
  const debouncedSearchSuggestions = useCallback(
    async (keyword) => {
      if (keyword.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setSuggestionsLoading(true);
      try {
        const response = await getProductSuggestions(keyword.trim(), 8);
        if (response.success) {
          setSuggestions(response.suggestions || []);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setSuggestionsLoading(false);
      }
    },
    []
  );

  const handleSearch = async () => {
    if (input.trim()) {
      setShowSuggestions(false);
      setShowSmartSuggestions(false);
      setShowSearchHistory(false);

      // Add to search history if user is logged in
      if (userInfo?._id) {
        try {
          await addToSearchHistory({
            keyword: input.trim(),
            searchType: 'product',
            resultCount: 0 // Will be updated after search
          });
        } catch (error) {
          console.error('Error adding to search history:', error);
        }
      }

      dispatch(searchProducts(input.trim()));
    }
  };

  const handleInputChange = (text) => {
    setInput(text);
    setShowSearchHistory(false);

    if (text.trim().length >= 2) {
      debouncedSearchSuggestions(text);
      // Fetch smart suggestions if user is logged in
      if (userInfo?._id) {
        fetchSearchSuggestions(text);
        setShowSmartSuggestions(true);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setShowSmartSuggestions(false);
      setShowSearchHistory(true);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    setInput(suggestion.name);
    setShowSuggestions(false);
    setShowSmartSuggestions(false);
    setShowSearchHistory(false);
    dispatch(searchProducts(suggestion.name));
  };

  const handleCloseSuggestions = () => {
    setShowSuggestions(false);
  };

  const handleKeywordPress = async (keyword) => {
    setInput(keyword);
    setShowSearchHistory(false);
    setShowSmartSuggestions(false);

    // Add to search history if user is logged in
    if (userInfo?._id) {
      try {
        await addToSearchHistory({
          keyword: keyword,
          searchType: 'product',
          resultCount: 0
        });
      } catch (error) {
        console.error('Error adding to search history:', error);
      }
    }

    dispatch(searchProducts(keyword));
  };

  const handleDeleteHistory = async (keyword) => {
    try {
      await removeFromSearchHistory(keyword);
    } catch (error) {
      console.error('Error deleting history:', error);
    }
  };

  const handleClearAllHistory = async () => {
    try {
      await removeFromSearchHistory();
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  const handleSelectSmartSuggestion = async (keyword) => {
    setInput(keyword);
    setShowSmartSuggestions(false);
    setShowSearchHistory(false);

    // Add to search history if user is logged in
    if (userInfo?._id) {
      try {
        await addToSearchHistory({
          keyword: keyword,
          searchType: 'product',
          resultCount: 0
        });
      } catch (error) {
        console.error('Error adding to search history:', error);
      }
    }

    dispatch(searchProducts(keyword));
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

  // Check if search has been performed
  const isSearchPerformed = input.trim() || searchResults?.products?.length > 0;

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
            onChangeText={handleInputChange}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity onPress={() => { 
            setInput(''); 
            setSuggestions([]);
            setShowSuggestions(false);
            setShowSmartSuggestions(false);
            setShowSearchHistory(true);
            dispatch(clearSearchResults()); 
          }} style={styles.iconBtn}>
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
      {/* Product Suggestions */}
      <ProductSuggestions
        suggestions={suggestions}
        loading={suggestionsLoading}
        visible={showSuggestions}
        onSelectSuggestion={handleSelectSuggestion}
        onClose={handleCloseSuggestions}
      />
      {/* Smart Search Suggestions */}
      {/* <SmartSearchSuggestions
        suggestions={searchSuggestions}
        loading={searchHistoryLoading}
        visible={showSmartSuggestions}
        currentKeyword={input}
        onSelectSuggestion={handleSelectSmartSuggestion}
        onClose={() => setShowSmartSuggestions(false)}
      /> */}
      {/* Search History and Popular Keywords */}
      {showSearchHistory && !input.trim() && (
        <View style={styles.searchHistoryContainer}>
          {/* Popular Keywords */}
          <PopularKeywords
            keywords={popularKeywords}
            loading={searchHistoryLoading}
            title="🔥 Từ khóa phổ biến"
            timeRange="week"
            onKeywordPress={handleKeywordPress}
          />
          {/* Recent Search History */}
          {/* {userInfo?._id && (
            <SearchHistory
              history={recentHistory}
              loading={searchHistoryLoading}
              title="🔍 Tìm kiếm gần đây"
              onKeywordPress={handleKeywordPress}
              onDeleteHistory={handleDeleteHistory}
              onClearAll={handleClearAllHistory}
            />
          )} */}
        </View>
      )}
      {/* Show search results UI only if a search has been performed */}
      {isSearchPerformed && (
        <>
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
        </>
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
      <View style={{height: 50}}></View>
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
  searchHistoryContainer: {
    flex: 1,
    paddingTop: 8,
  },
});