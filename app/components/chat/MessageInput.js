// app/components/chat/MessageInput.js
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

const MessageInput = ({ onSendMessage, onSendImage, disabled = false }) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = () => {
    if (message.trim() && !disabled && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleImagePick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Lỗi', 'Cần cấp quyền truy cập thư viện ảnh');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        setIsLoading(true);
        await onSendImage(result.assets[0].uri);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      setIsLoading(false);
      Alert.alert('Lỗi', 'Không thể chọn ảnh');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TouchableOpacity 
          style={styles.imageButton}
          onPress={handleImagePick}
          disabled={disabled || isLoading}
        >
          <Ionicons 
            name="image-outline" 
            size={24} 
            color={disabled ? "#ccc" : "#2196F3"} 
          />
        </TouchableOpacity>
        
        <TextInput
          style={[styles.textInput, disabled && styles.disabledInput]}
          value={message}
          onChangeText={setMessage}
          placeholder="Nhập tin nhắn..."
          placeholderTextColor="#999"
          multiline
          maxLength={1000}
          editable={!disabled && !isLoading}
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        
        <TouchableOpacity 
          style={[styles.sendButton, (!message.trim() || disabled || isLoading) && styles.disabledButton]}
          onPress={handleSend}
          disabled={!message.trim() || disabled || isLoading}
        >
          <Ionicons 
            name="send" 
            size={20} 
            color={(!message.trim() || disabled || isLoading) ? "#ccc" : "#fff"} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
      container: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 50,
    paddingBottom: 10 
  },
  imageButton: {
    padding: 8,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 16,
    backgroundColor: '#f8f8f8',
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
    color: '#999',
  },
  sendButton: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
});
export default MessageInput;