// app/components/chat/MessageBubble.js
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { chatUtils } from '../../services/chatService';

const MessageBubble = ({ message, isCurrentUser, onImagePress }) => {
  const isImage = message.type === 'image';
  
  return (
    <View style={[
      styles.messageContainer, 
      isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer
    ]}>
      {!isCurrentUser && (
        <View style={styles.senderInfo}>
          {message.sender_avatar ? (
            <Image source={{ uri: message.sender_avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.defaultAvatar]}>
              <Ionicons name="person" size={16} color="#666" />
            </View>
          )}
          <Text style={styles.senderName}>{message.sender_name}</Text>
        </View>
      )}
      
      <View style={[
        styles.messageBubble,
        isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble
      ]}>
        {isImage ? (
          <TouchableOpacity onPress={() => onImagePress?.(message.content)}>
            <Image source={{ uri: message.content }} style={styles.messageImage} />
          </TouchableOpacity>
        ) : (
          <Text style={[
            styles.messageText,
            isCurrentUser ? styles.currentUserText : styles.otherUserText
          ]}>
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
     // MessageBubble styles
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
