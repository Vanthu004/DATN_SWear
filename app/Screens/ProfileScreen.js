//app/Screens/ProfileScreen.js
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useEffect } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";

const ProfileScreen = ({ navigation }) => {
  const { userInfo, logout, refreshUserData } = useAuth();

  // Debug logging
  useEffect(() => {

    console.log('ProfileScreen: Current userInfo:', userInfo);
    console.log('ProfileScreen: Avatar URL:', userInfo?.avatar_url);

  }, [userInfo]);

  // Refresh dữ liệu khi quay lại màn hình này
  useFocusEffect(
    React.useCallback(() => {
      // Refresh dữ liệu từ server khi vào màn hình
      const refreshData = async () => {
        //console.log('ProfileScreen focused, refreshing user data...');
        await refreshUserData();
      };
      
      refreshData();
    }, [])
  );

  const menuItems = [
    {
      id: 1,
      title: "Địa chỉ",
      icon: "location-outline",
      onPress: () => navigation.navigate("AddressList"),
    },
    { 
      id: 2, 
      title: "Đơn hàng", 
      icon: "cube-outline", 
      onPress: () => navigation.navigate("OrderHistory") 
    },
    {
      id: 3,
      title: "Đổi mật khẩu",
      icon: "lock-closed-outline",
      onPress: () => navigation.navigate("ChangePassword"),
    },
    {
      id: 4,
      title: "Yêu cầu hỗ trợ",
      icon: "card-outline",
      onPress: () => navigation.navigate("SupportScreen"),
    },
    { 
      id: 5, 
      title: "Điều khoản chính sách sử dụng ", 
      icon: "help-circle-outline", 
      onPress: () => navigation.navigate("Help"), 
    },
  ];

  const getGenderIcon = (gender) => {
    if (gender === 'male') return 'male';
    if (gender === 'female') return 'female';
    return 'male-female';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <View style={styles.customHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <View style={styles.backIconWrap}>
            <Ionicons name="arrow-back" size={22} color="#222" />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tài khoản</Text>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarContainer}>
          <Image
            key={userInfo?.avatar_url || "default"}
            source={
              userInfo?.avatar_url
                ? { uri: userInfo.avatar_url }
                : require("../../assets/images/default-avatar.png")
            }
            style={styles.avatar}
          />
        </View>

        <View style={styles.userInfoSection}>
          <View style={styles.infoLine}>
            <Text style={styles.name}>{userInfo?.name || "Người dùng"}</Text>
            {userInfo?.gender && (
              <Ionicons name={getGenderIcon(userInfo.gender)} size={18} color="#555" style={styles.genderIcon}/>
            )}
          </View>
          <View style={[styles.infoLine, { justifyContent: 'space-between' }]}>
            <Text style={styles.email}>{userInfo?.email}</Text>
            <TouchableOpacity onPress={() => navigation.navigate("EditProfile")}>
              <Text style={styles.editButtonText}>Chỉnh sửa</Text>
            </TouchableOpacity>
          </View>
          {userInfo?.phone_number && (
            <Text style={styles.phone}>{userInfo?.phone_number}</Text>
          )}
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item) => (
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

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() =>
            Alert.alert("Xác nhận", "Bạn có chắc muốn đăng xuất?", [
              { text: "Hủy", style: "cancel" },
              { text: "Đăng xuất", onPress: logout },
            ])
          }
        >
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F5F7",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  avatarContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  userInfoSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  infoLine: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 8,
  },
  genderIcon: {
    marginLeft: 8,
    marginBottom: 8,
  },
  email: {
    fontSize: 15,
    color: "#666",
  },
  phone: {
    fontSize: 15,
    color: "#666",
    marginTop: 8,
  },
  editButtonText: {
    color: "#007AFF",
    fontSize: 15,
    fontWeight: '500',
  },
  menuSection: {
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F5F7',
  },
  menuText: {
    fontSize: 16,
    color: "#333",
  },
  logoutButton: {
    marginTop: 40,
    alignItems: "center",
  },
  logoutText: {
    fontSize: 16,
    color: "#FF3B30",
    fontWeight: "500",
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

export default ProfileScreen;
