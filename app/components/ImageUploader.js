import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useImageUpload } from '../hooks/useImageUpload';

const ImageUploader = ({
  currentImage,
  onImageSelected,
  onImageUploaded,
  relatedModel = null,
  relatedId = null,
  style = {},
  imageStyle = {},
  placeholder = require('../../assets/images/default-avatar.png'),
  showUploadButton = true,
  uploadButtonText = "Thay đổi ảnh",
  disabled = false,
}) => {
  const { isUploading, showImagePickerOptions, uploadImageFile } = useImageUpload();
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const handleImagePicker = async () => {
    if (disabled) return;

    try {
      setUploadError(null);
      const imageAsset = await showImagePickerOptions();
      
      if (imageAsset) {
        setSelectedImage(imageAsset);
        
        // Callback khi chọn ảnh
        if (onImageSelected) {
          onImageSelected(imageAsset);
        }

        // Tự động upload nếu có callback onImageUploaded
        if (onImageUploaded) {
          try {
            const uploadResponse = await uploadImageFile(imageAsset, relatedModel, relatedId);
            onImageUploaded(uploadResponse);
          } catch (error) {
            setUploadError('Upload thất bại: ' + error.message);
            Alert.alert('Lỗi', 'Không thể upload ảnh. Vui lòng thử lại.');
          }
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      setUploadError('Không thể chọn ảnh: ' + error.message);
    }
  };

  const displayImage = selectedImage?.uri || currentImage;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.imageContainer}>
        <Image
          source={displayImage ? { uri: displayImage } : placeholder}
          style={[styles.image, imageStyle]}
          resizeMode="cover"
        />
        
        {isUploading && (
          <View style={styles.uploadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.uploadingText}>Đang upload...</Text>
          </View>
        )}

        {uploadError && (
          <View style={styles.errorOverlay}>
            <Ionicons name="alert-circle" size={24} color="#ff4444" />
            <Text style={styles.errorText}>Lỗi upload</Text>
          </View>
        )}

        {showUploadButton && (
          <TouchableOpacity
            style={[styles.uploadButton, disabled && styles.uploadButtonDisabled]}
            onPress={handleImagePicker}
            disabled={disabled || isUploading}
          >
            <Ionicons name="camera" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {showUploadButton && (
        <TouchableOpacity
          style={[styles.changeButton, disabled && styles.changeButtonDisabled]}
          onPress={handleImagePicker}
          disabled={disabled || isUploading}
        >
          <Text style={[styles.changeButtonText, disabled && styles.changeButtonTextDisabled]}>
            {isUploading ? "Đang upload..." : uploadButtonText}
          </Text>
        </TouchableOpacity>
      )}

      {uploadError && (
        <Text style={styles.errorMessage}>{uploadError}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 5,
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 68, 68, 0.8)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 5,
  },
  uploadButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  uploadButtonDisabled: {
    backgroundColor: '#ccc',
  },
  changeButton: {
    padding: 8,
  },
  changeButtonDisabled: {
    opacity: 0.5,
  },
  changeButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  changeButtonTextDisabled: {
    color: '#ccc',
  },
  errorMessage: {
    color: '#ff4444',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },
});

export default ImageUploader; 