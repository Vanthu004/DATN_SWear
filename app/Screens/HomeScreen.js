import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect } from "react";
import {
    FlatList,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import ProductCard from "../components/ProductCard";
import { useAuth } from "../context/AuthContext";
import {
    fetchBestSellers,
    fetchCategories,
} from "../reudx/homeSlice";

const bannerImg = require("../../assets/sp1.png");
const defaultAvatar = require("../../assets/images/default-avatar.png");

export default function HomeScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { userInfo } = useAuth();
  const { categories, bestSellers, loading } = useSelector((state) => state.home);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchBestSellers());
  }, [dispatch]);

  // Hiển thị 5 danh mục đầu tiên
  const displayedCategories = categories.slice(0, 5);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Profile")}
          style={styles.avatarWrap}
        >
          <Image
            source={userInfo?.avata_url ? { uri: userInfo.avata_url } : defaultAvatar}
            style={styles.avatar}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cartBtn}
          onPress={() => navigation.navigate("Cart")}
        >
          <Ionicons name="cart-outline" size={26} color="#2979FF" />
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <TouchableOpacity
        style={styles.searchBar}
        activeOpacity={0.8}
        onPress={() => navigation.navigate("SearchSc")}
      >
        <Ionicons name="search" size={20} color="#888" style={{ marginRight: 8 }} />
        <Text style={{ color: "#888", fontSize: 16 }}>Tìm kiếm</Text>
      </TouchableOpacity>

      {/* Banner */}
      <View style={styles.bannerWrap}>
        <Image source={bannerImg} style={styles.bannerImg} resizeMode="cover" />
      </View>

      {/* Danh mục */}
      <View style={styles.categoryRow}>
        <Text style={styles.sectionTitle}>Danh mục</Text>
        <TouchableOpacity onPress={() => navigation.navigate("CategoryScreen")}
        >
          <Text style={styles.seeAll}>xem tất cả</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={displayedCategories}
        keyExtractor={(item) => item._id || item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 8, marginBottom: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.categoryItem}
            onPress={() => navigation.navigate("CategoryScreen", { category: item })}
          >
          <Image
                source={item.image_url ? { uri: item.image_url } : require("../../assets/images/box-icon.png")}
                style={styles.categoryIcon}
                />
            <Text style={styles.categoryName} numberOfLines={1}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Sản phẩm nổi bật */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Sản phẩm nổi bật</Text>
      </View>
      <FlatList
        data={bestSellers}
        keyExtractor={(item) => item._id || item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 12 }}
        renderItem={({ item }) => (
          <ProductCard product={item} navigation={navigation} />
        )}
        ListEmptyComponent={loading ? (
          <Text style={{ color: '#888', marginLeft: 16 }}>Đang tải...</Text>
        ) : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    marginBottom: 8,
  },
  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#eee",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  cartBtn: {
    backgroundColor: "#F6F6F6",
    borderRadius: 20,
    padding: 8,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F6F6F6",
    borderRadius: 18,
    marginHorizontal: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  bannerWrap: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#2979FF",
    marginBottom: 16,
  },
  bannerImg: {
    width: "100%",
    height: 150,
    borderRadius: 16,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginBottom: 10,

  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
  },
  seeAll: {
    color: "#2979FF",
    fontSize: 14,
    fontWeight: "500",
  },
  categoryItem: {
    alignItems: "center",
    marginRight: 18,
    width: 64,
    height:80
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f3f3f3",
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 13,
    color: "#222",
    textAlign: "center",
    maxWidth: 60,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
  },
});
