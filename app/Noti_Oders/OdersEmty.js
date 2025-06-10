import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Orders() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Đơn hàng</Text>

      <Image
        source={require('../../assets/images/empty-box.png')} // hình minh hoạ
        style={styles.image}
        resizeMode="contain"
      />

      <Text style={styles.message}>Chưa có Đơn hàng</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/category')} // chuyển đến màn hình danh mục
      >
        <Text style={styles.buttonText}>Khám phá các Danh mục</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 40,
  },
  image: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 100,
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
  },
});
