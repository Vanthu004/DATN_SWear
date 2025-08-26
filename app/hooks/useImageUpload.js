import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert } from 'react-native';
import { uploadImage } from '../utils/api';

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const requestPermissions = async (type = 'library') => {
    if (type === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Quyền truy cập', 'Cần quyền truy cập camera để chụp ảnh');
        return false;
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Quyền truy cập', 'Cần quyền truy cập thư viện ảnh để chọn ảnh');
        return false;
      }
    }
    return true;
  };

  const pickImageFromLibrary = async (options = {}) => {
    const hasPermission = await requestPermissions('library');
    if (!hasPermission) return null;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      ...options,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      return result.assets[0];
    }
    return null;
  };

  const takePhoto = async (options = {}) => {
    const hasPermission = await requestPermissions('camera');
    if (!hasPermission) return null;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      ...options,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      return result.assets[0];
    }
    return null;
  };

  const showImagePickerOptions = async (options = {}) => {
    return new Promise((resolve) => {
      Alert.alert(
        "Chọn ảnh",
        "Bạn muốn chụp ảnh mới hay chọn từ thư viện?",
        [
          { 
            text: "Chụp ảnh", 
            onPress: async () => {
              const image = await takePhoto(options);
              resolve(image);
            }
          },
          { 
            text: "Chọn từ thư viện", 
            onPress: async () => {
              const image = await pickImageFromLibrary(options);
              resolve(image);
            }
          },
          { 
            text: "Hủy", 
            style: "cancel",
            onPress: () => resolve(null)
          }
        ]
      );
    });
  };

  const uploadImageFile = async (imageAsset, relatedModel = null, relatedId = null) => {
    if (!imageAsset) {
      throw new Error('No image provided');
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uriParts = imageAsset.uri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      
      const imageFile = {
        uri: imageAsset.uri,
        name: `avatar_${Date.now()}.${fileType}`,
        type: `image/${fileType}`,
      };

      //console.log('Uploading image file:', imageFile);
      const response = await uploadImage(imageFile, relatedModel, relatedId);
      //console.log('Upload response:', response);
      
      setUploadProgress(100);

      // Chuẩn hóa: backend trả về đối tượng upload với _id và url
      const upload = response?.upload || response;
      if (upload && upload._id) {
        return { upload };
      }
      throw new Error('Invalid upload response format');
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return {
    isUploading,
    uploadProgress,
    pickImageFromLibrary,
    takePhoto,
    showImagePickerOptions,
    uploadImageFile,
  };
}; 