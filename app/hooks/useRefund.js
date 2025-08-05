// hooks/useRefund.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import { Alert } from "react-native";
import { api } from "../utils/api";

export const useRefund = () => {
  const [loading, setLoading] = useState(false);

  const requestRefund = async ({ orderId, reason }) => {
    try {
      setLoading(true);
      const userData = await AsyncStorage.getItem("user");
      if (!userData) throw new Error("Không tìm thấy user trong AsyncStorage");

      const user = JSON.parse(userData);
      const payload = {
        orderId,
        userId: user._id,
        reason,
      };

      const res = await api.post("/refunds", payload);
      Alert.alert("Thành công", "Yêu cầu hoàn tiền đã được gửi");
      return res.data;
    } catch (error) {
      console.error("❌ Lỗi gửi yêu cầu hoàn tiền:", error);
      Alert.alert("Lỗi", error?.response?.data?.message || error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    requestRefund,
    loading,
  };
};
