import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const ProductSuggestions = ({ 
  suggestions, 
  loading, 
  visible, 
  onSelectSuggestion, 
  onClose 
}) => {
  if (!visible || !suggestions?.length) return null;

  const renderSuggestionItem = ({ item }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => onSelectSuggestion(item)}
    >
      <Image
        source={{ uri: item.image_url }}
        style={styles.suggestionImage}
        defaultSource={require('../../assets/images/default-avatar.png')}
      />
      <View style={styles.suggestionInfo}>
        <Text style={styles.suggestionName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.suggestionPrice}>{item.price}</Text>
        <Text style={styles.suggestionCategory}>{item.category}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gợi ý sản phẩm</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={20} color="#666" />
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#2979FF" />
          <Text style={styles.loadingText}>Đang tìm kiếm...</Text>
        </View>
      ) : (
        <FlatList
          data={suggestions}
          keyExtractor={(item, index) => item.id || item.product_id || index.toString()}
          renderItem={renderSuggestionItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.suggestionsList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 120,
    left: 12,
    right: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
    maxHeight: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  suggestionsList: {
    paddingVertical: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
  },
  suggestionImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  suggestionInfo: {
    flex: 1,
    marginRight: 8,
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  suggestionPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2979FF',
    marginBottom: 2,
  },
  suggestionCategory: {
    fontSize: 12,
    color: '#666',
  },
});

export default ProductSuggestions;
