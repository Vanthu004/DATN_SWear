import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
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
import { useAuth } from '../context/AuthContext';
import { getFavoritesByUser, removeFavorite } from '../utils/api';

const CARD_WIDTH = (Dimensions.get('window').width - 48) / 2;

export default function WishlistScreen() {
  const navigation = useNavigation();
  const { userInfo } = useAuth();
  const userId = userInfo?._id;
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!userId) return;
      try {
        const data = await getFavoritesByUser(userId);
        setFavorites(data);
      } catch (err) {
        console.error("❌ Lỗi khi lấy favorite:", err.message);
        Alert.alert("Lỗi", "Không thể tải dữ liệu yêu thích");
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [userId]);

  const handleRemoveFavorite = async (productId) => {
    if (!userId) return;
    try {
      await removeFavorite(userId, productId);
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
      <TouchableOpacity style={styles.card} onPress={() => {
        // Đảm bảo luôn có images là mảng
        const productData = {
          ...product,
          images: product.images && product.images.length > 0
            ? product.images
            : product.image_url
              ? [product.image_url]
              : [],
        };
        navigation.navigate('ProductDetail', { product: productData });
      }}>
        <Image source={{ uri: product.image_url }} style={styles.image} />
        <TouchableOpacity style={styles.heartIcon}
          onPress={(e) => {
            e.stopPropagation && e.stopPropagation();
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
            );
          }}
        >
          <Ionicons name="heart" size={20} color="#1e90ff" />
        </TouchableOpacity>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>
          {product.price.toLocaleString('vi-VN')} VND
        </Text>
      </TouchableOpacity>
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
