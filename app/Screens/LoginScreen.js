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
import { api } from "../utils/api";

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
    //  console.log('Error checking email verification from server:', error);
      return false;
    }
  };

  const checkEmailExists = async (email) => {
    try {
      const response = await api.get(`/users/check-email-exists?email=${email}`);
      return response.data.exists;
    } catch (error) {
     // console.log('Error checking email exists:', error);
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
     // console.log('🔐 Đăng nhập với email:', email);
      const res = await api.post("/users/login", { email, password });
      const { token, user, isEmailVerified: serverEmailVerified } = res.data;

      let isEmailVerified = true;

      // Kiểm tra xác minh email nếu server trả về rõ ràng là chưa xác minh
      if (serverEmailVerified === false) {
      //  console.log("❗ Email chưa xác minh, kiểm tra lại từ API phụ...");
        try {
          const checkVerified = await checkEmailVerificationFromServer(email);
          isEmailVerified = checkVerified;
        } catch (e) {
       //   console.log("⚠️ Không thể xác minh email từ API phụ:", e.message);
          isEmailVerified = true; // giả sử email đã xác minh nếu API phụ lỗi
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

      // Gọi API lấy thông tin user chi tiết nếu có
      let fullUser = { ...user, email_verified: true };

      try {
        const profileRes = await api.get("/users/profile");
        if (profileRes?.data?.user) {
          fullUser = { ...fullUser, ...profileRes.data.user };
        }
      } catch (profileError) {
    //    console.log("⚠️ Không lấy được thông tin user profile:", profileError?.message);
      }

      await login(token, fullUser, true);

      // 🛒 Tạo giỏ hàng nếu chưa có
      try {
        const userId = user._id || user.id;
        const cartRes = await api.get(`/cart/user/${userId}`);

        if (!cartRes.data || !cartRes.data._id) {
          const createCartRes = await api.post("/cart", { user_id: userId });
          //console.log("🛒 Đã tạo giỏ hàng:", createCartRes.data);
        } else {
          //console.log("✅ Giỏ hàng đã tồn tại:", cartRes.data);
        }
      } catch (cartError) {
        if (cartError?.response?.status === 404) {
          try {
            const userId = user._id || user.id;
            const createCartRes = await api.post("/cart", { user_id: userId });

          //  console.log("🛒 Đã tạo giỏ hàng mới sau lỗi 404:", createCartRes.data);
          } catch (createErr) {
           // console.log("❌ Lỗi khi tạo giỏ hàng:", createErr?.response?.data || createErr.message);
          }
        } else {
         // console.log("❌ Lỗi kiểm tra giỏ hàng:", cartError?.response?.data || cartError.message);
        }
      }

    } catch (error) {
    //  console.log("❌ Lỗi đăng nhập:", error);
      const res = error.response;

      // 🛑 Trường hợp bị cấm đăng nhập (403 với lý do khóa)
      if (res?.status === 403 && res?.data?.message?.includes("bị khóa")) {
        Alert.alert("Tài khoản bị khóa", res.data.message);
        return;
      }

      // 🛑 Trường hợp chưa xác minh email
      if (res?.status === 403 && res?.data?.code === "EMAIL_NOT_VERIFIED") {
        Alert.alert(
          "Email chưa xác nhận",
          "Vui lòng xác nhận email trước khi đăng nhập",
          [
            {
              text: "Xác nhận ngay",
              onPress: () => navigation.navigate("EmailVerification", {
                email,
                name: res.data?.user?.name || '',
                fromRegister: false
              })
            },
            { text: "Hủy", style: "cancel" }
          ]
        );
        return;
      }

      // 🛑 Trường hợp sai tài khoản hoặc mật khẩu
      if (res?.status === 401) {
        try {
          const check = await api.get(`/users/check-email-exists?email=${email}`);
          if (check.data.exists) {
            Alert.alert(
              "Email chưa xác nhận",
              "Email đã đăng ký nhưng chưa xác nhận. Vui lòng xác nhận trước khi đăng nhập.",
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
        return;
      }

      // 🛑 Lỗi khác
      const fallbackMessage = res?.data?.message || "Đăng nhập thất bại";
      Alert.alert("Lỗi", fallbackMessage);
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
    alignSelf: "center",
    width: 150,
    height: 150,
    marginBottom: '100',
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