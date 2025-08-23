import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCart } from "../hooks/useCart";

const ProductScreen = ({ route }) => {
  const [size, setSize] = useState("S");
  const [color, setSelectedColor] = useState("black");
  const [quantity, setQuantity] = useState(1);
  const { addToCart, isInCart } = useCart();

  // Lấy thông tin sản phẩm từ route params
  const product = route.params?.product || {
    _id: "1",
    name: "Áo bơi Rash Guard nữ",
    price: 341000,
    image_url: "https://example.com/image1.jpg",
    description:
      "• Rash Guard là áo bơi nữ dài tay form ôm, chống nắng tốt.\n• Chất liệu: 90% Polyester, 10% Spandex, mềm mại, co giãn tốt.",
  };

  const sizes = ["S", "M", "L", "XL"];
  const colors = ["black", "white"];

  // Kiểm tra sản phẩm có hết hàng không
  const isOutOfStock = () => {
    // Kiểm tra stock từ nhiều nguồn khác nhau
    const getStockQuantity = (productData) => {
      const possibleStockFields = [
        productData?.stock_quantity,
        productData?.stock,
        productData?.quantity,
        productData?.available_quantity,
        productData?.inventory
      ];
      
      for (const stock of possibleStockFields) {
        if (stock !== undefined && stock !== null && stock > 0) {
          return stock;
        }
      }
      
      return 0;
    };
    
    const stock = getStockQuantity(product);
    return stock <= 0;
  };

  const outOfStock = isOutOfStock();

  const reviews = [
    {
      id: 1,
      name: "Alex Morgan",
      comment:
        "Sản phẩm chất liệu tốt, sử dụng tạo sự dễ chịu khi mặc. Vận chuyển đúng thời hạn. Hài lòng với đơn hàng này.",
      rating: 4,
    },
    {
      id: 2,
      name: "Jane Nguyen",
      comment:
        "Size hơi chật 1 chút, tuy nhiên vẫn dễ mặc nhờ chất liệu co giãn. Sẽ thử thêm màu khác lần sau. Giao hàng đúng như mô tả.",
      rating: 5,
    },
  ];

  const renderStars = (rating) => {
    return (
      <View style={{ flexDirection: "row" }}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Ionicons
            key={index}
            name={index < rating ? "star" : "star-outline"}
            size={16}
            color="#facc15"
          />
        ))}
      </View>
    );
  };

  const handleAddToCart = async () => {
    // Kiểm tra nếu sản phẩm hết hàng thì không cho thêm vào giỏ
    if (outOfStock) {
      Alert.alert("Thông báo", "Sản phẩm này đã hết hàng!");
      return;
    }
    
    // TODO: Implement product variant selection logic
    // For now, we'll pass null as productVariantId
    const success = await addToCart(product, quantity, null);
    if (success) {
      Alert.alert("Thành công", "Đã thêm sản phẩm vào giỏ hàng");
    }
  };

  const isProductInCart = isInCart(product._id);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView style={{ padding: 16 }}>
        {/* Ảnh sản phẩm */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ position: 'relative' }}>
            <Image
              source={{ uri: product.image_url }}
              style={{
                width: 300,
                height: 300,
                borderRadius: 12,
                marginRight: 12,
              }}
            />
            {/* Nhãn "Hết hàng" trên ảnh */}
            {outOfStock && (
              <View style={styles.outOfStockLabel}>
                <Text style={styles.outOfStockText}>Hết hàng</Text>
              </View>
            )}
          </View>
          <Image
            source={{ uri: "https://example.com/image2.jpg" }}
            style={{ width: 300, height: 300, borderRadius: 12 }}
          />
        </ScrollView>

        {/* Tên và giá */}
        <Text style={{ fontSize: 20, fontWeight: "bold", marginTop: 16 }}>
          {product.name}
        </Text>
        <Text style={{ color: "#3b82f6", fontWeight: "bold", marginTop: 4 }}>
          {product.price.toLocaleString()} VND
        </Text>

        {/* Thông báo hết hàng */}
        {outOfStock && (
          <View style={styles.outOfStockBanner}>
            <Ionicons name="alert-circle" size={20} color="#dc2626" />
            <Text style={styles.outOfStockBannerText}>Sản phẩm này hiện đã hết hàng</Text>
          </View>
        )}

        {/* Kích cỡ */}
        <Text style={{ marginTop: 16, fontWeight: "500" }}>Kích cỡ</Text>
        <ScrollView horizontal style={{ marginTop: 8 }}>
          {sizes.map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setSize(item)}
              style={{
                padding: 10,
                borderWidth: 1,
                borderColor: size === item ? "#3b82f6" : "#ccc",
                borderRadius: 8,
                marginRight: 10,
              }}
            >
              <Text>{item}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Màu sắc */}
        <Text style={{ marginTop: 16, fontWeight: "500" }}>Màu sắc</Text>
        <View style={{ flexDirection: "row", marginTop: 8 }}>
          {colors.map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setSelectedColor(item)}
              style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                backgroundColor: item,
                borderWidth: color === item ? 2 : 0,
                borderColor: "#3b82f6",
                marginRight: 12,
              }}
            />
          ))}
        </View>

        {/* Số lượng */}
        <Text style={{ marginTop: 16, fontWeight: "500" }}>Số lượng</Text>
        <View
          style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}
        >
          <TouchableOpacity
            onPress={() => quantity > 1 && setQuantity(quantity - 1)}
            style={{
              backgroundColor: "#f3f4f6",
              padding: 10,
              borderRadius: 8,
              marginRight: 12,
            }}
          >
            <Ionicons name="remove" size={20} />
          </TouchableOpacity>
          <Text style={{ fontSize: 16 }}>{quantity}</Text>
          <TouchableOpacity
            onPress={() => setQuantity(quantity + 1)}
            style={{
              backgroundColor: "#f3f4f6",
              padding: 10,
              borderRadius: 8,
              marginLeft: 12,
            }}
          >
            <Ionicons name="add" size={20} />
          </TouchableOpacity>
        </View>

        {/* Mô tả sản phẩm */}
        <Text style={{ marginTop: 16, color: "#6b7280" }}>
          {product.description}
        </Text>

        {/* Vận chuyển */}
        <Text style={{ marginTop: 16, fontWeight: "bold" }}>
          Vận chuyển & Trả hàng
        </Text>
        <Text style={{ color: "#6b7280" }}>
          Miễn phí giao hàng. Trả hàng miễn phí trong 10 ngày.
        </Text>

        {/* Đánh giá */}
        <Text style={{ marginTop: 16, fontWeight: "bold" }}>Đánh giá</Text>
        <Text style={{ color: "#6b7280", marginBottom: 8 }}>
          4.5 Điểm (223 Đánh giá)
        </Text>

        {reviews.map((review) => (
          <View key={review.id} style={{ marginBottom: 12 }}>
            <Text style={{ fontWeight: "bold" }}>{review.name}</Text>
            {renderStars(review.rating)}
            <Text style={{ color: "#4b5563" }}>{review.comment}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Nút thêm vào giỏ hàng */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 16,
          borderTopWidth: 1,
          borderColor: "#e5e7eb",
          backgroundColor: "#fff",
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold", color: "#3b82f6" }}>
          {product.price.toLocaleString()} VND
        </Text>
        
        {/* Nút thêm vào giỏ hàng - ẩn khi hết hàng */}
        {!outOfStock && (
          <TouchableOpacity
            style={{
              backgroundColor: isProductInCart ? "#10b981" : "#3b82f6",
              paddingVertical: 12,
              paddingHorizontal: 20,
              borderRadius: 10,
            }}
            onPress={handleAddToCart}
            disabled={isProductInCart}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>
              {isProductInCart ? "Đã có trong giỏ" : "Thêm vào Giỏ hàng"}
            </Text>
          </TouchableOpacity>
        )}

        {/* Thông báo hết hàng trong footer */}
        {outOfStock && (
          <View style={styles.outOfStockFooter}>
            <Ionicons name="alert-circle" size={20} color="#dc2626" />
            <Text style={styles.outOfStockFooterText}>Hết hàng</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  outOfStockLabel: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(220, 38, 38, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 3,
  },
  outOfStockText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  outOfStockBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 12,
    marginBottom: 12,
  },
  outOfStockBannerText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#dc2626',
    fontWeight: 'bold',
  },
  outOfStockFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  outOfStockFooterText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#dc2626',
    fontWeight: 'bold',
  },
});

export default ProductScreen;
