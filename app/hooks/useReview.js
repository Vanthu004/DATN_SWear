import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { useAuth } from "../context/AuthContext"; // context đã dùng trong useCart
import { api } from "../utils/api"; // file API đã có sẵn

export const useReview = (productId) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const { userInfo } = useAuth();

  const fetchReviews = async () => {
    if (!productId) return;
    try {
      setLoading(true);
      const res = await api.get("/reviews", {
        params: { product_id: productId },
      });
      setReviews(res.data || []);
    } catch (error) {
      console.error("❌ Lỗi tải đánh giá:", error);
      Alert.alert("Lỗi", "Không thể tải đánh giá");
    } finally {
      setLoading(false);
    }
  };

  const addReview = async ({ rating, comment }) => {
    try {
      const reviewData = {
        product_id: productId,
        user_id: userInfo?._id,
        rating,
        comment,
      };

      const res = await api.post("/reviews", reviewData);
      setReviews((prev) => [res.data, ...prev]);
      return res.data;
    } catch (error) {
      console.error("❌ Lỗi thêm đánh giá:", error);
      Alert.alert("Lỗi", "Không thể gửi đánh giá");
      throw error;
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

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
  };
};
