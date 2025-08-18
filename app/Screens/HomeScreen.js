import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Swiper from 'react-native-swiper';
import { useDispatch, useSelector } from "react-redux";
import ProductCard from "../components/ProductCard";
import RelatedProducts from "../components/RelatedProducts";
import TrendingProducts from "../components/TrendingProducts";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../hooks/useCart";
import {
  fetchBestSellers,
  fetchCategories,
  fetchNewest,
  fetchPopular
} from "../reudx/homeSlice";
import {
  addFavorite,
  getCategoriesById,
  getFavoritesByUser,
  getPersonalizedProducts,
  getTrendingProducts,
  removeFavorite
} from "../utils/api";

const { width } = Dimensions.get("window");
const bannerImg = require("../../assets/images/LogoSwear.png");
const defaultAvatar = require("../../assets/images/default-avatar.png");
const HOTCATEGORY_TYPE_ID = '6864066dc14992d3a8d28826';
const POPULAR_SPORTS_TYPE_ID = '686406c0c14992d3a8d2882a'
const DAILY_ESSENTIALS_TYPE_ID = '686406f6c14992d3a8d2882e'
const BANNERS_TYPE_ID = '6880867e2472c27f4fe16fd0'
const ShoseMoutain_TYPE_ID = '6881ef955efa939fe032afb5'



export default function HomeScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { userInfo } = useAuth();
  const { categories, bestSellers, loading, popular, newest } = useSelector((state) => state.home);
  const { cartCount, refreshCart } = useCart();

  const scrollY = useRef(new Animated.Value(0)).current;
  const translateY = scrollY.interpolate({
  inputRange: [0, 50],
  outputRange: [0, -40], // Dịch lên để nằm cùng hàng Header
  extrapolate: "clamp",
});
  const userId = userInfo?._id;
  const [bannersCategories, setbannersCategories] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [hotCategories, setHotCategories] = useState([]);// list categorycategory
  const [popularSportsCategories, setPopularSportsCategories] = useState([]);
  const [dailyEssentialsCategories, setDailyEssentialsCategories] = useState([]);
  const [shoseMoutainCategories, setShoseMoutainCategories] = useState([]);
  
  // Trending and personalized products state
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [personalizedProducts, setPersonalizedProducts] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(false);
  const [personalizedLoading, setPersonalizedLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchBestSellers());
    dispatch(fetchPopular());
    dispatch(fetchNewest());
  }, [dispatch]);

  // Lấy danh sách sản phẩm yêu thích khi vào Home
  useEffect(() => {
    if (!userId) return;
    const fetchFavorites = async () => {
      try {
        const data = await getFavoritesByUser(userId);
        setFavoriteIds(data.map(fav => fav.product_id?._id));
      } catch (err) {
        setFavoriteIds([]);
      }
    };
    fetchFavorites();
  }, [userId]);

  // Refresh danh sách yêu thích mỗi khi màn hình được focus
  useFocusEffect(
    React.useCallback(() => {
      if (userId) {
        const fetchFavorites = async () => {
          try {
            const data = await getFavoritesByUser(userId);
            setFavoriteIds(data.map(fav => fav.product_id?._id));
          } catch (err) {
            setFavoriteIds([]);
          }
        };
        fetchFavorites();
      }
       refreshCart(); // ✅ Gọi đúng tên function
    }, [userId])
  );

  // Fetch trending and personalized products
  useEffect(() => {
    const fetchTrendingProducts = async () => {
      setTrendingLoading(true);
      try {
        const response = await getTrendingProducts(8, 'week');
        if (response.success) {
          setTrendingProducts(response.trendingProducts || []);
        }
      } catch (error) {
        console.error('Error fetching trending products:', error);
      } finally {
        setTrendingLoading(false);
      }
    };

    const fetchPersonalizedProducts = async () => {
      if (!userId) return;
      setPersonalizedLoading(true);
      try {
        const response = await getPersonalizedProducts(userId, 6);
        if (response.success) {
          setPersonalizedProducts(response.personalizedProducts || []);
        }
      } catch (error) {
        console.error('Error fetching personalized products:', error);
      } finally {
        setPersonalizedLoading(false);
      }
    };

    fetchTrendingProducts();
    fetchPersonalizedProducts();
  }, [userId]);

  // Xử lý toggle yêu thích
  const handleToggleFavorite = async (product) => {
    if (!userId || !product?._id) return;
    const isFav = favoriteIds.includes(product._id);
    try {
      if (isFav) {
        await removeFavorite(userId, product._id);
        setFavoriteIds(favoriteIds.filter(id => id !== product._id));
      } else {
        await addFavorite(userId, product._id);
        setFavoriteIds([...favoriteIds, product._id]);
      }
    } catch (err) {}
  };
 
// state và gọi api cho danh mục hot
  useEffect(() => {
    getCategoriesById(HOTCATEGORY_TYPE_ID)
      .then(data => setHotCategories(data))
      .catch(() => setHotCategories([]));
    getCategoriesById(POPULAR_SPORTS_TYPE_ID)
      .then(data => setPopularSportsCategories(data))
      .catch(() => setPopularSportsCategories([]));
    getCategoriesById(DAILY_ESSENTIALS_TYPE_ID)
      .then(data => setDailyEssentialsCategories(data))
      .catch(() => setDailyEssentialsCategories([]));
    getCategoriesById(ShoseMoutain_TYPE_ID)
      .then(data => setShoseMoutainCategories(data))
      .catch(() => setShoseMoutainCategories([]));
    // Fetch banners
    getCategoriesById(BANNERS_TYPE_ID)
      .then(data => setbannersCategories(data))
      .catch(() => setbannersCategories([]));
  }, []);

  // Hiển thị số lượng danh mục đầu tiên
  const displayedCategories = categories.slice(0, 18);
// hiển thị danh mục hot
  const HotCategoryList = ({ categories }) => (
    <View style={{ marginTop: 15, marginBottom: 24 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 20, marginLeft: 16, marginBottom: 12 }}>
        Khám phá môn thể thao đang HOT
      </Text>
      <FlatList
        horizontal
        data={categories}
        keyExtractor={(item) => String(item._id || item.id)}
        contentContainerStyle={{ paddingHorizontal: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{ alignItems: 'center', marginRight: 16 }}
            onPress={() => navigation.navigate('CategoryScreen', { category: item })}
          >
            <Image
              source={item.image_url ? { uri: item.image_url } : require('../../assets/images/box-icon.png')}
              style={{ width: 100, height: 100 }}
            />
            <Text style={{ marginTop: 8, fontSize: 15, fontWeight: '500' }}>{item.name}</Text>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
        ListEmptyComponent={loading ? (
          <Text style={{ color: '#888', marginLeft: 16 }}>Đang tải...</Text>
        ) : null}
      />
    </View>
  );

  // hiển thị danh mục phổ biến
  const PopularCategoryList = ({ categories }) => (
    <View style={{ marginTop: 15, marginBottom: 24 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 20, marginLeft: 16, marginBottom: 12,fontFamily:"serif" }}>
        Khám phá môn thể thao phổ biến
      </Text>
      <FlatList
        horizontal
        data={categories}
        keyExtractor={(item) => String(item._id || item.id)}
        contentContainerStyle={{ paddingHorizontal: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{ alignItems: 'center', marginRight: 16 }}
            onPress={() => navigation.navigate('CategoryScreen', { category: item })}
          >
            <Image
              source={item.image_url ? { uri: item.image_url } : require('../../assets/images/box-icon.png')}
              style={{ width: 100, height: 100 }}
            />
            <Text style={{ marginTop: 8, fontSize: 15, fontWeight: '500' }}>{item.name}</Text>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
        ListEmptyComponent={loading ? (
          <Text style={{ color: '#888', marginLeft: 16 }}>Đang tải...</Text>
        ) : null}
      />
    </View>
  );

// hiển thị danh mục hằng ngàyngày
const DaylyCategoryList = ({ categories }) => (
  <View style={{ marginTop: 15, marginBottom: 24 }}>
    <Text style={{ fontWeight: 'bold', fontSize: 20, marginLeft: 16, marginBottom: 12, fontFamily:"serif" }}>
      Chinh phục mọi cự ly
    </Text>
    <FlatList
      horizontal
      data={categories}
      keyExtractor={(item) => String(item._id || item.id)}
      contentContainerStyle={{ paddingHorizontal: 8 }}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={{ alignItems: 'center', marginRight: 16 }}
          onPress={() => navigation.navigate('CategoryScreen', { category: item })}
        >
          <Image
            source={item.image_url ? { uri: item.image_url } : require('../../assets/images/box-icon.png')}
            style={{ width: 350, height: 200, }}
          />
  
        </TouchableOpacity>
      )}
      showsHorizontalScrollIndicator={false}
      ListEmptyComponent={loading ? (
        <Text style={{ color: '#888', marginLeft: 16 }}>Đang tải...</Text>
      ) : null}
    />
  </View>
);

// hiển thị Loại danh mục giày leo núinúi
const ShoseMoutainCategoryList = ({ categories }) => (
  <View style={{ marginTop: 15, marginBottom: 24 }}>
    <Text style={{ fontWeight: 'bold', fontSize: 20, marginLeft: 16, marginBottom: 12 }}>
      Chinh phục núi rừng
    </Text>
    <FlatList
      horizontal
      data={categories}
      keyExtractor={(item) => String(item._id || item.id)}
      contentContainerStyle={{ paddingHorizontal: 8 }}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={{ alignItems: 'center', marginRight: 16 }}
          onPress={() => navigation.navigate('CategoryScreen', { category: item })}
        >
          <Image
            source={item.image_url ? { uri: item.image_url } : require('../../assets/images/box-icon.png')}
            style={{ width: 350, height: 200, }}
          />
  
        </TouchableOpacity>
      )}
      showsHorizontalScrollIndicator={false}
      ListEmptyComponent={loading ? (
        <Text style={{ color: '#888', marginLeft: 16 }}>Đang tải...</Text>
      ) : null}
    />
  </View>
);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.ScrollView showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
           onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("Profile", {
                screen: "ProfileScreen",
              })
            }
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
            <Ionicons name="cart-outline" size={24} color="#222" />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
       <Animated.View
        style={[
          styles.searchBarContainer,
          {
            transform: [{ translateY }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate("SearchSc")}
        >
          <Ionicons name="search" size={20} color="#666" />
          <Text style={{ marginLeft: 8, color: "#666" }}>
            Tìm kiếm sản phẩm...
          </Text>
        </TouchableOpacity>
      </Animated.View>

       <View style={styles.bannerWrap}>
        {bannersCategories && bannersCategories.length > 0 ? (
          <Swiper
            loop
            autoplay={true} 
            showsPagination={false}
            dotStyle={{ backgroundColor: '#ccc', width: 8, height: 8 }}
            activeDotStyle={{ backgroundColor: '#000', width: 10, height: 10 }}
            style={{ height: 160 }}
          >
             {bannersCategories.map((item) => (
              <View key={item._id}>
                <TouchableOpacity onPress={() => navigation.navigate('CategoryScreen', { category: item })} activeOpacity={0.8}>
                  <Image
                    source={item.image_url ? { uri: item.image_url } : bannerImg}
                    style={styles.bannerImg}
                  />
                </TouchableOpacity>
              </View>
  ))}
          </Swiper>
        ) : (
          <Image source={bannerImg} style={styles.bannerImg} />
        )}
      </View>

        {/* Categories */}
        <View style={styles.categoryRow}>
          <Text style={styles.sectionTitle}>Danh mục</Text>
          <TouchableOpacity onPress={() => navigation.navigate("CategoryScreen")}> 
            <Text style={styles.seeAll}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={displayedCategories}
          keyExtractor={(item) => String(item._id || item.id)}
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

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Sản phẩm bán chạy nhất </Text>
        </View>
        <FlatList
          data={bestSellers}
          keyExtractor={(item) => String(item._id || item.id)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{paddingHorizontal: 18 }}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              navigation={navigation}
              fixedHeight
              isFavorite={favoriteIds.includes(item._id)}
              onToggleFavorite={handleToggleFavorite}
              showFavoriteIcon={true}
            />
          )}
          ListEmptyComponent={loading ? (
            <Text style={{ color: '#888', marginLeft: 16 }}>Đang tải...</Text>
          ) : null}
        />
        {/* danh mục hot */}
        <HotCategoryList categories={hotCategories} />
        {/* danh mục Giày chạy bộ */}
        <DaylyCategoryList categories={dailyEssentialsCategories} />
        {/* sản phẩm phổ biến nhất */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Sản phẩm phổ biến nhất</Text>
        </View>
        <FlatList
          data={popular}
          keyExtractor={(item) => String(item._id || item.id)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: 12, }}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              navigation={navigation}
              fixedHeight
              isFavorite={favoriteIds.includes(item._id)}
              onToggleFavorite={handleToggleFavorite}
              showFavoriteIcon={true}
            />
          )}
          ListEmptyComponent={loading ? (
            <Text style={{ color: '#888', marginLeft: 16 }}>Đang tải...</Text>
          ) : null}
        />
  
        {/* danh mục popular */}
        <PopularCategoryList categories={popularSportsCategories} />
        {/* danh mục daily essentials */}
        
        < ShoseMoutainCategoryList categories={shoseMoutainCategories} />


        {/* sản phẩm mới nhất */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Sản phẩm mới nhất</Text>
        </View>
        <FlatList
          data={newest}
          keyExtractor={(item) => String(item._id || item.id)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: 12, }}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              navigation={navigation}
              fixedHeight
              isFavorite={favoriteIds.includes(item._id)}
              onToggleFavorite={handleToggleFavorite}
              showFavoriteIcon={true}
            />
          )}
          ListEmptyComponent={loading ? (
            <Text style={{ color: '#888', marginLeft: 16 }}>Đang tải...</Text>
          ) : null}
        />

        {/* Trending Products */}
        <TrendingProducts
          products={trendingProducts}
          loading={trendingLoading}
          title="Sản phẩm phổ biến tuần này"
          timeRange="week"
          navigation={navigation}
          onViewAll={() => navigation.navigate('SearchSc', { keyword: 'trending' })}
        />

        {/* Personalized Products */}
        {userId && (
          <RelatedProducts
            products={personalizedProducts}
            loading={personalizedLoading}
            title="Gợi ý dành cho bạn"
            navigation={navigation}
            onViewAll={() => navigation.navigate('SearchSc', { keyword: 'personalized' })}
          />
        )}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Các dịch vụ khác của cửa hàng</Text>

        </View>
         <View style={{marginHorizontal: 16, marginBottom: 16,marginTop: 16}}>
          <Text style={{fontSize:20, color:'#3b82f6', fontWeight:'500'}}>Store Swear | Cửa Hàng Thể Thao Chính Hãng Đến Từ Việt Nam</Text>
          <Text style={{fontSize:15}}>Swear là cửa hàng chuyên cung cấp các sản phẩm thể thao chất lượng cao, từ quần áo, giày dép đến phụ kiện tập luyện. Với phong cách hiện đại, trẻ trung và đa dạng mẫu mã, Swear mang đến cho bạn trải nghiệm mua sắm tiện lợi cùng những sản phẩm bền đẹp, giúp bạn tự tin thể hiện phong cách và nâng cao hiệu suất tập luyện.</Text>
          <Text style={{fontSize:20, fontWeight:'500', marginTop:10}}>Cửa hàng mua sắm đồ thể thao Swear</Text>
          <Text style={{fontSize:15}}>Địa chỉ cửa hàng: Số 1, Đường Độc Lập, phường Quán Thánh, quận Ba Đình</Text>
          <Text style={{fontSize:15}}>Điện thoại: 0123456789</Text>
          <Text style={{fontSize:15}}>Giấy chứng nhận ĐKDN:0324982234 | Ngày cấp: 20/11/2004 | Nơi cấp: Thành phố Hà Hội</Text>
        </View>
              <View style={{height: 100}}></View>
      </Animated.ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1,
    backgroundColor: "#fff" 

  },
    header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 30,
    marginBottom: 8,
  },
  avatarWrap: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#eee",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  cartBtn: {
    backgroundColor: "#F6F6F6",
    borderRadius: 20,
    padding: 8,
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#FF5252",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    paddingHorizontal: 2,
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
    marginHorizontal: 1,
    borderRadius: 1,
    overflow: "hidden",
    marginBottom: 16,
  },
 bannerImg: {
  width: width,
  height: 160,
  borderRadius: 10,
  resizeMode: "contain",
},
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginBottom: 10,

  },
  sectionTitle: {
    fontSize: 20,
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
