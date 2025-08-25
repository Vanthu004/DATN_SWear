import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import MessageBubble from '../components/chat/MessageBubble';
import MessageInput from '../components/chat/MessageInput';
import { useAuth } from '../context/AuthContext';
import { useAppNavigation } from '../hooks/useAppNavigation';
import {
  addMessage,
  clearCurrentRoom,
  clearError,
  fetchMessages,
  sendMessage,
  setCurrentRoom,
  updateRoomStatus
} from '../reudx/chatSlice';
import { chatAPI, chatUtils } from '../services/chatService';
import socketService from '../services/socketService';

const ChatScreen = ({ route }) => {
  //console.log('🔍 ChatScreen params:', route.params);
  const navigation = useAppNavigation();
  const dispatch = useDispatch();
  const { userInfo } = useAuth(); // Sử dụng userInfo thay vì user
  const { room: initialRoom } = route.params;
  const { currentRoom, currentMessages, isLoadingMessages, isSendingMessage, isConnected, error, hasMoreMessages } = useSelector(state => state.chat);
  
  const [room, setRoom] = useState(initialRoom);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [typingTimeout, setTypingTimeout] = useState(null);
  
  const flatListRef = useRef(null);
  const lastMessageId = useRef(null);

  // Debug userInfo từ useAuth
  useEffect(() => {
    //console.log('🔍 useAuth userInfo:', userInfo);
  }, [userInfo]);

  // Check if current user is the room owner
  const isRoomOwner = userInfo?._id === room?.userId || userInfo?.id === room?.userId;

  useEffect(() => {
    //console.log('🔍 Current messages IDs:', currentMessages.map(msg => msg.id));
    const initializeChat = async () => {
      try {
        dispatch(clearCurrentRoom());
        dispatch(setCurrentRoom(room));
        if (!socketService.getConnectionStatus()) {
          await socketService.connect(dispatch);
        }
        socketService.joinRoom(room.roomId);
        const result = await dispatch(fetchMessages({ roomId: room.roomId, page: 1 })).unwrap();
        //console.log('🔍 fetchMessages result:', result);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: false });
        }, 100);
      } catch (error) {
        console.error('Failed to initialize chat:', error);
        Alert.alert('Lỗi', 'Không thể tải phòng chat: ' + (error.message || 'Lỗi không xác định'));
      }
    };

    initializeChat();

    return () => {
      if (room) {
        socketService.leaveRoom(room.roomId);
      }
      dispatch(clearCurrentRoom());
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [room.roomId, dispatch]);

  useEffect(() => {
    const handleNewMessage = (message) => {
      //console.log('🔍 New message from socket:', message);
      const messageExists = currentMessages.some(msg => msg.id === message.id);
      if (!messageExists && (!lastMessageId.current || message.id !== lastMessageId.current)) {
        dispatch(addMessage(message));
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
      lastMessageId.current = message.id;
    };

    const handleRoomStatusUpdate = (data) => {
      if (data.roomId === room.roomId) {
        setRoom(prev => ({ ...prev, status: data.status }));
        dispatch(updateRoomStatus({ roomId: data.roomId, status: data.status }));
      }
    };

    const handleError = (error) => {
      Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra');
    };

    socketService.on('new_message', handleNewMessage);
    socketService.on('room_status_updated', handleRoomStatusUpdate);
    socketService.on('error', handleError);

    return () => {
      socketService.off('new_message', handleNewMessage);
      socketService.off('room_status_updated', handleRoomStatusUpdate);
      socketService.off('error', handleError);
    };
  }, [room.roomId, dispatch, currentMessages]);

  const handleSendMessage = useCallback(async (content) => {
    if (!content.trim() || !room.roomId) return;

    const messageData = {
      roomId: room.roomId,
      content: content.trim(),
      type: 'text',
      metadata: {},
      role: 'user' // Thêm role cho tin nhắn của user
    };

    try {
      const socketSent = socketService.sendMessage(messageData);
      if (!socketSent) {
        await dispatch(sendMessage(messageData)).unwrap();
      }
      setRoom(prev => ({ ...prev, lastMessageAt: new Date().toISOString() }));
    } catch (error) {
      console.error('Send message error:', error);
      Alert.alert('Lỗi', 'Không thể gửi tin nhắn. Vui lòng thử lại.');
    }
  }, [room.roomId, dispatch]);

  const handleSendImage = useCallback(async (imageUri) => {
    if (!imageUri || !room.roomId) return;

    try {
      const uploadResult = await chatAPI.uploadImage(imageUri);
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Upload failed');
      }

      const messageData = {
        roomId: room.roomId,
        content: uploadResult.url,
        type: 'image',
        metadata: {
          publicId: uploadResult.publicId,
          originalUri: imageUri
        },
        role: 'user' // Thêm role cho tin nhắn hình ảnh của user
      };

      const socketSent = socketService.sendMessage(messageData);
      if (!socketSent) {
        await dispatch(sendMessage(messageData)).unwrap();
      }
      setRoom(prev => ({ ...prev, lastMessageAt: new Date().toISOString() }));
    } catch (error) {
      console.error('Send image error:', error);
      Alert.alert('Lỗi', 'Không thể gửi ảnh. Vui lòng thử lại.');
    }
  }, [room.roomId, dispatch]);

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMoreMessages || isLoadingMessages) return;

    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const result = await dispatch(fetchMessages({ 
        roomId: room.roomId, 
        page: nextPage 
      })).unwrap();
      //console.log('🔍 Load more result:', result);
      setCurrentPage(nextPage);
    } catch (error) {
      console.error('Load more messages error:', error);
      Alert.alert('Lỗi', 'Không thể tải thêm tin nhắn');
    } finally {
      setIsLoadingMore(false);
    }
  }, [room.roomId, currentPage, isLoadingMore, hasMoreMessages, isLoadingMessages, dispatch]);

  const handleImagePress = useCallback((imageUrl) => {
    Alert.alert('Xem ảnh', 'Tính năng xem ảnh toàn màn hình sẽ được phát triển');
  }, []);

  const getCurrentUserId = () => {
    const userId = userInfo?._id || userInfo?.id || null; // Kiểm tra cả _id và id
    if (!userId) {
      console.warn('🔍 Warning: userInfo._id or userInfo.id is null. Check AuthContext.');
    }
    return userId;
  };

  const renderMessage = ({ item, index }) => {
   //('🔍 Message key:', item.id.toString());
    //console.log('🔍 Rendering message:', item, 'User ID:', getCurrentUserId());
    const isCurrentUser = item.sender_id === getCurrentUserId();
    const showSenderInfo = !isCurrentUser && (
      index === 0 || 
      currentMessages[index - 1]?.sender_id !== item.sender_id
    );

    return (
      <MessageBubble
        message={item}
        isCurrentUser={isCurrentUser}
        showSenderInfo={showSenderInfo}
        onImagePress={handleImagePress}
      />
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={navigation.goBack}
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      <View style={styles.roomInfo}>
        <Text style={styles.roomSubject} numberOfLines={1}>
          {room.subject}
        </Text>
        <View style={styles.roomStatus}>
          <View style={[
            styles.statusDot, 
            { backgroundColor: chatUtils.getStatusColor(room.status) }
          ]} />
          <Text style={styles.statusText}>
            {chatUtils.getStatusText(room.status)}
          </Text>
          {!isConnected && (
            <>
              <Text style={styles.statusSeparator}>•</Text>
              <Text style={styles.offlineText}>Offline</Text>
            </>
          )}
        </View>
      </View>
    </View>
  );

  const renderLoadMoreIndicator = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.loadMoreContainer}>
        <ActivityIndicator size="small" color="#2196F3" />
        <Text style={styles.loadMoreText}>Đang tải thêm tin nhắn...</Text>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubbles-outline" size={60} color="#ddd" />
      <Text style={styles.emptyText}>Chưa có tin nhắn nào</Text>
      <Text style={styles.emptySubtext}>Hãy gửi tin nhắn đầu tiên để bắt đầu cuộc trò chuyện</Text>
    </View>
  );

  const isChatDisabled = room.status === 'closed' || room.status === 'resolved';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        {renderHeader()}
      </View>
      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 20}
      >
        {isLoadingMessages ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>Đang tải tin nhắn...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={24} color="#F44336" />
            <Text style={styles.errorText}>{error || 'Không thể tải tin nhắn. Vui lòng thử lại.'}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                dispatch(clearError());
                dispatch(fetchMessages({ roomId: room.roomId, page: 1 }));
              }}
            >
              <Text style={styles.retryText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={currentMessages}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderMessage}
            contentContainerStyle={[
              styles.messagesList,
              currentMessages.length === 0 && styles.emptyList
            ]}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.1}
            ListHeaderComponent={renderLoadMoreIndicator}
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
              autoscrollToTopThreshold: 10,
            }}
            extraData={currentMessages.length}
          />
        )}
        {isChatDisabled && (
          <View style={styles.disabledBanner}>
            <Ionicons name="lock-closed-outline" size={16} color="#666" />
            <Text style={styles.disabledText}>
              Phòng chat đã {room.status === 'closed' ? 'đóng' : 'được giải quyết'}
            </Text>
          </View>
        )}
        <View style={styles.inputContainer}>
          <MessageInput
            onSendMessage={handleSendMessage}
            onSendImage={handleSendImage}
            disabled={isChatDisabled || isSendingMessage}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerContainer: {
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  roomInfo: {
    flex: 1,
  },
  roomSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  roomStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  statusSeparator: {
    fontSize: 12,
    color: '#ccc',
    marginHorizontal: 4,
  },
  offlineText: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '500',
  },
  chatContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#F44336',
    textAlign: 'center',
  },
  retryButton: {
    padding: 10,
    backgroundColor: '#2196F3',
    borderRadius: 5,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  messagesList: {
    flexGrow: 1,
    paddingVertical: 8,
  },
  emptyList: {
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
  loadMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  loadMoreText: {
    fontSize: 12,
    color: '#666',
  },
  disabledBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 8,
  },
  disabledText: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
});

export default ChatScreen;