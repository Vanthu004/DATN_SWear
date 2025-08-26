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
      const raw = res.data || [];
      const normalized = raw.map(r => {
        const images = Array.isArray(r.images) ? r.images :
          r.uploads ? r.uploads.map(u => u.url || u.path) :
          r.image_url ? [r.image_url] : [];
        return { ...r, images };
      });
      setReviews(normalized);
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
      // Upload ảnh trước nếu có
      let uploadIds = [];
      if (images) {
        const imageArray = Array.isArray(images) ? images : [images];
        for (const img of imageArray) {
          try {
            let imageUri, fileName, fileType;
            if (typeof img === 'string') {
              imageUri = img;
              fileName = img.split('/').pop() || `review_${Date.now()}.jpg`;
              fileType = (fileName.split('.').pop() || 'jpg').toLowerCase();
            } else if (img && img.uri) {
              imageUri = img.uri;
              fileName = img.name || img.uri.split('/').pop() || `review_${Date.now()}.jpg`;
              fileType = (img.type || `image/${(fileName.split('.').pop() || 'jpg').toLowerCase()}`).split('/')[1];
            } else {
              continue;
            }
            
            const imageFile = {
              uri: imageUri,
              type: `image/${fileType}`,
              name: fileName,
            };
            
            console.log("📤 Uploading image for review:", fileName);
            console.log("📤 Image file details:", imageFile);
            
            const formData = new FormData();
            formData.append("image", imageFile);
            
            console.log("📤 FormData created for upload");
            
            const uploadResponse = await api.post("/upload", formData);
            
            console.log("📤 Upload response:", uploadResponse.data);
            
            if (uploadResponse.data && uploadResponse.data._id) {
              uploadIds.push(uploadResponse.data._id);
              console.log("✅ Image uploaded successfully, uploadId:", uploadResponse.data._id);
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
            throw new Error("Không thể upload ảnh: " + uploadError.message);
          }
        }
      }

      console.log("📤 Gửi đánh giá:", {
        productId,
        userId: userInfo._id,
        rating,
        comment,
        product_variant_id
      });

      // Tạo đánh giá với uploadIds nếu có
      const reviewData = {
        user_id: userInfo._id,
        product_id: productId,
        rating: rating,
        comment: comment || "",
      };
      
      if (product_variant_id) {
        reviewData.product_variant_id = product_variant_id;
      }
      
      if (uploadIds.length > 0) {
        reviewData.upload_ids = uploadIds;
      }

      console.log("📤 Sending review data:", reviewData);
      const res = await api.post("/reviews", reviewData);
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
