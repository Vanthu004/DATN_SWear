// app/Screens/PolicyScreen.js
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { SafeAreaView } from "react-native-safe-area-context";

const PolicyScreen = () => {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.container}>
       <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chính sách người dùng</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Chính sách người dùng</Text>
        </View>

        <Text style={styles.sectionTitle}>1. Thu thập thông tin</Text>
        <Text style={styles.paragraph}>
          Chúng tôi thu thập các thông tin cần thiết để cải thiện trải nghiệm người dùng, bao gồm tên, email, địa chỉ, và thông tin thiết bị.
        </Text>

        <Text style={styles.sectionTitle}>2. Mục đích sử dụng</Text>
        <Text style={styles.paragraph}>
          Thông tin được sử dụng để cung cấp dịch vụ tốt hơn, cá nhân hóa nội dung và liên hệ khi cần thiết.
        </Text>

        <Text style={styles.sectionTitle}>3. Chia sẻ dữ liệu</Text>
        <Text style={styles.paragraph}>
          Chúng tôi không chia sẻ thông tin người dùng cho bên thứ ba, ngoại trừ khi được sự đồng ý hoặc theo yêu cầu của pháp luật.
        </Text>

        <Text style={styles.sectionTitle}>4. Bảo mật</Text>
        <Text style={styles.paragraph}>
          Dữ liệu của bạn được lưu trữ và bảo vệ bởi các phương thức bảo mật tiên tiến. Tuy nhiên, không có hệ thống nào hoàn toàn an toàn khỏi các mối đe dọa mạng.
        </Text>

        <Text style={styles.sectionTitle}>5. Quyền của người dùng</Text>
        <Text style={styles.paragraph}>
          Bạn có quyền truy cập, chỉnh sửa hoặc yêu cầu xóa dữ liệu cá nhân bằng cách liên hệ với chúng tôi qua email.
        </Text>

        <Text style={styles.sectionTitle}>6. Cập nhật chính sách</Text>
        <Text style={styles.paragraph}>
          Chúng tôi có thể cập nhật chính sách này theo thời gian. Mọi thay đổi sẽ được thông báo trên ứng dụng.
        </Text>
        <View style={{ height: 32 }} />

      </ScrollView>
      
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F5F7",
     
  },
  content: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 16,
  },
  titleContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 4,
    color: "#333",
  },
  paragraph: {
    fontSize: 14,
    color: "#444",
    lineHeight: 22,
    marginBottom: 8,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
});

export default PolicyScreen;
