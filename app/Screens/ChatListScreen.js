// app/Screens/ChatListScreen.js
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import ChatRoomItem from '../components/chat/ChatRoomItem'; // Sửa import
import CreateChatModal from '../components/chat/CreateChatModal';
import { useAppNavigation } from '../hooks/useAppNavigation';
import { createChatRoom, fetchChatRooms } from '../reudx/chatSlice';

const ChatListScreen = () => {
  const navigation = useAppNavigation();
  const dispatch = useDispatch();

  // Redux state
  const { chatRooms, isLoadingRooms, error } = useSelector(state => state.chat);

  // Local state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, open, assigned, resolved, closed

  // Load chat rooms on mount
  useEffect(() => {
    dispatch(fetchChatRooms());
  }, [dispatch]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchChatRooms()).unwrap();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  // Handle create new chat room
  const handleCreateRoom = useCallback(async (roomData) => {
    try {
      const result = await dispatch(createChatRoom(roomData)).unwrap();

      Alert.alert(
        'Thành công',
        'Phòng chat đã được tạo. Bạn có muốn vào chat ngay không?',
        [
          { text: 'Để sau', style: 'cancel' },
          {
            text: 'Vào chat',
            onPress: () => navigation.goToChat(result.chatRoom)
          }
        ]
      );
    } catch (error) {
      throw error; // Let CreateChatModal handle the error
    }
  }, [dispatch, navigation]);

  // Handle room press
  const handleRoomPress = useCallback((room) => {
    navigation.goToChat(room); // Thay vì navigation.navigate('ChatScreen', { room })
  }, [navigation]);

  // Filter rooms based on selected filter
  const filteredRooms = chatRooms.filter(room => {
    if (filter === 'all') return true;
    return room.status === filter;
  });

  // Get filter counts
  const getFilterCounts = () => {
    const counts = {
      all: chatRooms.length,
      open: 0,
      assigned: 0,
      resolved: 0,
      closed: 0
    };

    chatRooms.forEach(room => {
      if (counts.hasOwnProperty(room.status)) {
        counts[room.status]++;
      }
    });

    return counts;
  };

  const filterCounts = getFilterCounts();

  // Render filter tabs
  const renderFilterTabs = () => {
    const filters = [
      { key: 'all', label: 'Tất cả', count: filterCounts.all },
      { key: 'open', label: 'Đang chờ', count: filterCounts.open },
      { key: 'assigned', label: 'Đã gán', count: filterCounts.assigned },
      { key: 'resolved', label: 'Đã giải quyết', count: filterCounts.resolved },
      { key: 'closed', label: 'Đã đóng', count: filterCounts.closed },
    ];

    return (
      <View style={styles.filterContainer}>
        <FlatList
          data={filters}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.filterTabs}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterTab,
                filter === item.key && styles.filterTabActive
              ]}
              onPress={() => setFilter(item.key)}
            >
              <Text style={[
                styles.filterTabText,
                filter === item.key && styles.filterTabTextActive
              ]}>
                {item.label}
              </Text>
              {item.count > 0 && (
                <View style={[
                  styles.filterBadge,
                  filter === item.key && styles.filterBadgeActive
                ]}>
                  <Text style={[
                    styles.filterBadgeText,
                    filter === item.key && styles.filterBadgeTextActive
                  ]}>
                    {item.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  // Render empty state
  const renderEmptyState = () => {
    const emptyMessages = {
      all: {
        icon: 'chatbubbles-outline',
        title: 'Chưa có phòng chat nào',
        subtitle: 'Tạo phòng chat mới để được hỗ trợ từ đội ngũ chăm sóc khách hàng'
      },
      open: {
        icon: 'time-outline',
        title: 'Không có phòng chat đang chờ',
        subtitle: 'Tất cả phòng chat đều đã được xử lý'
      },
      assigned: {
        icon: 'person-outline',
        title: 'Không có phòng chat đã gán',
        subtitle: 'Chưa có phòng chat nào được gán cho nhân viên hỗ trợ'
      },
      resolved: {
        icon: 'checkmark-circle-outline',
        title: 'Không có phòng chat đã giải quyết',
        subtitle: 'Chưa có phòng chat nào được đánh dấu là đã giải quyết'
      },
      closed: {
        icon: 'lock-closed-outline',
        title: 'Không có phòng chat đã đóng',
        subtitle: 'Chưa có phòng chat nào bị đóng'
      }
    };

    const emptyData = emptyMessages[filter];

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name={emptyData.icon} size={80} color="#ddd" />
        <Text style={styles.emptyTitle}>{emptyData.title}</Text>
        <Text style={styles.emptySubtitle}>{emptyData.subtitle}</Text>

        {filter === 'all' && (
          <TouchableOpacity
            style={styles.createFirstButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Ionicons name="add" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.createFirstButtonText}>Tạo phòng chat đầu tiên</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Render chat room item
  const renderChatRoom = ({ item }) => (
    <ChatRoomItem room={item} onPress={handleRoomPress} />
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={navigation.goBack}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Lịch sử chat</Text>

        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle-outline" size={16} color="#F44336" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => dispatch(fetchChatRooms())}
          >
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Filter Tabs */}
      {renderFilterTabs()}

      {/* Chat Rooms List */}
      <View style={styles.listContainer}>
        {isLoadingRooms && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>Đang tải phòng chat...</Text>
          </View>
        ) : filteredRooms.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={filteredRooms}
            keyExtractor={(item) => item.roomId}
            renderItem={renderChatRoom}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={['#2196F3']}
              />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>

      {/* Create Chat Modal */}
      <CreateChatModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateRoom={handleCreateRoom}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  createButton: {
    padding: 8,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#F44336',
  },
  retryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: '#F44336',
  },
  retryText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  filterContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterTabs: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  filterTabActive: {
    backgroundColor: '#2196F3',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  filterTabTextActive: {
    color: '#fff',
  },
  filterBadge: {
    marginLeft: 6,
    backgroundColor: '#999',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  filterBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  filterBadgeTextActive: {
    color: '#fff',
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  createFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 8,
  },
  createFirstButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});

export default ChatListScreen;