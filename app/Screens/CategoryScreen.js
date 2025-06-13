import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import ProductCard from '../components/ProductCard'; // Sử dụng component sản phẩm

const mockProducts = [
  {
    id: '1',
    name: 'Áo thun Nam U.S Cotton',
    price: '560.000 VND',
    image: 'https://bizweb.dktcdn.net/thumb/large/100/078/144/products/2888-2.jpg?v=1742962093133',
  },
  {
    id: '2',
    name: 'Áo thun Tennis Nam',
    price: '490.000 VND',
    image: 'https://bizweb.dktcdn.net/thumb/large/100/078/144/products/2888-2.jpg?v=1742962093133',
  },
  {
    id: '3',
    name: 'Áo thun thể thao Nam',
    price: '560.000 VND',
    image: 'https://bizweb.dktcdn.net/thumb/large/100/078/144/products/2888-2.jpg?v=1742962093133',
  },
  {
    id: '4',
    name: 'Áo thun Nam Delta',
    price: '690.000 VND',
    image: 'https://bizweb.dktcdn.net/thumb/large/100/078/144/products/2888-2.jpg?v=1742962093133',
  },
  {
    id: '5',
    name: 'Áo thun Nam Delta',
    price: '690.000 VND',
    image: 'https://bizweb.dktcdn.net/thumb/large/100/078/144/products/2888-2.jpg?v=1742962093133',
  },
  {
    id: '6',
    name: 'Áo thun Nam Delta',
    price: '690.000 VND',
    image: 'https://bizweb.dktcdn.net/thumb/large/100/078/144/products/2888-2.jpg?v=1742962093133',
  },
];

const CategoryScreen = ({ route, navigation }) => {
  const category = route?.params?.category || 'Sản phẩm'; // Lấy category từ params

  const handleProductPress = (product) => {
    // Điều hướng đến màn hình chi tiết sản phẩm
    navigation.navigate('ProductCard', { product });  // Đảm bảo 'Product' đã được khai báo trong App.js
  };

  const renderItem = ({ item }) => (
    <ProductCard product={item} onPress={handleProductPress} />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Danh mục: {category}</Text>
      <FlatList
        data={mockProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapperStyle}
        contentContainerStyle={styles.flatListContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#333' },
  columnWrapperStyle: { justifyContent: 'space-between' },
  flatListContent: { paddingBottom: 20 },
});

export default CategoryScreen;
