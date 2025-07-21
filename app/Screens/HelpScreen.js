import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const HelpScreen = ({ navigation }) => {
  const helpItems = [
    {
      id: 1,
      title: "Điều khoản sử dụng",
      onPress: () => navigation.navigate("Terms"),
    },
    {
      id: 2,
      title: "Chính sách người dùng",
      onPress: () => navigation.navigate("PrivacyPolicy"),
    },
    {
      id: 3,
      title: "Khóa tài khoản",
      onPress: () =>
        Alert.alert("Xác nhận", "Bạn có chắc muốn khóa tài khoản?", [
          { text: "Hủy", style: "cancel" },
          { text: "Khóa", onPress: () => {/* gọi API hoặc xử lý khóa */} },
        ]),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.menuSection}>
          {helpItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <Text style={styles.menuText}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={20} color="#bbb" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F5F7",
  },
  contentContainer: {
    paddingBottom: 40,
  },
  menuSection: {
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    marginTop: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F4F5F7",
  },
  menuText: {
    fontSize: 16,
    color: "#333",
  },
  customHeader: {
    height: 64,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    position: "relative",
    marginBottom: 8,
    paddingTop: 24,
  },
  backBtn: {
    position: "absolute",
    left: 16,
    top: 24,
    zIndex: 2,
  },
  backIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F6F6F6",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
  },
});

export default HelpScreen;
