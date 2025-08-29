import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const SearchHistory = ({
  history,
  loading,
  title = 'Tìm kiếm gần đây',
  onKeywordPress,
  onDeleteHistory,
  onClearAll,
}) => {
  if (!history?.length && !loading) {
    console.log('Không có lịch sử hoặc đang tải:', { history, loading });
    return null;
  }

  const formatTime = (dateString) => {
    if (!dateString) {
      console.warn('Ngày không hợp lệ:', dateString);
      return 'N/A';
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn('Ngày không hợp lệ:', dateString);
      return 'N/A';
    }
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Vừa xong';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const renderHistoryItem = ({ item, index }) => {
    if (!item || !item.keyword) {
      console.warn('Mục lịch sử không hợp lệ tại index', index, item);
      return null;
    }
    return (
      <View style={styles.historyItem}>
        <TouchableOpacity
          style={styles.historyContent}
          onPress={() => {
            if (typeof item.keyword === 'string') {
              onKeywordPress(item.keyword);
            } else {
              console.warn('Keyword không hợp lệ:', item.keyword);
            }
          }}
        >
          <View style={styles.historyIcon}>
            <Ionicons name="time-outline" size={16} color="#666" />
          </View>
          <View style={styles.historyInfo}>
            <Text style={styles.historyKeyword}>
              {typeof item.keyword === 'string' ? item.keyword : 'N/A'}
            </Text>
            <Text style={styles.historyTime}>{formatTime(item.last_searched_at)}</Text>
          </View>
          {item.result_count && typeof item.result_count === 'number' && (
            <View style={styles.resultCount}>
              <Text style={styles.resultCountText}>{item.result_count} kết quả</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            if (typeof item.keyword === 'string') {
              onDeleteHistory(item.keyword);
            } else {
              console.warn('Keyword không hợp lệ khi xóa:', item.keyword);
            }
          }}
        >
          <Ionicons name="close-outline" size={16} color="#999" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{typeof title === 'string' ? title : 'Tìm kiếm'}</Text>
        {history?.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              if (typeof onClearAll === 'function') {
                onClearAll();
              } else {
                console.warn('onClearAll không phải là hàm');
              }
            }}
            style={styles.clearButton}
          >
            <Text style={styles.clearText}>Xóa tất cả</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#2979FF" />
          <Text style={styles.loadingText}>Đang tải lịch sử...</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item, index) => (item.keyword ? item.keyword : index.toString())}
          renderItem={renderHistoryItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.historyList}
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
  clearButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearText: {
    fontSize: 14,
    color: '#2979FF',
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
  historyList: {
    paddingHorizontal: 16,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  historyContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyIcon: {
    marginRight: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyKeyword: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  historyTime: {
    fontSize: 12,
    color: '#666',
  },
  resultCount: {
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  resultCountText: {
    fontSize: 11,
    color: '#2979FF',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
});

export default SearchHistory;