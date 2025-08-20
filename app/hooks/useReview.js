import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { useAuth } from "../context/AuthContext"; // context đã dùng trong useCart
import { api } from "../utils/api"; // giữ import named; đã export trong api.js

export const useReview = (productId) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [reviewedProducts, setReviewedProducts] = useState([]);
  const { userInfo } = useAuth();

  const fetchReviews = async () => {
    if (!productId) return;
    try {
      setLoading(true);
      const res = await api.get(`/reviews/product/${productId}`);
      setReviews(res.data || []);
    } catch (error) {
      console.error("❌ Lỗi tải đánh giá:", error);
      Alert.alert("Lỗi", "Không thể tải đánh giá");
    } finally {
      setLoading(false);
    }
  };

  // Kiểm tra khả năng đánh giá sản phẩm
  const checkCanReview = async () => {
    if (!userInfo?._id || !productId) {
      setCanReview(false);
      return;
    }

    try {
      // Lấy danh sách sản phẩm đã đánh giá của user
      const res = await api.get(`/reviews/user/${userInfo._id}`);
      const reviewedProductIds = res.data.map((r) => r.product_id);
      setReviewedProducts(reviewedProductIds);
      
      // Kiểm tra xem sản phẩm này đã được đánh giá chưa
      const hasReviewed = reviewedProductIds.includes(productId);
      setCanReview(!hasReviewed);
      
      console.log("🔍 Review check:", {
        productId,
        hasReviewed,
        canReview: !hasReviewed,
        reviewedProducts: reviewedProductIds
      });
    } catch (error) {
      console.error("❌ Lỗi kiểm tra khả năng đánh giá:", error);
      setCanReview(false);
    }
  };

  const addReview = async ({ rating, comment, product_variant_id = null, images = null }) => {
    if (!userInfo?._id) {
      Alert.alert("Lỗi", "Vui lòng đăng nhập để đánh giá");
      throw new Error("User not logged in");
    }

    if (!canReview) {
      Alert.alert("Lỗi", "Bạn đã đánh giá sản phẩm này hoặc không thể đánh giá");
      throw new Error("Cannot review this product");
    }

    try {
      const formData = new FormData();
      formData.append("product_id", String(productId));
      formData.append("user_id", String(userInfo._id));
      formData.append("rating", String(rating));
      formData.append("comment", comment || "");
      if (product_variant_id) {
        formData.append("product_variant_id", String(product_variant_id));
      }
      // Hỗ trợ 1 hoặc nhiều ảnh: nếu mảng -> 'images', nếu 1 ảnh -> 'image'
      if (images) {
        const imageArray = Array.isArray(images) ? images : [images];
        imageArray.forEach((img, idx) => {
          // img có thể là uri string hoặc đối tượng { uri, type, name }
          if (typeof img === 'string') {
            const fileName = img.split('/').pop() || `review_${Date.now()}_${idx}.jpg`;
            const ext = (fileName.split('.').pop() || 'jpg').toLowerCase();
            const type = `image/${ext}`;
            formData.append(imageArray.length > 1 ? 'images' : 'image', { uri: img, name: fileName, type });
          } else if (img && img.uri) {
            const fileName = img.name || img.uri.split('/').pop() || `review_${Date.now()}_${idx}.jpg`;
            const ext = (fileName.split('.').pop() || 'jpg').toLowerCase();
            const type = img.type || `image/${ext}`;
            formData.append(imageArray.length > 1 ? 'images' : 'image', { uri: img.uri, name: fileName, type });
          }
        });
      }

      console.log("📤 Gửi đánh giá:", {
        productId,
        userId: userInfo._id,
        rating,
        comment,
        product_variant_id
      });

      const res = await api.post("/reviews", formData);
      const created = res?.data || res;
      
      console.log("✅ Đánh giá thành công:", created);
      
      setReviews((prev) => [created, ...prev]);
      setCanReview(false); // Cập nhật trạng thái sau khi đánh giá thành công
      setReviewedProducts(prev => [...prev, productId]);
      
      return created;
    } catch (error) {
      console.error("❌ Lỗi thêm đánh giá:", error);
      const errorMessage = error?.response?.data?.message || "Không thể gửi đánh giá";
      Alert.alert("Lỗi", errorMessage);
      throw error;
    }
  };

  useEffect(() => {
    fetchReviews();
    checkCanReview();
  }, [productId, userInfo?._id]);

  const avgRating = reviews.length
    ? (
        reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
      ).toFixed(1)
    : "0.0";

  const getRatingStats = () => {
    const stats = [0, 0, 0, 0, 0];
    reviews.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) {
        stats[r.rating - 1]++;
      }
    });
    return stats;
  };

  return {
    reviews,
    loading,
    avgRating,
    ratingStats: getRatingStats(),
    addReview,
    refreshReviews: fetchReviews,
    canReview,
    reviewedProducts,
    checkCanReview,
  };
};
