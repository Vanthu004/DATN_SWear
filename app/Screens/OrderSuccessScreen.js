import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { ROUTES } from "../constants/routes";

const OrderSuccessScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { orderId } = route.params || {};

  useEffect(() => {
    //console.log("id đơn hàng.......",orderId);
    Toast.show({
      type: "success",
      text1: "Đặt hàng thành công!",
      text2: "Bạn sẽ nhận được Email xác nhận.",
      position: "top",
      visibilityTime: 2500,
    });
  }, []);

  return (
    <View style={styles.container}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.navigate(ROUTES.HOME)}
          activeOpacity={0.7}
        >
          <View style={styles.backIconWrap}>
            <Ionicons name="arrow-back" size={22} color="#222" />
          </View>
        </TouchableOpacity>
      {/* Top blue area with illustration */}
      <View style={styles.topBlue}>
        <Image
          source={require("../../assets/images/order-success.png")}
          style={styles.illustration}
          resizeMode="contain"
        />
      </View>
      {/* White card area */}
      <View style={styles.card}>
        <Text style={styles.title}>Đặt hàng{"\n"}Thành công!</Text>
        <TouchableOpacity
          style={styles.detailBtn}
          onPress={() => navigation.navigate(ROUTES.ORDER_DETAIL, { orderId })}
        >
          <Text style={styles.detailBtnText}>Xem chi tiết đơn hàng</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2196F3",
    justifyContent: "flex-end",
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
  topBlue: {
    flex: 1.2,
    backgroundColor: "#2196F3",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 0,
  },
  illustration: {
    width: 220,
    height: 180,
    marginBottom: -30,
  },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#222",
    textAlign: "center",
    marginBottom: 12,
    marginTop: 0,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 15,
    color: "#888",
    textAlign: "center",
    marginBottom: 32,
  },
  detailBtn: {
    backgroundColor: "#007BFF",
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 40,
    alignItems: "center",
    marginTop: 8,
    width: "100%",
  },
  detailBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default OrderSuccessScreen;
