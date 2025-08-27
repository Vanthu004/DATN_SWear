import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { chatUtils } from '../../services/chatService';

const MessageBubble = ({ message, isCurrentUser, onImagePress }) => {
  const isImage = message.type === 'image';
  const role = message.role || 'user'; // Lấy role từ message, mặc định là 'user'

  // Xác định màu sắc và vị trí dựa trên role
  const getBubbleStyle = () => {
    if (isCurrentUser) {
      return [styles.messageBubble, styles.currentUserBubble];
    }
    if (role === 'admin') {
      return [styles.messageBubble, styles.adminBubble];
    }
    if (role === 'staff') {
      return [styles.messageBubble, styles.staffBubble];
    }
    return [styles.messageBubble, styles.otherUserBubble];
  };

  const getTextStyle = () => {
    if (isCurrentUser) {
      return [styles.messageText, styles.currentUserText];
    }
    if (role === 'admin' || role === 'staff') {
      return [styles.messageText, styles.otherUserText];
    }
    return [styles.messageText, styles.otherUserText];
  };

  const getContainerStyle = () => {
    if (isCurrentUser) {
      return [styles.messageContainer, styles.currentUserContainer];
    }
    return [styles.messageContainer, styles.otherUserContainer];
  };

  return (
    <View style={getContainerStyle()}>
      {!isCurrentUser && (
        <View style={styles.senderInfo}>
          {message.sender_avatar ? (
            <Image source={{ uri: message.sender_avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.defaultAvatar]}>
              <Ionicons name="person" size={16} color="#666" />
            </View>
          )}
          <Text style={styles.senderName}>
            {message.sender_name} {role === 'admin' ? '(Admin)' : role === 'staff' ? '(Staff)' : ''}
          </Text>
        </View>
      )}
      
      <View style={getBubbleStyle()}>
        {isImage ? (
          <TouchableOpacity onPress={() => onImagePress?.(message.content)}>
            <Image source={{ uri: message.content }} style={styles.messageImage} />
          </TouchableOpacity>
        ) : (
          <Text style={getTextStyle()}>
            {message.content}
          </Text>
        )}
      </View>
      
      <Text style={[
        styles.messageTime,
        isCurrentUser ? styles.currentUserTime : styles.otherUserTime
      ]}>
        {chatUtils.formatMessageTime(message.created_at)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  currentUserContainer: {
    alignItems: 'flex-end',
  },
  otherUserContainer: {
    alignItems: 'flex-start',
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  defaultAvatar: {
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  senderName: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 4,
  },
  currentUserBubble: {
    backgroundColor: '#2196F3',
    borderBottomRightRadius: 4,
  },
  adminBubble: {
    backgroundColor: '#757575', // Màu xám đậm cho admin
    borderBottomLeftRadius: 4,
  },
  staffBubble: {
    backgroundColor: '#B0B0B0', // Màu xám nhạt cho staff
    borderBottomLeftRadius: 4,
  },
  otherUserBubble: {
    backgroundColor: '#f0f0f0',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  currentUserText: {
    color: '#fff',
  },
  otherUserText: {
    color: '#333',
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  messageTime: {
    fontSize: 11,
    marginHorizontal: 4,
  },
  currentUserTime: {
    color: '#999',
    textAlign: 'right',
  },
  otherUserTime: {
    color: '#999',
    textAlign: 'left',
  },
});

export default MessageBubble;