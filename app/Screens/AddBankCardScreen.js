import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AddBankCardScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    cardNumber: "",
    bankName: "",
  });

  const handleSave = () => {
    // Here we would typically save to Redux/API
    navigation.goBack();
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
        <Text style={styles.headerTitle}>Thêm thẻ</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.disclaimerSection}>
          <Text style={styles.disclaimerTitle}>
            1. Vui lòng đảm bảo tính chính xác của các thông tin đã cung cấp.
          </Text>
          <Text style={styles.disclaimerText}>
            2. Để bảo mật tài khoản của bạn, Chúng tôi sẽ tự động bỏ đi các
            thông tin nhạy cảm trước khi hiển thị số thẻ của bạn. Những thực đơn
            và việc mua sắm khoản đó sẽu bạn gửi cho chúng tôi sẽ được bảo mật
            và chỉ được sử dụng cho mục đích của tài đó được. Nếu bạn không muốn
            những thẻ của bạn được lưu trữ, thì khoản ngân hàng này đính kèm sẽ
            được xóa khỏi phần thanh toán khoản ngân hàng số của mình khác.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              value={formData.fullName}
              onChangeText={(text) =>
                setFormData({ ...formData, fullName: text })
              }
              placeholder="Họ và Tên"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              value={formData.cardNumber}
              onChangeText={(text) =>
                setFormData({ ...formData, cardNumber: text })
              }
              placeholder="Số CCCD/Căn cước (gắn chip)"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              value={formData.bankName}
              onChangeText={(text) =>
                setFormData({ ...formData, bankName: text })
              }
              placeholder="Ngân hàng"
              placeholderTextColor="#999"
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            (!formData.fullName ||
              !formData.cardNumber ||
              !formData.bankName) &&
              styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={
            !formData.fullName || !formData.cardNumber || !formData.bankName
          }
        >
          <Text
            style={[
              styles.saveButtonText,
              (!formData.fullName ||
                !formData.cardNumber ||
                !formData.bankName) &&
                styles.saveButtonTextDisabled,
            ]}
          >
            Lưu
          </Text>
        </TouchableOpacity>
      </View>
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
  scrollView: {
    flex: 1,
  },
  disclaimerSection: {
    padding: 16,
  },
  disclaimerTitle: {
    fontSize: 14,
    color: "#000",
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#F8F8F8",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
  },
  saveButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#E8E8E8",
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButtonTextDisabled: {
    color: "#999",
  },
});

export default AddBankCardScreen;
