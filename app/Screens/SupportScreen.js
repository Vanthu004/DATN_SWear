// app/Screens/SupportScreen.js
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
import ChatRoomItem from '../components/chat/ChatRoomItem';
import CreateChatModal from '../components/chat/CreateChatModal';

import { useAppNavigation } from '../hooks/useAppNavigation';
import { createChatRoom, fetchChatRooms } from '../reudx/chatSlice';
import socketService from '../services/socketService';

const SupportScreen = () => {




  const navigation = useAppNavigation();
  const dispatch = useDispatch();

  // Redux state
  const { isConnected, chatRooms, isLoadingRooms, error } = useSelector(state => state.chat);
  console.log('💬 Chat State:', { chatRooms, isLoadingRooms, error, isConnected });
  // Local state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

 useEffect(() => {
    if (isConnected) {
      dispatch(fetchChatRooms());
    }
  }, [isConnected, dispatch]);
  // Initialize socket connection
  useEffect(() => {
    const initializeSocket = async () => {
      try {
        await socketService.connect(dispatch);
      } catch (error) {
        console.error('Failed to connect socket:', error);
      }
    };

    initializeSocket();
    dispatch(fetchChatRooms());

    return () => {
      socketService.disconnect();
    };
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
  navigation.goToChat(room); // Thay vì navigation.navigate('Chat', { room })
}, [navigation]);

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubbles-outline" size={80} color="#ddd" />
      <Text style={styles.emptyTitle}>Chưa có phòng chat nào</Text>
      <Text style={styles.emptySubtitle}>
        Tạo phòng chat mới để được hỗ trợ từ đội ngũ chăm sóc khách hàng
      </Text>
      <TouchableOpacity
        style={styles.createFirstButton}
        onPress={() => setShowCreateModal(true)}
      >
        <Ionicons name="add" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.createFirstButtonText}>Tạo phòng chat đầu tiên</Text>
      </TouchableOpacity>
    </View>
  );

  // Render chat room item
  const renderChatRoom = ({ item }) => (
    <ChatRoomItem room={item} onPress={handleRoomPress} />
  );

  // Render connection status
  const renderConnectionStatus = () => {
    if (!isConnected) {
      return (
        <View style={styles.connectionBanner}>
          <Ionicons name="warning-outline" size={16} color="#FF9800" />
          <Text style={styles.connectionText}>
            Mất kết nối. Đang kết nối lại...
          </Text>
        </View>
      );
    }
    return null;
  };

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

        <Text style={styles.headerTitle}>Trợ giúp & Hỗ trợ</Text>

        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>

      {/* Connection Status */}
      {renderConnectionStatus()}

      {/* Error Message */}
      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle-outline" size={16} color="#F44336" />
          <Text style={styles.errorText}>Lỗi: {error}</Text>
        </View>
      )}

      {/* Support Info */}
      <View style={styles.infoSection}>
        <View style={styles.infoCard}>
          <Ionicons name="time-outline" size={20} color="#2196F3" />
          <Text style={styles.infoText}>
            Thời gian hỗ trợ: 8:00 - 22:00 hàng ngày
          </Text>
        </View>
        <View style={styles.infoCard}>
          <Ionicons name="chatbubbles-outline" size={20} color="#2196F3" />
          <Text style={styles.infoText}>
            Phản hồi trung bình trong vòng 15 phút
          </Text>
        </View>
      </View>

      {/* Chat Rooms List */}
      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Lịch sử chat ({chatRooms.length})</Text>
          <TouchableOpacity
            onPress={handleRefresh}
            disabled={isLoadingRooms}
            style={styles.refreshButton}
          >
            {isLoadingRooms ? (
              <ActivityIndicator size="small" color="#2196F3" />
            ) : (
              <Ionicons name="refresh" size={20} color="#2196F3" />
            )}
          </TouchableOpacity>
        </View>

        {isLoadingRooms && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>Đang tải phòng chat...</Text>
          </View>
        ) : chatRooms.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={chatRooms}
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
  connectionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: '#FFF3E0',
    gap: 8,
  },
  connectionText: {
    fontSize: 13,
    color: '#FF9800',
    fontWeight: '500',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: '#FFEBEE',
    gap: 8,
  },
  errorText: {
    fontSize: 13,
    color: '#F44336',
    fontWeight: '500',
  },
  infoSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  refreshButton: {
    padding: 4,
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

export default SupportScreen;