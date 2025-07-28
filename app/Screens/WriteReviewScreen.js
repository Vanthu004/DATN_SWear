// WriteReviewScreen.js
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
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
  const { orderDetails, orderCode } = route.params;

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lấy các sản phẩm đã đánh giá
  useEffect(() => {
    const fetchReviewedProducts = async () => {
      try {
        const res = await api.get(`/reviews/user/${userInfo._id}`);
        const reviewedProductIds = res.data.map((r) => r.product_id);

        const filtered = orderDetails.filter(
          (item) => !reviewedProductIds.includes(item.product_id)
        );

        setReviews(
          filtered.map((item) => ({
            product_id: item.product_id,
            product_name: item.product_name,
            product_image: item.product_image,
            rating: 0,
            comment: "",
          }))
        );
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu đánh giá:", err);
        Alert.alert("Lỗi", "Không thể tải dữ liệu đánh giá");
      } finally {
        setLoading(false);
      }
    };

    fetchReviewedProducts();
  }, []);

  const handleRatingChange = (index, value) => {
    const updated = [...reviews];
    updated[index].rating = value;
    setReviews(updated);
  };

  const handleCommentChange = (index, text) => {
    const updated = [...reviews];
    updated[index].comment = text;
    setReviews(updated);
  };

const handleSubmit = async () => {
  const incomplete = reviews.find(
    (item) => item.rating === 0 || item.comment.trim() === ""
  );

  if (incomplete) {
    Alert.alert("Lỗi", "Vui lòng đánh giá và nhập bình luận cho tất cả sản phẩm.");
    return;
  }

  try {
    await Promise.all(
      reviews.map((item) =>
        api.post("/reviews", {
          user_id: userInfo._id,
          product_id: item.product_id,
          rating: item.rating,
          comment: item.comment,
        })
      )
    );
    Alert.alert("Thành công", "Đã gửi đánh giá");
    navigation.replace("OrderDetail", { orderCode }); // ✅ Quay lại chi tiết đơn
  } catch (err) {
    const message = err?.response?.data?.message;
    //console.error("Lỗi gửi đánh giá:", err);

    if (message === "Bạn đã đánh giá sản phẩm này rồi.") {
      Alert.alert("Thông báo", message);
    } else {
      Alert.alert("Lỗi", message || "Không thể gửi đánh giá");
    }
  }
};


  const renderStars = (rating, index) => (
    <View style={{ flexDirection: "row", marginVertical: 4 }}>
      {[1, 2, 3, 4, 5].map((value) => (
        <TouchableOpacity
          key={value}
          onPress={() => handleRatingChange(index, value)}
        >
          <Ionicons
            name={value <= rating ? "star" : "star-outline"}
            size={28}
            color="#FFD700"
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="red" />
      </View>
    );
  }

  if (reviews.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 16 }}>
          Bạn đã đánh giá tất cả sản phẩm trong đơn hàng {orderCode}.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đánh giá đơn hàng {orderCode}</Text>
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.product_id}
        renderItem={({ item, index }) => (
          <View style={styles.itemContainer}>
            <Image source={{ uri: item.product_image }} style={styles.image} />
            <Text style={styles.productName}>{item.product_name}</Text>
            {renderStars(item.rating, index)}
            <TextInput
              style={styles.input}
              placeholder="Nhập đánh giá..."
              multiline
              value={item.comment}
              onChangeText={(text) => handleCommentChange(index, text)}
            />
          </View>
        )}
        ListFooterComponent={
          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Gửi tất cả đánh giá</Text>
          </TouchableOpacity>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#fff", flex: 1 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  itemContainer: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingBottom: 10,
  },
  image: {
    width: 80,
    height: 80,
    resizeMode: "contain",
    borderRadius: 8,
    marginBottom: 6,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    textAlignVertical: "top",
    height: 80,
    marginTop: 6,
  },
  button: {
    backgroundColor: "red",
    padding: 14,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});
