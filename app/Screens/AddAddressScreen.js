import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AddAddressScreen = ({ navigation, route }) => {
  const editAddress = route.params?.address;
  const isEditing = !!editAddress;

  const [formData, setFormData] = useState({
    type: editAddress?.type || "",
    address: editAddress?.address || "",
    note: editAddress?.note || "",
  });

  const handleSave = () => {
    // Here we would typically save to Redux/API
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Loại địa chỉ</Text>
          <TextInput
            style={styles.input}
            value={formData.type}
            onChangeText={(text) => setFormData({ ...formData, type: text })}
            placeholder="Nhà riêng, Văn phòng..."
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Địa chỉ</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
            placeholder="Nhập địa chỉ chi tiết"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Ghi chú</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.note}
            onChangeText={(text) => setFormData({ ...formData, note: text })}
            placeholder="Thêm ghi chú cho địa chỉ này"
            multiline
            numberOfLines={2}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>
          {isEditing ? "Cập nhật địa chỉ" : "Thêm địa chỉ"}
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
  textArea: {
    height: 100,
    textAlignVertical: "top",
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
