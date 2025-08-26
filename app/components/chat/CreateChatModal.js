import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const CreateChatModal = ({ visible, onClose, onCreateRoom }) => {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('general');
  const [priority, setPriority] = useState('medium');
  const [isLoading, setIsLoading] = useState(false);

  // Định nghĩa categories với mức độ ưu tiên mặc định thực tế
  const categories = [
    {
      key: 'product_inquiry',
      label: 'Hỏi về sản phẩm',
      icon: 'help-circle-outline',
      defaultPriority: 'low',
      description: 'Thông tin sản phẩm, tư vấn mua hàng',
    },
    {
      key: 'order_support',
      label: 'Hỗ trợ đơn hàng',
      icon: 'receipt-outline',
      defaultPriority: 'high',
      description: 'Theo dõi, thay đổi, hủy đơn hàng',
    },
    {
      key: 'complaint',
      label: 'Khiếu nại/Phản ánh',
      icon: 'warning-outline',
      defaultPriority: 'high',
      description: 'Sản phẩm lỗi, dịch vụ không tốt',
    },
    {
      key: 'technical_support',
      label: 'Hỗ trợ kỹ thuật',
      icon: 'build-outline',
      defaultPriority: 'medium',
      description: 'Lỗi app, website, thanh toán',
    },
    {
      key: 'account_support',
      label: 'Hỗ trợ tài khoản',
      icon: 'person-outline',
      defaultPriority: 'medium',
      description: 'Đổi mật khẩu, cập nhật thông tin',
    },
    {
      key: 'general',
      label: 'Tổng quát/Khác',
      icon: 'chatbubble-outline',
      defaultPriority: 'low',
      description: 'Các vấn đề khác',
    },
  ];

  const priorities = [
    {
      key: 'low',
      label: 'Thấp',
      color: '#4CAF50',
      icon: 'arrow-down',
      description: 'Không khẩn cấp, xử lý trong 24-48h',
    },
    {
      key: 'medium',
      label: 'Trung bình',
      color: '#FF9800',
      icon: 'remove',
      description: 'Cần xử lý trong 4-12h',
    },
    {
      key: 'high',
      label: 'Cao',
      color: '#F44336',
      icon: 'arrow-up',
      description: 'Ưu tiên cao, xử lý trong 1-4h',
    }
  ];

  // Tự động cập nhật priority khi thay đổi category
  const handleCategoryChange = (categoryKey) => {
    setCategory(categoryKey);
    const selectedCategory = categories.find((cat) => cat.key === categoryKey);
    if (selectedCategory) {
      setPriority(selectedCategory.defaultPriority);
    }
  };

  
  const getPriorityColor = (priorityKey) => {
    const priorityItem = priorities.find((p) => p.key === priorityKey);
    return priorityItem ? priorityItem.color : '#FF9800';
  };

  const getPriorityIcon = (priorityKey) => {
    const priorityItem = priorities.find((p) => p.key === priorityKey);
    return priorityItem ? priorityItem.icon : 'remove';
  };

  const getPriorityDescription = (priorityKey) => {
    const priorityItem = priorities.find((p) => p.key === priorityKey);
    return priorityItem ? priorityItem.description : '';
  };

  const getSelectedCategory = () => {
    return categories.find((cat) => cat.key === category);
  };

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
        priority,
        metadata: {
          prioritySetAt: new Date().toISOString(),
          autoSetPriority: getSelectedCategory()?.defaultPriority === priority,
          categoryDescription: getSelectedCategory()?.description,
          priorityDescription: getPriorityDescription(priority),
        },
      });

      // Reset form sau khi thành công
      setSubject('');
      setCategory('general');
      setPriority('low');
    } catch (error) {
      console.error('Modal create error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setSubject('');
      setCategory('general');
      setPriority('low');
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

          <ScrollView
            style={styles.modalContent}
            contentContainerStyle={styles.modalContentContainer}
            showsVerticalScrollIndicator={true} // Hiển thị thanh cuộn để debug
          >
            {/* Subject Input */}
            <View style={[styles.inputGroup, styles.debugBorder]}>
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

            {/* Category Selection */}
            <View style={[styles.inputGroup, styles.debugBorder]}>
              <Text style={styles.inputLabel}>Loại hỗ trợ</Text>
              <Text style={styles.inputHint}>
                Chọn loại phù hợp để được hỗ trợ tốt nhất
              </Text>
              <View style={styles.categoryContainer}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.key}
                    style={[
                      styles.categoryItem,
                      category === cat.key && styles.categoryItemSelected,
                    ]}
                    onPress={() => handleCategoryChange(cat.key)}
                    disabled={isLoading}
                  >
                    <View style={styles.categoryHeader}>
                      <View style={styles.categoryLeft}>
                        <Ionicons
                          name={cat.icon}
                          size={20}
                          color={category === cat.key ? '#fff' : '#2196F3'}
                        />
                        <Text
                          style={[
                            styles.categoryLabel,
                            category === cat.key && styles.categoryLabelSelected,
                          ]}
                        >
                          {cat.label}
                        </Text>
                      </View>
                      {category === cat.key && (
                        <Ionicons name="checkmark-circle" size={20} color="#fff" />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.categoryDescription,
                        category === cat.key && styles.categoryDescriptionSelected,
                      ]}
                    >
                      {cat.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Priority Selection */}
            <View style={[styles.inputGroup, styles.debugBorder]}>
              <Text style={styles.inputLabel}>Mức độ ưu tiên</Text>
              <Text style={styles.inputHint}>
                Được chọn tự động, bạn có thể thay đổi nếu cần
              </Text>
              <View style={styles.priorityContainer}>
                {priorities.map((pri) => (
                  <TouchableOpacity
                    key={pri.key}
                    style={[
                      styles.priorityItem,
                      { borderColor: pri.color },
                      priority === pri.key && { backgroundColor: pri.color },
                    ]}
                    onPress={() => setPriority(pri.key)}
                    disabled={isLoading}
                  >
                    <View style={styles.priorityHeader}>
                      <Ionicons
                        name={pri.icon}
                        size={16}
                        color={priority === pri.key ? '#fff' : pri.color}
                      />
                      <Text
                        style={[
                          styles.priorityLabel,
                          { color: priority === pri.key ? '#fff' : pri.color },
                        ]}
                      >
                        {pri.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Priority Description */}
              {priority && (
                <View
                  style={[
                    styles.priorityDetailCard,
                    { borderLeftColor: getPriorityColor(priority) },
                  ]}
                >
                  <Text style={styles.priorityDetailText}>
                    {getPriorityDescription(priority)}
                  </Text>
                </View>
              )}
            </View>

            {/* Priority Info */}
            <View style={[styles.priorityInfo, styles.debugBorder]}>
              <Ionicons name="information-circle-outline" size={16} color="#666" />
              <Text style={styles.priorityInfoText}>
                Mức độ ưu tiên càng cao sẽ được xử lý càng sớm. Đội ngũ hỗ trợ sẽ ưu
                tiên phản hồi theo thứ tự: Khẩn cấp → Cao → Trung bình → Thấp.
              </Text>
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
              style={[
                styles.createButton,
                { backgroundColor: getPriorityColor(priority) },
                isLoading && styles.disabledButton,
              ]}
              onPress={handleCreate}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name={getPriorityIcon(priority)} size={16} color="#fff" />
                  <Text style={styles.createButtonText}>Tạo phòng chat</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 20,
    width: '90%',
    // Loại bỏ maxHeight để nội dung không bị cắt
    minHeight: '60%', // Đảm bảo modal đủ cao
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalContent: {
    flex: 1, // Đảm bảo ScrollView chiếm toàn bộ không gian còn lại
  },
  modalContentContainer: {
    padding: 20,
    paddingBottom: 20, // Thêm padding dưới để tránh nội dung bị cắt
    minHeight: 400, // Đảm bảo nội dung có chiều cao tối thiểu
  },
  inputGroup: {
    marginBottom: 20,
  },
  // debugBorder: {
  //   // Thêm viền để debug xem component có render không
  //   borderWidth: 1,
  //   borderColor: 'red',
  // },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  inputHint: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  categoryContainer: {
    gap: 8,
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#2196F3',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  categoryItemSelected: {
    backgroundColor: '#2196F3',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryLabel: {
    fontSize: 14,
    color: '#2196F3',
    marginLeft: 8,
    fontWeight: '500',
  },
  categoryLabelSelected: {
    color: '#fff',
  },
  categoryDescription: {
    fontSize: 12,
    color: '#666',
    marginLeft: 28,
    lineHeight: 16,
  },
  categoryDescriptionSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  priorityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priorityItem: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 2,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  priorityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  priorityDetailCard: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderLeftWidth: 3,
    marginTop: 8,
  },
  priorityDetailText: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
  },
  priorityInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: -8,
  },
  priorityInfoText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
    flex: 1,
    lineHeight: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  createButton: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  createButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default CreateChatModal;