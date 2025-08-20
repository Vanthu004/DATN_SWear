// WriteReviewScreen.js
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
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
import { api } from "../utils/api";

export default function WriteReviewScreen({ navigation, route }) {
  const { userInfo } = useAuth();
  const { orderDetails, orderCode, productId, product, isDirectReview } = route.params;

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviewedProducts = async () => {
      try {
        // Nếu là đánh giá trực tiếp từ trang chi tiết sản phẩm
        if (isDirectReview && productId && product) {
          setReviews([{
            product_id: productId,
            product_name: product.name || product.product_name,
            product_image: product.image_url || product.product_image,
            product_variant_id: null,
            variant_text: "",
            rating: 0,
            comment: "",
            image: null,
          }]);
          setLoading(false);
          return;
        }

        // Nếu là đánh giá từ đơn hàng
        if (orderDetails && orderDetails.length > 0) {
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
              product_variant_id: item.product_variant_id,
              // Gộp thông tin biến thể nếu có (vd: Size - Color)
              variant_text: [item.size, item.color].filter(Boolean).join(" - "),
              rating: 0,
              comment: "",
              image: null,
            }))
          );
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu đánh giá:", err);
        Alert.alert("Lỗi", "Không thể tải dữ liệu đánh giá");
      } finally {
        setLoading(false);
      }
    };

    fetchReviewedProducts();
  }, [isDirectReview, productId, product, orderDetails]);

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

  const handlePickImage = async (index) => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const updated = [...reviews];
      updated[index].image = result.assets[0].uri;
      setReviews(updated);
    }
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
      const token = await AsyncStorage.getItem("userToken");
      const baseURL = api?.defaults?.baseURL || "";
      for (const item of reviews) {
        const formData = new FormData();
        formData.append("user_id", String(userInfo._id));
        formData.append("product_id", String(item.product_id));
        formData.append("rating", String(item.rating));
        formData.append("comment", item.comment || "");
        if (item.product_variant_id) {
          formData.append("product_variant_id", String(item.product_variant_id));
        }

        if (item.image) {
          const fileName = item.image.split("/").pop();
          const fileType = fileName.split(".").pop();
          formData.append("image", {
            uri: item.image,
            type: `image/${fileType}`,
            name: fileName,
          });
        }

        // Sử dụng fetch để tránh lỗi Network Error với axios + RN khi upload multipart
        const res = await fetch(`${baseURL}/reviews`, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData?.message || `Upload failed with status ${res.status}`);
        }
      }

      Alert.alert("Thành công", "Đã gửi đánh giá");
      
      // Nếu là đánh giá trực tiếp, quay về trang chi tiết sản phẩm
      if (isDirectReview) {
        navigation.goBack();
      } else {
        navigation.replace("OrderDetail", { orderCode });
      }
    } catch (err) {
      const message = err?.response?.data?.message;
      Alert.alert("Lỗi", message || "Không thể gửi đánh giá");
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
          {isDirectReview 
            ? "Bạn đã đánh giá sản phẩm này."
            : `Bạn đã đánh giá tất cả sản phẩm trong đơn hàng ${orderCode}.`
          }
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isDirectReview 
          ? "Đánh giá sản phẩm"
          : `Đánh giá đơn hàng ${orderCode}`
        }
      </Text>
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.product_id}
        renderItem={({ item, index }) => (
          <View style={styles.itemContainer}>
            <Image source={{ uri: item.product_image }} style={styles.imageLarge} />
            <Text style={styles.productName}>{item.product_name}</Text>
            {!!item.variant_text && (
              <Text style={styles.variantText}>Phân loại: {item.variant_text}</Text>
            )}
            {renderStars(item.rating, index)}

            <TextInput
              style={styles.input}
              placeholder="Nhập đánh giá..."
              multiline
              value={item.comment}
              onChangeText={(text) => handleCommentChange(index, text)}
            />

            {item.image && (
              <Image source={{ uri: item.image }} style={styles.reviewImage} />
            )}

            <TouchableOpacity
              onPress={() => handlePickImage(index)}
              style={styles.cameraButton}
            >
              <Text style={styles.cameraText}>📷 Chụp ảnh sản phẩm thực tế</Text>
            </TouchableOpacity>
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
    marginBottom: 24,
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingBottom: 12,
  },
  imageLarge: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
    borderRadius: 12,
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
  reviewImage: {
    width: "100%",
    height: 160,
    resizeMode: "cover",
    borderRadius: 10,
    marginTop: 10,
  },
  cameraButton: {
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  cameraText: {
    color: "#333",
    fontWeight: "600",
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
