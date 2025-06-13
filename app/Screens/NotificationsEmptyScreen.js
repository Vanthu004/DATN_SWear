// app/notifications.tsx
import { useNavigation } from "@react-navigation/native";
import { Image, Text, TouchableOpacity, View } from "react-native";

const Notifications = () => {
  const navigation = useNavigation();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "white",
        alignItems: "center",
        paddingTop: 60,
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: "500", marginBottom: 40 }}>
        Thông báo
      </Text>

      <Image
        source={require("../../assets/images/bell.png")} // hình chuông màu xanh
        style={{ width: 100, height: 100, marginBottom: 20 }}
        resizeMode="contain"
      />

      <Text style={{ fontSize: 16, color: "#333", marginBottom: 16 }}>
        Không có thông báo mới
      </Text>

      <TouchableOpacity
        onPress={() => navigation.navigate("ScreenName")} // hoặc màn hình phù hợp
        style={{
          backgroundColor: "#007bff",
          paddingVertical: 10,
          paddingHorizontal: 20,
          borderRadius: 100,
        }}
      >
        <Text style={{ color: "white", fontWeight: "500" }}>
          Khám phá Danh mục
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Notifications;
