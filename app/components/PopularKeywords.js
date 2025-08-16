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

const PopularKeywords = ({ 
  keywords, 
  loading, 
  title = "🔥 Từ khóa phổ biến",
  onKeywordPress,
  timeRange = 'week'
}) => {
  if (!keywords?.length && !loading) return null;

  const getTimeRangeText = (range) => {
    switch (range) {
      case 'today': return 'Hôm nay';
      case 'week': return 'Tuần này';
      case 'month': return 'Tháng này';
      default: return 'Tất cả';
    }
  };

  const renderKeywordItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.keywordItem}
      onPress={() => onKeywordPress(item.keyword)}
    >
      <View style={styles.keywordContent}>
        <Text style={styles.keywordText}>{item.keyword}</Text>
        <View style={styles.keywordMeta}>
          <Ionicons name="search" size={12} color="#666" />
          <Text style={styles.searchCount}>{item.total_searches} lượt tìm</Text>
        </View>
      </View>
      {index < 3 && (
        <View style={[styles.trendingBadge, { backgroundColor: index === 0 ? '#FF6B35' : index === 1 ? '#FFA726' : '#FFB74D' }]}>
          <Text style={styles.trendingText}>#{index + 1}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.timeRangeText}>{getTimeRangeText(timeRange)}</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#2979FF" />
          <Text style={styles.loadingText}>Đang tải từ khóa phổ biến...</Text>
        </View>
      ) : (
        <FlatList
          data={keywords}
          keyExtractor={(item, index) => item.keyword || index.toString()}
          renderItem={renderKeywordItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.keywordsList}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timeRangeText: {
    fontSize: 12,
    color: '#666',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
  keywordsList: {
    paddingHorizontal: 16,
  },
  keywordItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 120,
    position: 'relative',
  },
  keywordContent: {
    flex: 1,
  },
  keywordText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  keywordMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchCount: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
  },
  trendingBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendingText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  separator: {
    width: 8,
  },
});

export default PopularKeywords;
