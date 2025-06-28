import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";

import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function RatingReviewsScreen({ navigation }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const product_id = "60d5f8c8b1f9c70b3c4d8f8f";

useFocusEffect(
  useCallback(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `http://192.168.1.5:3000/api/reviews?product_id=${product_id}`
        );
        const data = await res.json();
        setReviews(data);
      } catch (err) {
        console.error("Error loading reviews:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [])
);


  const renderStars = (count) => (
    <View style={{ flexDirection: "row", marginVertical: 4 }}>
      {[...Array(5)].map((_, i) => (
        <Ionicons
          key={i}
          name={i < count ? "star" : "star-outline"}
          size={16}
          color="#FFD700"
        />
      ))}
    </View>
  );

  const totalReviews = reviews.length;
  const avgRating =
    totalReviews === 0
      ? 0
      : (
          reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        ).toFixed(1);

  const ratingStats = [0, 0, 0, 0, 0];
  reviews.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) {
      ratingStats[r.rating - 1]++;
    }
  });

  const renderItem = ({ item: review }) => (
    <View style={styles.reviewCard}>
      <Image
        source={{
          uri: review.user_id?.avatar || "https://randomuser.me/api/portraits/lego/1.jpg",
        }}
        style={styles.avatar}
      />
      <View style={{ flex: 1 }}>
        <View style={styles.reviewTopRow}>
          <Text style={styles.name}>
            {review.user_id?.name || "Ẩn danh"}
          </Text>
          <Text style={styles.date}>
            {new Date(review.create_date).toLocaleDateString()}
          </Text>
        </View>
        {renderStars(review.rating)}
        <Text style={styles.comment}>{review.comment}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rating & Reviews</Text>

      <View style={styles.overview}>
        <Text style={styles.avgScore}>{avgRating}</Text>
        <View style={styles.starsRow}>
          {renderStars(Math.round(avgRating))}
        </View>
        <Text style={styles.totalReviews}>{totalReviews} ratings</Text>
      </View>

      <View style={{ marginBottom: 20 }}>
        {[5, 4, 3, 2, 1].map((star) => {
          const count = ratingStats[star - 1];
          const percent = totalReviews ? (count / totalReviews) * 100 : 0;
          return (
            <View key={star} style={styles.ratingRow}>
              <Text style={styles.starLabel}>{star}★</Text>
              <View style={styles.barBackground}>
                <View style={[styles.barFill, { width: `${percent}%` }]} />
              </View>
              <Text style={styles.countLabel}>{count}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.reviewHeader}>
        <Text style={styles.reviewCount}>{totalReviews} reviews</Text>
        <TouchableOpacity>
          <Text style={styles.photoFilter}>With photo</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="red" />
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("WriteReview")}
      >
        <Text style={styles.buttonText}>Write a review</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#fff", flex: 1 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 16 },

  overview: { alignItems: "center", marginBottom: 20 },
  avgScore: { fontSize: 36, fontWeight: "bold" },
  starsRow: { flexDirection: "row", marginTop: 6 },
  totalReviews: { color: "#777", fontSize: 14 },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  starLabel: { width: 30 },
  barBackground: {
    flex: 1,
    height: 8,
    backgroundColor: "#eee",
    borderRadius: 4,
    marginHorizontal: 8,
  },
  barFill: {
    height: 8,
    backgroundColor: "red",
    borderRadius: 4,
  },
  countLabel: { width: 30, textAlign: "right" },

  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    alignItems: "center",
  },
  reviewCount: { fontSize: 16, fontWeight: "600" },
  photoFilter: { fontSize: 14, color: "#666" },

  reviewCard: {
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    gap: 10,
  },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  name: { fontWeight: "600", fontSize: 14 },
  reviewTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  date: { fontSize: 12, color: "#888" },
  comment: { marginTop: 6, fontSize: 14, color: "#333" },

  button: {
    backgroundColor: "red",
    padding: 14,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 30,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
