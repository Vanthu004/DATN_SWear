import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from "react";
import {
    Alert,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const EditProfileScreen = ({ navigation, route }) => {
  const { userInfo, updateUserInfo } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "male", // male, female, other
    avatar: null,
  });
  const [newAvatar, setNewAvatar] = useState(null); // Lưu thông tin ảnh mới để upload
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Khởi tạo form data từ userInfo
    if (userInfo) {
      setFormData({
        name: userInfo.name || "",
        email: userInfo.email || "",
        phone: userInfo.phone_number || "",
        gender: userInfo.gender || "male",
        avatar: userInfo.avata_url || null,
      });
    }
  }, [userInfo]);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền truy cập', 'Cần quyền truy cập thư viện ảnh để chọn ảnh');
      return false;
    }
    return true;
  };

  const requestCameraPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền truy cập', 'Cần quyền truy cập camera để chụp ảnh');
      return false;
    }
    return true;
  };

  const pickImageFromLibrary = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const imageAsset = result.assets[0];
      setFormData({ ...formData, avatar: imageAsset.uri });
      setNewAvatar(imageAsset); // Lưu object ảnh đầy đủ
    }
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const imageAsset = result.assets[0];
      setFormData({ ...formData, avatar: imageAsset.uri });
      setNewAvatar(imageAsset); // Lưu object ảnh đầy đủ
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      "Chọn ảnh đại diện",
      "Bạn muốn chụp ảnh mới hay chọn từ thư viện?",
      [
        { text: "Chụp ảnh", onPress: takePhoto },
        { text: "Chọn từ thư viện", onPress: pickImageFromLibrary },
        { text: "Hủy", style: "cancel" }
      ]
    );
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập họ và tên");
      return;
    }

    if (!formData.email.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập email");
      return;
    }

    setIsLoading(true);
    try {
      let response;
      
      if (newAvatar) {
        // Nếu có ảnh mới, sử dụng FormData
        const dataToUpload = new FormData();
        dataToUpload.append('name', formData.name.trim());
        dataToUpload.append('email', formData.email.trim());
        dataToUpload.append('phone_number', formData.phone.trim());
        dataToUpload.append('gender', formData.gender);
        
        const uriParts = newAvatar.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        dataToUpload.append('avata_url', {
          uri: newAvatar.uri,
          name: `photo.${fileType}`,
          type: `image/${fileType}`,
        });
        
        console.log('Uploading with avatar...');
        response = await api.put('/update-profile', dataToUpload, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // Nếu không có ảnh mới, sử dụng JSON
        const updateData = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone_number: formData.phone.trim(),
          gender: formData.gender,
        };
        
        console.log('Uploading without avatar...');
        response = await api.put('/update-profile', updateData);
      }
      
      console.log('Server response:', response.data);

      if (response.data && response.data.user) {
        // Cập nhật userInfo trong context sau khi update thành công
        await updateUserInfo(response.data.user);
        Alert.alert("Thành công", "Thông tin đã được cập nhật.", [
          { text: "OK", onPress: () => navigation.goBack() }
        ]);
      } else {
        // Nếu server không trả về user, coi như có lỗi
        throw new Error("Server response did not contain user data.");
      }
    } catch (error) {
      console.error('Update profile failed:', error.response ? error.response.data : error.message);
      Alert.alert("Lỗi", "Cập nhật thông tin thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <View style={styles.customHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <View style={styles.backIconWrap}>
            <Ionicons name="arrow-back" size={22} color="#222" />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chỉnh sửa thông tin</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.avatarSection}>
          <Image
            source={
              formData.avatar
                ? { uri: formData.avatar }
                : require("../../assets/images/default-avatar.png")
            }
            style={styles.avatar}
          />
          <TouchableOpacity 
            style={styles.changeAvatarButton}
            onPress={showImagePickerOptions}
          >
            <Text style={styles.changeAvatarText}>Thay đổi ảnh đại diện</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Họ và tên *</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="Nhập họ và tên"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            placeholder="Nhập email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Số điện thoại</Text>
          <TextInput
            style={styles.input}
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            placeholder="Nhập số điện thoại"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Giới tính</Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[
                styles.radioButton,
                formData.gender === 'male' && styles.radioButtonSelected
              ]}
              onPress={() => setFormData({ ...formData, gender: 'male' })}
            >
              <View style={[
                styles.radioCircle,
                formData.gender === 'male' && styles.radioCircleSelected
              ]}>
                {formData.gender === 'male' && <View style={styles.radioInner} />}
              </View>
              <Text style={[
                styles.radioText,
                formData.gender === 'male' && styles.radioTextSelected
              ]}>Nam</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.radioButton,
                formData.gender === 'female' && styles.radioButtonSelected
              ]}
              onPress={() => setFormData({ ...formData, gender: 'female' })}
            >
              <View style={[
                styles.radioCircle,
                formData.gender === 'female' && styles.radioCircleSelected
              ]}>
                {formData.gender === 'female' && <View style={styles.radioInner} />}
              </View>
              <Text style={[
                styles.radioText,
                formData.gender === 'female' && styles.radioTextSelected
              ]}>Nữ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.radioButton,
                formData.gender === 'other' && styles.radioButtonSelected
              ]}
              onPress={() => setFormData({ ...formData, gender: 'other' })}
            >
              <View style={[
                styles.radioCircle,
                formData.gender === 'other' && styles.radioCircleSelected
              ]}>
                {formData.gender === 'other' && <View style={styles.radioInner} />}
              </View>
              <Text style={[
                styles.radioText,
                formData.gender === 'other' && styles.radioTextSelected
              ]}>Khác</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.saveButton, isLoading && styles.saveButtonDisabled]} 
        onPress={handleSave}
        disabled={isLoading}
      >
        <Text style={styles.saveButtonText}>
          {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  form: {
    padding: 15,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  changeAvatarButton: {
    padding: 8,
  },
  changeAvatarText: {
    color: "#007AFF",
    fontSize: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f8f8f8",
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
    flex: 1,
    marginHorizontal: 4,
  },
  radioButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#E5F2FF',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: '#007AFF',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },
  radioText: {
    fontSize: 14,
    color: '#666',
  },
  radioTextSelected: {
    color: '#007AFF',
    fontWeight: '500',
  },
  saveButton: {
    margin: 15,
    padding: 15,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#ccc",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  customHeader: {
    height: 64,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    position: "relative",
    marginBottom: 8,
    paddingTop: 24,
  },
  backBtn: {
    position: "absolute",
    left: 16,
    top: 24,
    zIndex: 2,
  },
  backIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F6F6F6",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
  },
});

export default EditProfileScreen;
