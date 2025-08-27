// WriteReviewScreen.js
import { Ionicons } from "@expo/vector-icons";
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
    Alert.alert(
      "Chọn ảnh",
      "Bạn muốn chụp ảnh mới hay chọn từ thư viện?",
      [
        {
          text: "Chụp ảnh",
          onPress: async () => {
            try {
              const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.7,
              });

              if (!result.canceled) {
                const updated = [...reviews];
                updated[index].image = result.assets[0].uri;
                setReviews(updated);
              }
            } catch (error) {
              console.error("Lỗi chụp ảnh:", error);
              Alert.alert("Lỗi", "Không thể chụp ảnh. Vui lòng thử lại");
            }
          },
        },
        {
          text: "Chọn từ thư viện",
          onPress: async () => {
            try {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.7,
              });

              if (!result.canceled) {
                const updated = [...reviews];
                updated[index].image = result.assets[0].uri;
                setReviews(updated);
              }
            } catch (error) {
              console.error("Lỗi chọn ảnh:", error);
              Alert.alert("Lỗi", "Không thể chọn ảnh. Vui lòng thử lại.");
            }
          },
        },
        {
          text: "Hủy",
          style: "cancel",
        },
      ]
    );
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
      for (const item of reviews) {
        let uploadId = null;
        
        // Upload ảnh trước nếu có
        if (item.image) {
          try {
            console.log("📤 Uploading image for review...");
            const fileName = item.image.split("/").pop() || `review_${Date.now()}.jpg`;
            const fileType = (fileName.split(".").pop() || 'jpg').toLowerCase();
            
            const imageFile = {
              uri: item.image,
              type: `image/${fileType}`,
              name: fileName,
            };
            
            console.log("📤 Image file to upload:", imageFile);
            
            const formData = new FormData();
            formData.append("image", imageFile);
            
            console.log("📤 FormData created:", formData);
            
            const uploadResponse = await api.post("/uploads/upload", formData);
            
            console.log("📤 Upload response:", uploadResponse.data);
            
            if (uploadResponse.data && uploadResponse.data._id) {
              uploadId = uploadResponse.data._id;
              console.log("✅ Image uploaded successfully, uploadId:", uploadId);
            } else {
              console.warn("⚠️ Upload response doesn't contain _id:", uploadResponse.data);
            }
          } catch (uploadError) {
            console.error("❌ Image upload failed:", uploadError);
            console.error("❌ Upload error details:", {
              message: uploadError.message,
              response: uploadError.response?.data,
              status: uploadError.response?.status
            });
            Alert.alert("Cảnh báo", "Không thể upload ảnh, nhưng vẫn sẽ gửi đánh giá");
          }
        }

        // Tạo đánh giá với uploadId nếu có
        const reviewData = {
          user_id: userInfo._id,
          product_id: item.product_id,
          rating: item.rating,
          comment: item.comment || "",
        };
        
        if (item.product_variant_id) {
          reviewData.product_variant_id = item.product_variant_id;
        }
        
        if (uploadId) {
          // Sử dụng upload_ids (số nhiều) để khớp với server
          reviewData.upload_ids = [uploadId];
          console.log("📤 Review will include upload_ids:", reviewData.upload_ids);
        }

        console.log("📤 Sending review data:", reviewData);
        const res = await api.post("/reviews", reviewData);
        
        if (!res.data) {
          throw new Error("Invalid review response");
        }
        
        console.log("✅ Review submitted successfully:", res.data);
      }

      Alert.alert("Thành công", "Đã gửi đánh giá");
      // Điều hướng về Home và yêu cầu refresh
      navigation.navigate('Home', { screen: 'HomeScreen', params: { refresh: Date.now() } });
    } catch (err) {
      console.error("❌ Review submission error:", err);
      const message = err?.response?.data?.message || "Không thể gửi đánh giá";
      Alert.alert("Lỗi", message);
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
              <View style={styles.imageContainer}>
                <Image source={{ uri: item.image }} style={styles.reviewImage} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => {
                    const updated = [...reviews];
                    updated[index].image = null;
                    setReviews(updated);
                  }}
                >
                  <Text style={styles.removeImageText}>✕</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              onPress={() => handlePickImage(index)}
              style={styles.cameraButton}
            >
              <Text style={styles.cameraText}>
                {item.image ? "📷 Thay đổi ảnh" : "📷 Thêm ảnh sản phẩm"}
              </Text>
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
  imageContainer: {
    position: "relative",
    marginTop: 10,
  },
  removeImageButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(255, 0, 0, 0.8)",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  removeImageText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
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
