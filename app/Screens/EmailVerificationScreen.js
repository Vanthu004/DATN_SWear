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
import api from '../utils/api';

const EmailVerificationScreen = ({ route, navigation }) => {
  const { email, name } = route.params;
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [resendCount, setResendCount] = useState(0);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

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
      await api.post('/verify-email', {
        email,
        otp,
      });

      navigation.navigate('EmailVerificationSuccess');
    } catch (error) {
      const message = error.response?.data?.message || 'Xác nhận email thất bại';
      Alert.alert('Lỗi', message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCount >= 3) {
      Alert.alert(
        'Giới hạn gửi lại', 
        'Bạn đã gửi lại mã quá nhiều lần. Vui lòng thử lại sau 10 phút hoặc liên hệ hỗ trợ.'
      );
      return;
    }

    setResendLoading(true);
    try {
      await api.post('/resend-verification', { email });
      setResendCount(prev => prev + 1);
      Alert.alert('Thành công', 'Mã xác nhận đã được gửi lại vào email của bạn');
      setTimeLeft(60);
    } catch (error) {
      const message = error.response?.data?.message || 'Gửi lại mã xác nhận thất bại';
      Alert.alert('Lỗi', message);
    } finally {
      setResendLoading(false);
    }
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
          Chúng tôi đã gửi mã xác nhận đến
        </Text>
        <Text style={styles.email}>{email}</Text>

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
              onPress={handleResendOTP}
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
}); 