import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
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

  useFocusEffect(
    useCallback(() => {
      const fetchFavorites = async () => {
        if (!userId) {
          console.warn("⚠️ Không có userId");
          setFavorites([]);
          setLoading(false);
          return;
        }

        console.log("🔍 Fetching favorites, userId:", userId);
        setLoading(true);

        try {
          const res = await getFavoritesByUser(userId);
          // console.log("📦 Full API response:", res);

          // Tùy vào cấu trúc res bạn có thể chỉnh lại đoạn dưới
          const favoriteList = Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res)
            ? res
            : [];

          console.log("✅ Dữ liệu yêu thích trả về:", favoriteList);
          if (!Array.isArray(favoriteList)) {
            console.warn("⚠️ Dữ liệu không phải mảng:", favoriteList);
            setFavorites([]);
          } else {
            setFavorites(favoriteList);
          }
        } catch (err) {
          console.error("❌ Lỗi khi lấy favorite:", err.message || err);
          Alert.alert("Lỗi", "Không thể tải dữ liệu yêu thích");
        } finally {
          setLoading(false);
        }
      };

      fetchFavorites();
    }, [userId])
  );

  const handleRemoveFavorite = (productId) => {
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc muốn xoá sản phẩm khỏi yêu thích?",
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Xoá",
          style: "destructive",
          onPress: async () => {
            try {
              await removeFavorite(userId, productId);
              setFavorites((prev) =>
                prev.filter((item) => item.product_id._id !== productId)
              );
              console.log("✅ Đã xoá sản phẩm yêu thích:", productId);
            } catch (err) {
              console.error("❌ Lỗi khi xóa yêu thích:", err.message || err);
              Alert.alert("Lỗi", "Không thể xoá sản phẩm khỏi danh sách yêu thích");
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => {
    const product = item?.product_id;
    if (!product) return null;

    const productData = {
      ...product,
      images: product.images?.length > 0 ? product.images : product.image_url ? [product.image_url] : [],
    };

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ProductDetail', { product: productData })}
      >
        <Image source={{ uri: product.image_url }} style={styles.image} />
        <TouchableOpacity
          style={styles.heartIcon}
          onPress={(e) => {
            e.stopPropagation?.();
            handleRemoveFavorite(product._id);
          }}
        >
          <Ionicons name="heart" size={20} color="#1e90ff" />
        </TouchableOpacity>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>{product.price?.toLocaleString('vi-VN')} ₫</Text>
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
      <Text style={styles.title}>Sản phẩm Yêu thích ({favorites.length})</Text>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={styles.list}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text>Chưa có sản phẩm yêu thích nào.</Text>
          </View>
        }
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
