import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const LoginScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng nhập</Text>

      <TextInput style={styles.input} placeholder="Địa chỉ email" />
      <TextInput style={styles.input} placeholder="Mật khẩu" secureTextEntry />

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Tiếp tục</Text>
      </TouchableOpacity>
      <Text style={styles.signupText}>
        Chưa có Tài khoản? <Text style={styles.signupLink}>Tạo ngay!</Text>
      </Text>

    <View style={styles.LoginButton}>
     {/* Google Button */}
      <TouchableOpacity style={styles.socialButton}>
        <Image source={require('../../assets/images/google.png')} style={styles.icon} />
        <Text style={styles.socialText}>Tiếp tục với Google</Text>
      </TouchableOpacity>

      {/* Facebook Button */}
      <TouchableOpacity style={styles.socialButton}>
        <Image source={require('../../assets/images/facebook.png')} style={styles.icon} />
        <Text style={styles.socialText}>Tiếp tục với Facebook</Text>
      </TouchableOpacity>
    </View>
 
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 50,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
  },
  button: {
    height: 48,
    backgroundColor: '#007bff',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupText: {
    textAlign: 'center',
    color: '#555',
    marginBottom: 16,
  },
  signupLink: {
    color: '#007bff',
    fontWeight: 'bold',
  },
  LoginButton:{
    marginTop:30,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    
  },
  socialText: {
    flex:1,
    textAlign:'center',
    fontSize: 16,
    color: '#333',
  },
  icon: {
    width: 24,
    height: 24,
  },
});
