// app/components/chat/ChatRoomItem.js
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { chatUtils } from '../../services/chatService';

const ChatRoomItem = ({ room, onPress }) => {
  const statusColor = chatUtils.getStatusColor(room.status);
  const statusText = chatUtils.getStatusText(room.status);
  const categoryText = chatUtils.getCategoryText(room.category);

  return (
    <TouchableOpacity style={styles.roomContainer} onPress={() => onPress(room)}>
      <View style={styles.roomHeader}>
        <Text style={styles.roomSubject} numberOfLines={1}>
          {room.subject}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{statusText}</Text>
        </View>
      </View>
      
      <View style={styles.roomInfo}>
        <Text style={styles.categoryText}>{categoryText}</Text>
        <Text style={styles.timeText}>
          {chatUtils.formatMessageTime(room.lastMessageAt)}
        </Text>
      </View>
      
      {room.assignedStaff && (
        <View style={styles.staffInfo}>
          <Ionicons name="person-outline" size={14} color="#666" />
          <Text style={styles.staffText}>
            Được hỗ trợ bởi: {room.assignedStaff.name}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
    
  // ChatRoomItem styles
  roomContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roomSubject: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#fff',
  },
  roomInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 13,
    color: '#666',
  },
  timeText: {
    fontSize: 12,
    color: '#999',
  },
  staffInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  staffText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
});

export default ChatRoomItem;