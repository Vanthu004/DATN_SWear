import { Ionicons } from '@expo/vector-icons';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity
} from 'react-native';

const RegisterScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Nút quay lại */}
      <TouchableOpacity style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      {/* Tiêu đề */}
      <Text style={styles.title}>Tạo tài khoản</Text>

      {/* Form nhập liệu */}
      <TextInput style={styles.input} placeholder="Tên" placeholderTextColor="#999" />
      <TextInput style={styles.input} placeholder="Số điện thoại" placeholderTextColor="#999" keyboardType="phone-pad" />
      <TextInput style={styles.input} placeholder="Địa chỉ email" placeholderTextColor="#999" keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Mật khẩu" placeholderTextColor="#999" secureTextEntry />

      {/* Nút tiếp tục */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Tiếp tục</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  input: {
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F4F4F4',
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#000',
  },
  button: {
    height: 56,
    backgroundColor: '#007BFF',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
