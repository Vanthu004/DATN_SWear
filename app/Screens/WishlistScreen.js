import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const USER_ID = "684fff1dca202e28f58ddaf9";
const API_BASE = "http://192.168.52.106:3000/api";
const CARD_WIDTH = (Dimensions.get('window').width - 48) / 2;

export default function WishlistScreen() {
  const navigation = useNavigation();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await axios.get(`${API_BASE}/favorites/api/favorites/${USER_ID}`);
        setFavorites(res.data);
      } catch (err) {
        console.error("❌ Lỗi khi lấy favorite:", err.message);
        Alert.alert("Lỗi", "Không thể tải dữ liệu yêu thích");
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);
const handleRemoveFavorite = async (productId) => {
  try {
    await axios.delete(`${API_BASE}/favorites/api/favorites/${USER_ID}/${productId}`);
    // Sau khi xóa, cập nhật lại danh sách
    const updatedFavorites = favorites.filter(
      (item) => item.product_id._id !== productId
    );
    setFavorites(updatedFavorites);
  } catch (err) {
    console.error("❌ Lỗi khi xóa sản phẩm yêu thích:", err.message);
    Alert.alert("Lỗi", "Không thể xóa sản phẩm khỏi danh sách yêu thích");
  }
};

  const renderItem = ({ item }) => {
    const product = item.product_id;
    if (!product) return null;

    return (
      <View style={styles.card}>
        <Image source={{ uri: product.image_url }} style={styles.image} />
        <TouchableOpacity style={styles.heartIcon}
        onPress={() =>
  Alert.alert(
    "Xác nhận",
    "Bạn có chắc muốn xoá sản phẩm khỏi yêu thích?",
    [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Xoá",
        onPress: () => handleRemoveFavorite(product._id),
        style: "destructive",
      },
    ]
  )
}

        >
          <Ionicons name="heart" size={20} color="#f87171" />
        </TouchableOpacity>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>
          {product.price.toLocaleString('vi-VN')} VND
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={24} />
      </TouchableOpacity>
      <Text style={styles.title}>
        Sản phẩm Yêu thích ({favorites.length})
      </Text>
      <FlatList
        data={favorites}
        numColumns={2}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 40,
    backgroundColor: '#fff',
  },
  backBtn: {
    position: 'absolute',
    top: 40,
    left: 16,
    zIndex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 16,
  },
  list: {
    paddingBottom: 16,
  },
  card: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginBottom: 16,
    width: CARD_WIDTH,
    paddingBottom: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  heartIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 999,
    padding: 4,
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    paddingHorizontal: 8,
  },
  price: {
    fontSize: 13,
    color: '#6b7280',
    paddingHorizontal: 8,
    marginTop: 4,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
