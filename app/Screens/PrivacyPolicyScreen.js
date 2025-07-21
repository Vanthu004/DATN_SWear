// app/Screens/PolicyScreen.js
import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PolicyScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Chính sách người dùng</Text>

        <Text style={styles.sectionTitle}>1. Thu thập thông tin</Text>
        <Text style={styles.paragraph}>
          Chúng tôi thu thập thông tin cá nhân như tên, email, địa chỉ, số điện thoại để cung cấp dịch vụ tốt hơn và hỗ trợ người dùng.
        </Text>

        <Text style={styles.sectionTitle}>2. Sử dụng thông tin</Text>
        <Text style={styles.paragraph}>
          Thông tin người dùng được sử dụng để cải thiện trải nghiệm, xử lý đơn hàng, gửi thông báo và hỗ trợ khách hàng. Chúng tôi không chia sẻ thông tin với bên thứ ba nếu không có sự đồng ý.
        </Text>

        <Text style={styles.sectionTitle}>3. Bảo mật</Text>
        <Text style={styles.paragraph}>
          Dữ liệu người dùng được lưu trữ an toàn trên hệ thống máy chủ bảo mật. Chúng tôi áp dụng các biện pháp bảo mật phù hợp để ngăn chặn truy cập trái phép.
        </Text>

        <Text style={styles.sectionTitle}>4. Quyền truy cập và chỉnh sửa</Text>
        <Text style={styles.paragraph}>
          Người dùng có quyền truy cập, chỉnh sửa hoặc xóa thông tin cá nhân bất kỳ lúc nào thông qua trang cá nhân hoặc liên hệ với bộ phận hỗ trợ.
        </Text>

        <Text style={styles.sectionTitle}>5. Thay đổi chính sách</Text>
        <Text style={styles.paragraph}>
          Chúng tôi có thể cập nhật chính sách mà không cần thông báo trước. Người dùng nên kiểm tra định kỳ để nắm rõ các thay đổi mới nhất.
        </Text>

        <Text style={styles.sectionTitle}>6. Liên hệ</Text>
        <Text style={styles.paragraph}>
          Mọi thắc mắc hoặc yêu cầu liên quan đến chính sách có thể được gửi về email: support@example.com.
        </Text>
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
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#222",
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
});

export default PolicyScreen;
