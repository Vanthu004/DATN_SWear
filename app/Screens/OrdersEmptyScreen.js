import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Orders() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
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
        <Text style={styles.headerTitle}>Đơn hàng</Text>
      </View>

      <Image
        source={require("../../assets/images/empty-box.png")} // hình minh hoạ
        style={styles.image}
        resizeMode="contain"
      />

      <Text style={styles.message}>Chưa có Đơn hàng</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("ScreenName")} // chuyển đến màn hình danh mục
      >
        <Text style={styles.buttonText}>Khám phá các Danh mục</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
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
  image: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    color: "#333",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 100,
  },
  buttonText: {
    color: "white",
    fontWeight: "500",
  },
});
