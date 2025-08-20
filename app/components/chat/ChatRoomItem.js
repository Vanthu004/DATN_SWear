// app/components/chat/ChatRoomItem.js
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { chatUtils } from '../../services/chatService';

const ChatRoomItem = ({ room, onPress }) => {
  const statusColor = chatUtils.getStatusColor(room.status);
  const statusText = chatUtils.getStatusText(room.status);
  const categoryText = chatUtils.getCategoryText(room.category);
  const priorityText = chatUtils.getPriorityText(room.priority);
  const priorityColor = chatUtils.getPriorityColor(room.priority);

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'low':
        return 'arrow-down';
      case 'medium':
        return 'remove';
      case 'high':
        return 'arrow-up';
      case 'urgent':
        return 'flash';
      default:
        return 'remove';
    }
  };

  return (
    <TouchableOpacity style={styles.roomContainer} onPress={() => onPress(room)}>
      <View style={styles.roomHeader}>
        <Text style={styles.roomSubject} numberOfLines={1}>
          {room.subject}
        </Text>
        <View style={styles.badgesContainer}>
          {/* Priority Badge */}
          <View style={[styles.priorityBadge, { backgroundColor: priorityColor }]}>
            <Ionicons 
              name={getPriorityIcon(room.priority)} 
              size={10} 
              color="#fff" 
              style={{ marginRight: 2 }} 
            />
            <Text style={styles.priorityText}>{priorityText}</Text>
          </View>
          
          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{statusText}</Text>
          </View>
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
      
      {/* Priority indicator line */}
      <View style={[styles.priorityIndicator, { backgroundColor: priorityColor }]} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  roomContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    position: 'relative',
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  roomSubject: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  badgesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
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
  priorityIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
});

export default ChatRoomItem;