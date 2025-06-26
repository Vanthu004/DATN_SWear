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
    View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import ProductCard from "../components/ProductCard";
import {
    clearSearchResults,
    searchProducts
} from "../reudx/homeSlice";

export default function SearchSc({ route, navigation }) {
  const dispatch = useDispatch();
  const keywordFromNav = route?.params?.keyword || "";
  const [input, setInput] = useState(keywordFromNav);
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          placeholder="Tìm kiếm sản phẩm..."
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity onPress={handleSearch} style={styles.searchBtn}>
          <Ionicons name="search" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { setInput(""); dispatch(clearSearchResults()); }} style={styles.clearBtn}>
          <Ionicons name="close" size={20} color="#888" />
        </TouchableOpacity>
      </View>
      {searchLoading && <ActivityIndicator size="large" color="#2979FF" style={{ marginTop: 20 }} />}
      {searchError && <Text style={{ color: "red", marginTop: 20 }}>{searchError}</Text>}
      {!searchLoading && searchResults && searchResults.length === 0 && (
        <Text style={{ marginTop: 20, color: '#888', textAlign: 'center' }}>Không tìm thấy sản phẩm phù hợp.</Text>
      )}
      <FlatList
        data={searchResults}
        keyExtractor={(item) => item._id || item.id}
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
  container: { flex: 1, backgroundColor: '#fff' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 12,
    backgroundColor: '#F6F6F6',
    borderRadius: 18,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
    color: '#222',
  },
  searchBtn: {
    backgroundColor: '#2979FF',
    borderRadius: 16,
    padding: 8,
    marginLeft: 6,
  },
  clearBtn: {
    marginLeft: 6,
    padding: 6,
  },
});
