import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import api from "../utils/api";

const ResetPasswordScreen = ({ route, navigation }) => {
  const { email } = route.params; // lấy email được truyền từ ForgotPassword
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (password) => {
    // Ít nhất 6 ký tự, có chữ hoa, chữ thường và số
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/;
    return passwordRegex.test(password);
  };

  const handleResetPassword = async () => {
    if (!otp || !newPassword || !confirmPassword) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp");
      return;
    }

    if (!validatePassword(newPassword)) {
      Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường và số");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/users/reset-password", {
        email,
        otp,
        newPassword,
      });

      Alert.alert("Thành công", "Mật khẩu đã được đặt lại", [
        { text: "Đăng nhập", onPress: () => navigation.navigate("Login") },
      ]);
    } catch (error) {
      const msg = error.response?.data?.message || "Cập nhật mật khẩu thất bại";
      Alert.alert("Lỗi", msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đặt lại mật khẩu</Text>
      <Text style={styles.subtitle}>Nhập mã OTP đã được gửi đến {email}</Text>

      <TextInput
        placeholder="Mã OTP"
        style={styles.input}
        keyboardType="numeric"
        value={otp}
        onChangeText={setOtp}
        maxLength={6}
        editable={!isLoading}
      />

      <TextInput
        placeholder="Mật khẩu mới"
        style={styles.input}
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
        editable={!isLoading}
      />

      <TextInput
        placeholder="Xác nhận mật khẩu mới"
        style={styles.input}
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        editable={!isLoading}
      />

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleResetPassword}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Xác nhận</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default ResetPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
  },
  button: {
    backgroundColor: "#007AFF",
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
