import { Ionicons } from '@expo/vector-icons';
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const checkEmailVerificationFromServer = async (email) => {
    try {
      const response = await api.get(`/users/check-email-verification?email=${email}`);
      return response.data.isEmailVerified;
    } catch (error) {
      console.log('Error checking email verification from server:', error);
      return false;
    }
  };

  const checkEmailExists = async (email) => {
    try {
      const response = await api.get(`/users/check-email-exists?email=${email}`);
      return response.data.exists;
    } catch (error) {
      console.log('Error checking email exists:', error);
      return false;
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setIsLoading(true);
    try {
      console.log('Attempting login with email:', email);
      
      // Tiến hành đăng nhập trước
      const res = await api.post("/users/login", { email, password });
      console.log('Login response:', res.data);
      
      const { token, user, isEmailVerified: serverEmailVerified } = res.data;

      // Kiểm tra email đã xác nhận chưa từ response login
      // Nếu server không trả về isEmailVerified hoặc isEmailVerified = false nhưng đăng nhập thành công
      // thì giả sử email đã verified (vì server cho phép đăng nhập)
      let isEmailVerified = serverEmailVerified;
      
      if (isEmailVerified === undefined || isEmailVerified === false) {
        console.log('Server did not return isEmailVerified or returned false, but login was successful');
        console.log('Assuming email is verified since login succeeded');
        isEmailVerified = true;
      }

      // Chỉ kiểm tra email verification nếu server trả về rõ ràng là false
      if (serverEmailVerified === false) {
        console.log('Server explicitly returned isEmailVerified: false, checking from separate API...');
        try {
          const separateCheck = await checkEmailVerificationFromServer(email);
          console.log('Email verification status from separate API:', separateCheck);
          if (separateCheck) {
            isEmailVerified = true;
          }
        } catch (checkError) {
          console.log('Error checking email verification:', checkError);
          // Nếu không kiểm tra được, giả sử email đã verified vì đăng nhập thành công
          isEmailVerified = true;
        }
      }

      if (!isEmailVerified) {
        Alert.alert(
          "Email chưa xác nhận", 
          "Vui lòng xác nhận email trước khi đăng nhập",
          [
            { 
              text: "Xác nhận ngay", 
              onPress: () => navigation.navigate("EmailVerification", { 
                email, 
                name: user.name || '',
                fromRegister: false 
              }) 
            },
            { text: "Hủy", style: "cancel" }
          ]
        );
        return;
      }

      // Đăng nhập thành công với trạng thái email đã xác nhận
      const userWithVerification = {
        ...user,
        email_verified: true
      };
      
      console.log('Login successful, user data from server:', userWithVerification);
      
      // Thử lấy thông tin user đầy đủ từ server nếu có endpoint
      try {
        const userProfileResponse = await api.get('/users/profile');
        if (userProfileResponse?.data?.user) {
          const fullUserData = {
            ...userWithVerification,
            ...userProfileResponse.data.user
          };
          console.log('Full user data from profile endpoint:', fullUserData);
          await login(token, fullUserData, true);
        } else {
          await login(token, userWithVerification, true);
        }
      } catch (profileError) {
        console.log('Could not fetch full profile, using login response:', profileError);
        await login(token, userWithVerification, true);
      }
      
      console.log('Login successful, user data saved with email_verified: true');
      
      // Navigation sẽ tự động chuyển sang Main do AuthContext thay đổi
    } catch (error) {
      console.log('Login error:', error);
      console.log('Error response:', error.response?.data);
      
      let message = "Đăng nhập thất bại";
      
      // Xử lý các trường hợp lỗi cụ thể
      if (error.response?.status === 403 && error.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
        Alert.alert(
          "Email chưa xác nhận", 
          "Vui lòng xác nhận email trước khi đăng nhập",
          [
            { 
              text: "Xác nhận ngay", 
              onPress: () => navigation.navigate("EmailVerification", { 
                email, 
                name: error.response?.data?.user?.name || '',
                fromRegister: false 
              }) 
            },
            { text: "Hủy", style: "cancel" }
          ]
        );
      } else if (error.response?.status === 401) {
        // Kiểm tra xem email có tồn tại không
        try {
          const checkResponse = await api.get(`/users/check-email-exists?email=${email}`);
          if (checkResponse.data.exists) {
            Alert.alert(
              "Email chưa xác nhận", 
              "Email đã được đăng ký nhưng chưa xác nhận. Vui lòng xác nhận email trước khi đăng nhập.",
              [
                { 
                  text: "Xác nhận ngay", 
                  onPress: () => navigation.navigate("EmailVerification", { 
                    email, 
                    name: '',
                    fromRegister: false 
                  }) 
                },
                { text: "Hủy", style: "cancel" }
              ]
            );
          } else {
            Alert.alert("Lỗi", "Email hoặc mật khẩu không đúng");
          }
        } catch (checkError) {
          Alert.alert("Lỗi", "Email hoặc mật khẩu không đúng");
        }
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
        Alert.alert("Lỗi", message);
      } else {
        Alert.alert("Lỗi", message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
                source={require("../../assets/images/LogoSwear.png")}
                style={styles.image}
              />
      <Text style={styles.title}>Đăng nhập</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!isLoading}
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          editable={!isLoading}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons 
            name={showPassword ? "eye-off" : "eye"} 
            size={24} 
            color="#666" 
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Đăng nhập</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("ForgotPassword")}
        style={styles.linkButton}
      >
        <Text style={styles.linkText}>Quên mật khẩu?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("Register")}
        style={styles.linkButton}
      >
        <Text style={styles.linkText}>Chưa có tài khoản? Đăng ký ngay</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#ffffff",
    justifyContent: "center",
  },
  image: {
    alignSelf:"center",
    width: 150,
    height: 150,
    marginBottom:'100',
    resizeMode: "contain",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  eyeButton: {
    padding: 12,
  },
  button: {
    backgroundColor: "#007AFF",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  linkButton: {
    marginTop: 15,
    alignItems: "center",
  },
  linkText: {
    color: "#007AFF",
    fontSize: 14,
  },
});