import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createAddress, updateAddress } from "../utils/api";
const AddAddressScreen = ({ navigation, route }) => {
  const editAddress = route.params?.address;
  const isEdit = !!editAddress;

  const [formData, setFormData] = useState({
    name: editAddress?.name || "",
    phone: editAddress?.phone || "",
    address: editAddress?.street || "",
    city: editAddress?.province || "",
    district: editAddress?.district || "",
    ward: editAddress?.ward || "",
    type: editAddress?.type || "home",         //  Mặc định là "home"
    is_default: editAddress?.is_default || false, //  Mặc định là false
  });


  // Hàm xử lý lưu hoặc cập nhật địa chỉ

  const handleSave = async () => {
  try {
    const errors = [];

    // Kiểm tra các trường bắt buộc
    if (!formData.name) errors.push("Họ và tên không được để trống.");
    else if (formData.name.length < 3) errors.push("Họ và tên phải có ít nhất 3 ký tự.");

    if (!formData.phone) {
      errors.push("Số điện thoại không được để trống.");
    } else if (!/^(0|\+84)[0-9]{9}$/.test(formData.phone)) {
      errors.push("Số điện thoại không hợp lệ (ví dụ: 0987654321).");
    }

    if (!formData.address || formData.address.length < 5) {
      errors.push("Địa chỉ phải có ít nhất 5 ký tự.");
    }

    if (!formData.city) errors.push("Vui lòng chọn Tỉnh/Thành phố.");
    if (!formData.district) errors.push("Vui lòng chọn Quận/Huyện.");

    // Nếu có lỗi, hiển thị
    if (errors.length > 0) {
      Alert.alert("Lỗi nhập liệu", errors.join("\n"));
      return;
    }

    // Tạo payload
    const addressPayload = {
      name: formData.name,
      phone: formData.phone,
      street: formData.address,
      ward: formData.ward,
      district: formData.district,
      province: formData.city,
      country: "Việt Nam",
      type: formData.type,
      is_default: formData.is_default,
    };

    // Gọi API
    if (isEdit) {
      await updateAddress(editAddress._id, addressPayload);
      Alert.alert("Thành công", "Địa chỉ đã được cập nhật.");
    } else {
      await createAddress(addressPayload);
      Alert.alert("Thành công", "Địa chỉ đã được lưu.");
    }

    navigation.goBack();
  } catch (error) {
    console.error("Lỗi khi lưu/cập nhật địa chỉ:", error);
    Alert.alert("Lỗi", "Không thể lưu/cập nhật địa chỉ. Vui lòng thử lại.");
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
        <Text style={styles.headerTitle}>
          {isEdit ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ"}
        </Text>
      </View>

      {/* Bọc phần nội dung trong ScrollView để có thể cuộn */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.form}>

            {/* Tên người nhận */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tên người nhận</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Nhập tên người nhận"
              />
            </View>

            {/* Số điện thoại */}
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

            {/* Địa chỉ */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tên đường</Text>
              <TextInput
                style={styles.input}
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
                placeholder="Nhập tên đường"
                multiline
              />
            </View>

            {/* Phường/Xã */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phường/Xã</Text>
              <TextInput
                style={styles.input}
                value={formData.ward}
                onChangeText={(text) => setFormData({ ...formData, ward: text })}
                placeholder="Chọn phường/xã"
              />
            </View>


            {/* Quận/Huyện và Tỉnh/Thành phố */}
            <View style={styles.row}>

              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Quận/Huyện</Text>
                <TextInput
                  style={styles.input}
                  value={formData.district}
                  onChangeText={(text) =>
                    setFormData({ ...formData, district: text })
                  }
                  placeholder="Chọn quận/huyện"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Tỉnh/Thành phố</Text>
                <TextInput
                  style={styles.input}
                  value={formData.city}
                  onChangeText={(text) => setFormData({ ...formData, city: text })}
                  placeholder="Chọn tỉnh/thành phố"
                />
              </View>
            </View>


          </View>
          <View style={styles.form}>

            {/* Loại địa chỉ (type) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Loại địa chỉ</Text>
              <View style={styles.typeSelector}>
                {["home", "office", "other"].map((typeOption) => (
                  <TouchableOpacity
                    key={typeOption}
                    style={[
                      styles.typeOption,
                      formData.type === typeOption && styles.selectedType,
                    ]}
                    onPress={() => setFormData({ ...formData, type: typeOption })}
                  >
                    <Text
                      style={[
                        styles.typeText,
                        formData.type === typeOption && styles.selectedTypeText,
                      ]}
                    >
                      {typeOption === "home"
                        ? "Nhà riêng"
                        : typeOption === "office"
                          ? "Công ty"
                          : "Khác"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Checkbox Địa chỉ mặc định */}
            <View style={styles.inputGroup}>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() =>
                  setFormData((prev) => ({ ...prev, is_default: !prev.is_default }))
                }
              >
                <Ionicons
                  name={formData.is_default ? "checkbox" : "square-outline"}
                  size={22}
                  color="#007AFF"
                />
                <Text style={{ marginLeft: 10, fontSize: 16 }}>
                  Đặt làm địa chỉ mặc định
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {/* Nút tạo ở dưới */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>
          {isEdit ? "Cập nhật địa chỉ" : "Lưu địa chỉ"}
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
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backBtn: {
    padding: 5,
  },
  backIconWrap: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  form: {
    padding: 15,
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  saveButton: {
    margin: 15,
    padding: 15,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    alignItems: "center",
    
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  typeSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  typeOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#f2f2f2",
  },
  selectedType: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  typeText: {
    color: "#333",
  },
  selectedTypeText: {
    color: "#fff",
    fontWeight: "600",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  scrollContent: {
    paddingBottom: 100, // để tránh che nút phía dưới
  },


});

export default AddAddressScreen;
