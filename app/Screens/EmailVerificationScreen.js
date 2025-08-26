import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

const EmailVerificationScreen = ({ route, navigation }) => {
  const { email, name, fromRegister = false, tempToken } = route.params;
  const { login, updateEmailVerificationStatus } = useAuth();
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [resendCount, setResendCount] = useState(0);
  const [emailSent, setEmailSent] = useState(false);
  const [networkError, setNetworkError] = useState(false);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Chỉ tự động gửi email xác nhận khi vào từ Login (không phải từ Register)
  useEffect(() => {
    //console.log('EmailVerificationScreen mounted with email:', email, 'fromRegister:', fromRegister);
    // Không auto-send khi vào từ Register vì server đã gửi email rồi
    if (!fromRegister && !emailSent) {
      // Delay một chút để tránh gửi trùng với email từ server
      const timer = setTimeout(() => {
        handleResendOTP(true); // true = auto send
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleVerifyEmail = async () => {
    if (!otp) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã xác nhận');
      return;
    }

    if (otp.length !== 6) {
      Alert.alert('Lỗi', 'Mã xác nhận phải có 6 ký tự');
      return;
    }

    setIsLoading(true);
    try {
      //console.log('Verifying email with OTP:', otp);
      const response = await api.post('/users/verify-email', {
        email,
        otp,
      });

      //console.log('Verify email response:', response.data);

      // Sau khi xác nhận thành công, luôn chuyển về Login
      Alert.alert(
        'Thành công', 
        'Email đã được xác nhận thành công! Vui lòng đăng nhập.',
        [
          { 
            text: 'Đăng nhập ngay', 
            onPress: () => {
              // Reset navigation stack để về Login
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            }
          }
        ]
      );
    } catch (error) {
      //console.log('Verification error:', error);
      //console.log('Error response:', error.response?.data);
      
      let message = 'Xác nhận email thất bại';
      
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }

      Alert.alert('Lỗi', message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async (isAutoSend = false) => {
    // Tạm thời comment out để tránh lỗi 404
    Alert.alert(
      'Thông báo', 
      'Tính năng gửi lại OTP đang được cập nhật. Vui lòng kiểm tra email hoặc liên hệ hỗ trợ.',
      [
        { text: 'Liên hệ hỗ trợ', onPress: () => navigation.navigate('EmailSupport', { email }) },
        { text: 'Hủy', style: 'cancel' }
      ]
    );
    return;

    // Code cũ đã comment out
    /*
    if (!isAutoSend && resendCount >= 3) {
      Alert.alert(
        'Giới hạn gửi lại', 
        'Bạn đã gửi lại mã quá nhiều lần. Vui lòng thử lại sau 10 phút hoặc liên hệ hỗ trợ.',
        [
          { text: 'Liên hệ hỗ trợ', onPress: () => navigation.navigate('EmailSupport', { email }) },
          { text: 'Hủy', style: 'cancel' }
        ]
      );
      return;
    }

    // Nếu đã gửi email rồi và đang auto-send, bỏ qua
    if (isAutoSend && emailSent) {
      console.log('Email already sent, skipping auto-send');
      return;
    }

    if (!isAutoSend) {
      setResendLoading(true);
    }

    try {
      console.log('Sending resend verification request for email:', email);
      // Thử các endpoint khác nhau cho resend verification
      let response;
      try {
        response = await api.post('/users/resend-verification', { email });
      } catch (firstError) {
        // Nếu endpoint đầu tiên không tồn tại, thử endpoint khác
        try {
          response = await api.post('/users/send-verification-email', { email });
        } catch (secondError) {
          // Nếu cả hai đều không tồn tại, thử endpoint đơn giản
          response = await api.post('/users/verify-email/resend', { email });
        }
      }
      
      console.log('Resend verification response:', response.data);
      
      if (!isAutoSend) {
        setResendCount(prev => prev + 1);
        Alert.alert('Thành công', 'Mã xác nhận đã được gửi lại vào email của bạn');
      } else {
        console.log('Auto-sent verification email successfully');
      }
      
      setEmailSent(true);
      setNetworkError(false);
      setTimeLeft(60);
    } catch (error) {
      console.log('Resend error:', error);
      console.log('Error response:', error.response?.data);
      
      let message = 'Gửi lại mã xác nhận thất bại';
      
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }

      if (!isAutoSend) {
        Alert.alert('Lỗi', message);
      } else {
        // Nếu auto send thất bại, hiển thị thông báo nhẹ nhàng
        console.log('Auto send failed:', message);
        setNetworkError(true);
      }
    } finally {
      if (!isAutoSend) {
        setResendLoading(false);
      }
    }
    */
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="mail-outline" size={80} color="#007AFF" />
        </View>

        <Text style={styles.title}>Xác nhận email</Text>
        <Text style={styles.subtitle}>
          {fromRegister 
            ? "Chúng tôi đã gửi mã xác nhận đến"
            : "Nhập mã xác nhận đã được gửi đến"
          }
        </Text>
        <Text style={styles.email}>{email}</Text>

        {!fromRegister && (
          <View style={styles.infoContainer}>
            <Ionicons name="information-circle-outline" size={16} color="#007AFF" />
            <Text style={styles.infoText}>Bạn có thể gửi lại mã nếu cần thiết</Text>
          </View>
        )}

        {networkError && (
          <View style={styles.errorContainer}>
            <Ionicons name="wifi-outline" size={16} color="#FF3B30" />
            <Text style={styles.errorText}>Không thể gửi email. Vui lòng thử lại.</Text>
          </View>
        )}

        <TextInput
          style={styles.input}
          placeholder="Nhập mã xác nhận 6 số"
          value={otp}
          onChangeText={setOtp}
          keyboardType="numeric"
          maxLength={6}
          editable={!isLoading}
        />

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleVerifyEmail}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Xác nhận</Text>
          )}
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Không nhận được mã xác nhận?</Text>
          
          {timeLeft > 0 ? (
            <View style={styles.timerContainer}>
              <Ionicons name="time-outline" size={16} color="#999" />
              <Text style={styles.timerText}>Gửi lại sau {formatTime(timeLeft)}</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.resendButtonContainer}
              onPress={() => handleResendOTP(false)}
              disabled={resendLoading}
            >
              {resendLoading ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <>
                  <Ionicons name="refresh-outline" size={16} color="#007AFF" />
                  <Text style={styles.resendButton}>Gửi lại mã</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {resendCount > 0 && (
            <Text style={styles.resendCount}>
              Đã gửi lại {resendCount}/3 lần
            </Text>
          )}

          {resendCount >= 3 && (
            <TouchableOpacity
              style={styles.supportButton}
              onPress={() => navigation.navigate('EmailSupport', { email })}
            >
              <Ionicons name="help-circle-outline" size={16} color="#FF9500" />
              <Text style={styles.supportButtonText}>Cần hỗ trợ?</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.helpContainer}>
          <Text style={styles.helpTitle}>Hướng dẫn:</Text>
          <Text style={styles.helpText}>• Kiểm tra hộp thư đến và thư mục spam</Text>
          <Text style={styles.helpText}>• Mã xác nhận có hiệu lực trong 10 phút</Text>
          <Text style={styles.helpText}>• Bạn có thể gửi lại tối đa 3 lần</Text>
        </View>
      </View>
    </View>
  );
};

export default EmailVerificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 40,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 24,
    backgroundColor: '#f9f9f9',
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 8,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  resendText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timerText: {
    fontSize: 14,
    color: '#999',
  },
  resendButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  resendButton: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  resendCount: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  helpContainer: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    marginBottom: 4,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
  },
  supportButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5F2FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 20,
    gap: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 20,
    gap: 6,
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    fontWeight: '500',
  },
}); 