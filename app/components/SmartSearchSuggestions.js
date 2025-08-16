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

const SmartSearchSuggestions = ({ 
  suggestions, 
  loading, 
  visible, 
  currentKeyword,
  onSelectSuggestion, 
  onClose 
}) => {
  if (!visible || !suggestions?.length) return null;

  const getSourceIcon = (source) => {
    switch (source) {
      case 'history': return '🕒';
      case 'popular': return '🔥';
      default: return '💡';
    }
  };

  const getSourceText = (source) => {
    switch (source) {
      case 'history': return 'Tìm kiếm gần đây';
      case 'popular': return 'Từ khóa phổ biến';
      default: return 'Gợi ý';
    }
  };

  const highlightKeyword = (keyword, searchTerm) => {
    if (!searchTerm) return keyword;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = keyword.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <Text key={index} style={styles.highlightedText}>{part}</Text>
      ) : (
        <Text key={index}>{part}</Text>
      )
    );
  };

  const renderSuggestionItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => onSelectSuggestion(item.keyword)}
    >
      <View style={styles.suggestionIcon}>
        <Text style={styles.iconText}>{getSourceIcon(item.source)}</Text>
      </View>
      <View style={styles.suggestionContent}>
        <Text style={styles.suggestionKeyword}>
          {highlightKeyword(item.keyword, currentKeyword)}
        </Text>
        <Text style={styles.suggestionMeta}>
          {getSourceText(item.source)}
          {item.total_searches && ` • ${item.total_searches} lượt tìm`}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#999" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💡 Gợi ý tìm kiếm</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={20} color="#666" />
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#2979FF" />
          <Text style={styles.loadingText}>Đang tìm gợi ý...</Text>
        </View>
      ) : (
        <FlatList
          data={suggestions}
          keyExtractor={(item, index) => item.keyword || index.toString()}
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
  suggestionIcon: {
    marginRight: 12,
    width: 24,
    alignItems: 'center',
  },
  iconText: {
    fontSize: 16,
  },
  suggestionContent: {
    flex: 1,
    marginRight: 8,
  },
  suggestionKeyword: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  highlightedText: {
    fontWeight: 'bold',
    color: '#2979FF',
  },
  suggestionMeta: {
    fontSize: 12,
    color: '#666',
  },
});

export default SmartSearchSuggestions;
