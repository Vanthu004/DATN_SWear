// app/components/chat/CreateChatModal.js
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const CreateChatModal = ({ visible, onClose, onCreateRoom }) => {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('general');
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    { key: 'product_inquiry', label: 'Hỏi về sản phẩm', icon: 'help-circle-outline' },
    { key: 'order_support', label: 'Hỗ trợ đơn hàng', icon: 'receipt-outline' },
    { key: 'complaint', label: 'Khiếu nại', icon: 'warning-outline' },
    { key: 'general', label: 'Tổng quát', icon: 'chatbubble-outline' },
  ];

  const handleCreate = async () => {
    if (!subject.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập chủ đề chat');
      return;
    }

    setIsLoading(true);
    try {
      await onCreateRoom({
        subject: subject.trim(),
        category,
        metadata: {}
      });
      
      // Reset form
      setSubject('');
      setCategory('general');
      onClose();
    } catch (error) {
      Alert.alert('Lỗi', error.message || 'Không thể tạo phòng chat');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setSubject('');
      setCategory('general');
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Tạo phòng chat mới</Text>
            <TouchableOpacity onPress={handleClose} disabled={isLoading}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}
            contentContainerStyle={styles.modalContentContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Chủ đề chat *</Text>
              <TextInput
                style={styles.textInput}
                value={subject}
                onChangeText={setSubject}
                placeholder="Ví dụ: Hỏi về sản phẩm áo thun..."
                placeholderTextColor="#999"
                maxLength={100}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Loại hỗ trợ</Text>
              <View style={styles.categoryContainer}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.key}
                    style={[
                      styles.categoryItem,
                      category === cat.key && styles.categoryItemSelected
                    ]}
                    onPress={() => setCategory(cat.key)}
                    disabled={isLoading}
                  >
                    <Ionicons
                      name={cat.icon}
                      size={20}
                      color={category === cat.key ? '#fff' : '#2196F3'}
                    />
                    <Text style={[
                      styles.categoryLabel,
                      category === cat.key && styles.categoryLabelSelected
                    ]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.cancelButton, isLoading && styles.disabledButton]}
              onPress={handleClose}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.createButton, isLoading && styles.disabledButton]}
              onPress={handleCreate}
              disabled={isLoading}
            >
              <Text style={styles.createButtonText}>
                {isLoading ? 'Đang tạo...' : 'Tạo phòng chat'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
      // CreateChatModal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '100%',
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f8f8f8',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2196F3',
    backgroundColor: '#fff',
    marginRight: 8,
    marginBottom: 8,
  },
  categoryItemSelected: {
    backgroundColor: '#2196F3',
  },
  categoryLabel: {
    fontSize: 13,
    color: '#2196F3',
    marginLeft: 6,
    fontWeight: '500',
  },
  categoryLabelSelected: {
    color: '#fff',
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  createButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2196F3',
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  modalContentContainer: {
  flexGrow: 1, // Đảm bảo nội dung trong ScrollView mở rộng để lấp đầy không gian
  paddingBottom: 20, // Thêm padding dưới để nội dung không bị dính sát đáy
},
});
export default CreateChatModal;