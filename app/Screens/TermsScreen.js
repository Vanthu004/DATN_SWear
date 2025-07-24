// app/Screens/TermsScreen.js
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TermsScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Điều khoản sử dụng</Text>
        </View>

        <Text style={styles.sectionTitle}>1. Giới thiệu</Text>
        <Text style={styles.paragraph}>
          Bằng cách sử dụng ứng dụng này, bạn đồng ý với các điều khoản dưới đây. Nếu bạn không đồng ý với bất kỳ điều khoản nào, vui lòng ngừng sử dụng ứng dụng.
        </Text>

        <Text style={styles.sectionTitle}>2. Quyền và nghĩa vụ</Text>
        <Text style={styles.paragraph}>
          Người dùng có trách nhiệm cung cấp thông tin chính xác, không sử dụng ứng dụng vào mục đích vi phạm pháp luật. Chúng tôi có quyền tạm ngưng tài khoản vi phạm.
        </Text>

        <Text style={styles.sectionTitle}>3. Bảo mật</Text>
        <Text style={styles.paragraph}>
          Thông tin cá nhân của bạn được bảo mật và chỉ được sử dụng để nâng cao trải nghiệm người dùng. Chúng tôi không chia sẻ thông tin cho bên thứ ba nếu không có sự đồng ý.
        </Text>

        <Text style={styles.sectionTitle}>4. Thay đổi điều khoản</Text>
        <Text style={styles.paragraph}>
          Chúng tôi có thể cập nhật điều khoản này bất kỳ lúc nào. Việc tiếp tục sử dụng ứng dụng sau khi điều khoản được cập nhật đồng nghĩa với việc bạn chấp nhận các thay đổi đó.
        </Text>

        <Text style={styles.sectionTitle}>5. Liên hệ</Text>
        <Text style={styles.paragraph}>
          Mọi thắc mắc xin liên hệ chúng tôi qua email: support@example.com.
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
});

export default TermsScreen;
