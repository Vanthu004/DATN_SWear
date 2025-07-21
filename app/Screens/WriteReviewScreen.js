import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

export default function WriteReviewScreen({ navigation, route }) {
  const { userInfo } = useAuth();
  const { productId } = route.params;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = async () => {
    if (rating === 0 || comment.trim() === "") {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ đánh giá và điểm số");
      return;
    }

    try {
      const res = await api.post("/reviews", {
        user_id: userInfo._id,
        product_id: productId,
        rating,
        comment,
      });

      Alert.alert("Thành công", "Đánh giá đã được gửi");
      navigation.goBack();
    } catch (err) {
      console.error("Lỗi gửi đánh giá:", err);
      Alert.alert("Lỗi", "Không thể gửi đánh giá");
    }
  };

  const renderStars = () => (
    <View style={{ flexDirection: "row", marginBottom: 16 }}>
      {[1, 2, 3, 4, 5].map((value) => (
        <TouchableOpacity key={value} onPress={() => setRating(value)}>
          <Ionicons
            name={value <= rating ? "star" : "star-outline"}
            size={30}
            color="#FFD700"
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Viết đánh giá</Text>
      {renderStars()}
      <TextInput
        style={styles.input}
        multiline
        placeholder="Nhập đánh giá của bạn..."
        value={comment}
        onChangeText={setComment}
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Gửi đánh giá</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#fff", flex: 1 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  input: {
    height: 120,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "red",
    padding: 14,
    borderRadius: 30,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});