import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ProfileScreen = ({ navigation }) => {
  const userInfo = {
    name: "Nguyễn Văn Quân",
    email: "vanquan001@gmail.com",
    phone: "0963256277",
  };

  const menuItems = [
    {
      id: 1,
      title: "Địa chỉ",
      onPress: () => navigation.navigate("AddressList"),
    },
    { id: 2, title: "Sản phẩm yêu thích", onPress: () => {} },
    {
      id: 3,
      title: "Thanh toán",
      onPress: () => navigation.navigate("Payment"),
    },
    { id: 4, title: "Đơn hàng", onPress: () => {} },
    { id: 5, title: "Trợ giúp", onPress: () => {} },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={require("../../assets/images/default-avatar.png")}
              style={styles.avatar}
            />
          </View>

          <View style={styles.userInfoContainer}>
            <Text style={styles.name}>{userInfo.name}</Text>
            <Text style={styles.email}>{userInfo.email}</Text>
            <Text style={styles.phone}>{userInfo.phone}</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("EditProfile")}
              style={styles.editButton}
            >
              <Text style={styles.editButtonText}>Chỉnh sửa</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <Text style={styles.menuText}>{item.title}</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={() => {}}>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    padding: 20,
    paddingBottom: 30,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f0f0f0",
  },
  userInfoContainer: {
    alignItems: "center",
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  email: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  phone: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  editButton: {
    paddingVertical: 6,
  },
  editButtonText: {
    color: "#007AFF",
    fontSize: 14,
  },
  menuSection: {
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    backgroundColor: "#f5f5f5",
    marginBottom: 1,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  menuText: {
    fontSize: 16,
    color: "#000",
  },
  chevron: {
    fontSize: 20,
    color: "#666",
  },
  logoutButton: {
    marginTop: 30,
    marginBottom: 20,
    marginHorizontal: 20,
    padding: 16,
    alignItems: "center",
    borderRadius: 8,
  },
  logoutText: {
    fontSize: 16,
    color: "#FF3B30",
  },
});

export default ProfileScreen;
