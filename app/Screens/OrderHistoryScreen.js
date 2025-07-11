import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../hooks/useCart';

const renderStars = (rating) => (
    <View style={{ flexDirection: 'row' }}>
        {Array.from({ length: 5 }).map((_, idx) => (
            <Ionicons
                key={idx}
                name={idx < rating ? 'star' : 'star-outline'}
                size={16}
                color="#facc15"
            />
        ))}

    </View>
);

export default function ProductDetailScreen({ route, navigation }) {
    const { product } = route.params;
    const [size, setSize] = useState(product.sizes?.[0] || null);
    const [color, setColor] = useState(product.colors?.[0] || null);
    const [quantity, setQuantity] = useState(1);
    const { addToCart, cartCount, isInCart } = useCart();
    const { userInfo } = useAuth();

    const handleAddToCart = async () => {
        if (!userInfo) {
            Alert.alert("Lỗi", "Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
            return;
        }

        const success = await addToCart(product, quantity, size, color);
        if (success) {
            // Có thể navigate đến cart hoặc hiển thị thông báo
        }
    };

    const handleBuyNow = async () => {
        if (!userInfo) {
            Alert.alert("Lỗi", "Vui lòng đăng nhập để mua sản phẩm");
            return;
        }

        const success = await addToCart(product, quantity, size, color);
        if (success) {
            navigation.navigate('Cart');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header với nút back và giỏ hàng */}
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={24} color="#222" />
                </TouchableOpacity>
                <View style={{ flex: 1 }} />
                <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={styles.headerBtn}>
                    <Ionicons name="cart-outline" size={26} color="#222" />
                    {cartCount > 0 && (
                        <View style={styles.cartBadge}>
                            <Text style={styles.cartBadgeText}>{cartCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
                {/* Ảnh sản phẩm */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                    {(product.images || [product.image_url]).map((img, idx) => (
                        <Image
                            key={idx}
                            source={{ uri: img }}
                            style={[styles.image, { width: Dimensions.get('window').width - 32 }]}
                            resizeMode="cover"
                        />
                    ))}
                </ScrollView>
                {/* Tên, giá, danh mục */}
                <Text style={styles.title}>{product.name}</Text>
                <Text style={styles.price}>{product.price?.toLocaleString('vi-VN') || ''} ₫</Text>
                {product.category && (
                    <Text style={styles.category}>Danh mục: {product.category.name || product.category}</Text>
                )}
                {/* Biến thể size */}
                {product.sizes && product.sizes.length > 0 && (
                    <>
                        <Text style={styles.label}>Kích cỡ</Text>
                        <ScrollView horizontal style={{ marginTop: 8, marginBottom: 4 }} showsHorizontalScrollIndicator={false}>
                            {product.sizes.map((item) => (
                                <TouchableOpacity
                                    key={item}
                                    onPress={() => setSize(item)}
                                    style={[styles.variantBtn, size === item && styles.variantBtnActive]}
                                >
                                    <Text style={size === item && { color: '#3b82f6', fontWeight: 'bold' }}>{item}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </>
                )}
                {/* Biến thể màu */}
                {product.colors && product.colors.length > 0 && (
                    <>
                        <Text style={styles.label}>Màu sắc</Text>
                        <View style={{ flexDirection: 'row', marginTop: 8, marginBottom: 4 }}>
                            {product.colors.map((item) => (
                                <TouchableOpacity
                                    key={item}
                                    onPress={() => setColor(item)}
                                    style={[
                                        styles.colorDot,
                                        { backgroundColor: item, borderWidth: color === item ? 2 : 0, borderColor: '#3b82f6' },
                                    ]}
                                />
                            ))}
                        </View>
                    </>
                )}
                {/* Số lượng còn lại */}
                {product.stock !== undefined && (
                    <Text style={styles.stock}>Còn lại: {product.stock} sản phẩm</Text>
                )}
                {/* Số lượng chọn */}
                <Text style={styles.label}>Số lượng</Text>
                <View style={styles.quantityContainer}>
                    <TouchableOpacity
                        onPress={() => quantity > 1 && setQuantity(quantity - 1)}
                        style={styles.quantityBtn}
                    >
                        <Ionicons name="remove" size={16} />
                    </TouchableOpacity>
                    <Text style={{ marginHorizontal: 12 }}>{quantity}</Text>
                    <TouchableOpacity
                        onPress={() => quantity < (product.stock || 99) && setQuantity(quantity + 1)}
                        style={styles.quantityBtn}
                    >
                        <Ionicons name="add" size={16} />
                    </TouchableOpacity>
                </View>
                {/* Mô tả */}
                <Text style={styles.label}>Mô tả sản phẩm </Text>
                {product.description && (
                    <Text style={styles.description}>{product.description}</Text>
                )}
<Text style={styles.label}>Đánh giá</Text>
<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
  {renderStars(product.rating || 0)}
  <Text style={{ marginLeft: 8, color: '#888' }}>
    {Number(product.rating || 0).toFixed(1)} điểm ({product.rating_count || 0} đánh giá)
  </Text>
</View>

                {/* Danh sách đánh giá (nếu có) */}
                {product.reviews && product.reviews.length > 0 && (
                    <View style={{ marginTop: 8 }}>
                        {product.reviews.slice(0, 3).map((review, idx) => (
                            <View key={idx} style={{ marginBottom: 8, padding: 8, backgroundColor: '#f9f9f9', borderRadius: 8 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                    {renderStars(review.rating)}
                                    <Text style={{ marginLeft: 8, fontWeight: '500' }}>{review.user_name}</Text>
                                </View>
                                <Text style={{ color: '#666', fontSize: 14 }}>{review.comment}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* Footer với nút thêm vào giỏ hàng và mua ngay */}
            <View style={styles.footer}>
                <View>
                    <Text style={styles.footerPrice}>
                        {(product.price * quantity)?.toLocaleString('vi-VN')} VND
                    </Text>
                    <Text style={styles.footerSubtext}>
                        {isInCart(product._id) ? 'Đã có trong giỏ hàng' : 'Chưa có trong giỏ hàng'}
                    </Text>
                </View>
                <View style={styles.footerButtons}>
                    <TouchableOpacity
                        style={[styles.addToCartBtn, isInCart(product._id) && styles.addToCartBtnActive]}
                        onPress={handleAddToCart}
                        disabled={isInCart(product._id)}
                    >
                        <Text style={[styles.cartBtnText, isInCart(product._id) && styles.cartBtnTextActive]}>
                            {isInCart(product._id) ? 'Đã thêm' : 'Thêm vào giỏ'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.buyNowBtn}
                        onPress={handleBuyNow}
                    >
                        <Text style={styles.buyNowText}>Mua ngay</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        marginTop: 35,
        
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingTop: 12,
        marginBottom: 4,
    },
    headerBtn: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#f6f6f6',
        position: 'relative',
    },
    cartBadge: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: '#FF5252',
        borderRadius: 8,
        minWidth: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cartBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        paddingHorizontal: 2,
    },
    image: {
        height: 250,
        borderRadius: 12,
        marginRight: 12,
        backgroundColor: '#f6f6f6',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 8,
    },
    price: {
        color: '#3b82f6',
        fontWeight: 'bold',
        marginVertical: 8,
        fontSize: 18,
    },
    category: {
        color: '#888',
        fontSize: 14,
        marginBottom: 8,
    },
    label: {
        marginTop: 16,
        fontWeight: '500',
        fontSize: 15,
    },
    variantBtn: {
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        marginRight: 10,
        backgroundColor: '#fff',
    },
    variantBtnActive: {
        borderColor: '#3b82f6',
        backgroundColor: '#e0eaff',
    },
    colorDot: {
        width: 28,
        height: 28,
        borderRadius: 14,
        marginRight: 12,
    },
    stock: {
        color: '#16a34a',
        fontWeight: 'bold',
        marginTop: 4,
        marginBottom: 4,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 8,
    },
    quantityBtn: {
        backgroundColor: '#e5e7eb',
        padding: 8,
        borderRadius: 8,
    },
    description: {
        marginTop: 16,
        color: '#6b7280',
        lineHeight: 20,
        fontSize: 15,
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderColor: '#e5e7eb',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
    },
    footerPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3b82f6',
    },
    footerSubtext: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    footerButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    addToCartBtn: {
        backgroundColor: '#3b82f6',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
    },
    addToCartBtnActive: {
        backgroundColor: '#e5e7eb',
    },
    cartBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    cartBtnTextActive: {
        color: '#666',
    },
    buyNowBtn: {
        backgroundColor: '#16a34a',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
    },
    buyNowText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
});