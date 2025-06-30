// Screens/WriteReviewScreen.js
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

export default function WriteReviewScreen({ navigation }) {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  const user_id = "60d5f8c8b1f9c70b3c4d8f8e";
  const product_id = "60d5f8c8b1f9c70b3c4d8f8f";

  const handleSubmit = async () => {
    if (rating === 0 || reviewText.trim() === "") {
      Alert.alert("Lỗi", "Vui lòng chọn số sao và nhập nội dung đánh giá.");
      return;
    }

    try {
      const res = await fetch("http://192.168.1.5:3000/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id,
          product_id,
          rating,
          comment: reviewText,
        }),
      });

      if (!res.ok) throw new Error("Gửi đánh giá thất bại");

      Alert.alert("Thành công", "Đánh giá của bạn đã được gửi!");
      navigation.goBack();
    } catch (err) {
      Alert.alert("Lỗi", err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What is your rate?</Text>
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((i) => (
          <TouchableOpacity key={i} onPress={() => setRating(i)}>
            <Ionicons
              name={i <= rating ? "star" : "star-outline"}
              size={32}
              color="#FFD700"
            />
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>
        Please share your opinion about the product
      </Text>
      <TextInput
        multiline
        placeholder="Your review"
        value={reviewText}
        onChangeText={setReviewText}
        style={styles.textInput}
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>SEND REVIEW</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#fff", flex: 1 },
  title: { fontSize: 18, fontWeight: "600", marginBottom: 16 },
  starContainer: { flexDirection: "row", marginBottom: 20 },
  label: { fontSize: 14, marginBottom: 6 },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    height: 100,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: "red",
    padding: 16,
    borderRadius: 30,
    alignItems: "center",
  },
  submitText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
