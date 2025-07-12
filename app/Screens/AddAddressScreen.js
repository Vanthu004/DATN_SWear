import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createAddress } from "../utils/api";
const AddAddressScreen = ({ navigation, route }) => {
  const editAddress = route.params?.address;
  const isEditing = !!editAddress;

  const [formData, setFormData] = useState({
    name: editAddress?.name || "",
    phone: editAddress?.phone || "",
    address: editAddress?.address || "",
    city: editAddress?.city || "",
    district: editAddress?.district || "",
    ward: editAddress?.ward || "",
  });

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.phone || !formData.address || !formData.city || !formData.district) {
        Alert.alert("Thiếu thông tin", "Vui lòng điền đầy đủ các trường bắt buộc.");
        return;
      }

      const addressPayload = {
        name: formData.name,
        phone: formData.phone,
        street: formData.address,
        ward: formData.ward,
        district: formData.district,
        province: formData.city,
        country: "Việt Nam",
        type: "home",
        is_default: true,
      };

      await createAddress(addressPayload);
      Alert.alert("Thành công", "Địa chỉ đã được lưu.");
      navigation.goBack();
    } catch (error) {
      console.error("Lỗi khi lưu địa chỉ:", error);
      Alert.alert("Lỗi", "Không thể lưu địa chỉ. Vui lòng thử lại.");
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
        <Text style={styles.headerTitle}>Thêm địa chỉ</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tên người nhận</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="Nhập tên người nhận"
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
          <Text style={styles.label}>Tên đường</Text>
          <TextInput
            style={styles.input}
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
            placeholder="Nhập tên đường"
            multiline
          />
        </View>

           <View style={styles.inputGroup}>
          <Text style={styles.label}>Phường/Xã</Text>
          <TextInput
            style={styles.input}
            value={formData.ward}
            onChangeText={(text) => setFormData({ ...formData, ward: text })}
            placeholder="Chọn phường/xã"
          />
        </View>

        <View style={styles.row}>

           <View style={[styles.inputGroup, { flex: 1 , marginRight: 10 }]}>
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

          <View style={[styles.inputGroup, { flex: 1}]}>
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

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Lưu địa chỉ</Text>
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
});

export default AddAddressScreen;
