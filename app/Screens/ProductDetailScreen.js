import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function ProductScreen() {
  const [size, setSize] = useState('S');
  const [color, setColor] = useState('black');
  const [quantity, setQuantity] = useState(1);

  const sizes = ['S', 'M', 'L'];
  const colors = ['black', 'white'];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Ảnh sản phẩm */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Image
            source={{ uri: 'https://example.com/image1.jpg' }} // Thay bằng ảnh thật
            style={styles.image}
          />
          <Image
            source={{ uri: 'https://example.com/image2.jpg' }} // Thay bằng ảnh thật
            style={styles.image}
          />
        </ScrollView>

        {/* Tên sản phẩm */}
        <Text style={styles.title}>Áo bơi Rash Guard nữ</Text>
        <Text style={styles.price}>341.000 VND</Text>

        {/* Kích cỡ */}
        <Text style={styles.label}>Kích cỡ</Text>
        <View style={styles.dropdown}>
          <Text>{size}</Text>
          <Ionicons name="chevron-down" size={18} />
        </View>

        {/* Màu sắc */}
        <Text style={styles.label}>Màu sắc</Text>
        <View style={styles.dropdown}>
          <View style={[styles.colorDot, { backgroundColor: color }]} />
          <Ionicons name="chevron-down" size={18} />
        </View>

        {/* Số lượng */}
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
            onPress={() => setQuantity(quantity + 1)}
            style={styles.quantityBtn}
          >
            <Ionicons name="add" size={16} />
          </TouchableOpacity>
        </View>

        {/* Mô tả ngắn */}
        <Text style={styles.description}>
          Tính năng Anti – Chlorine giúp tăng độ bền vải, giữ màu lâu hơn, duy trì form dáng tốt và thân thiện với da.
        </Text>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerPrice}>341.000 VND</Text>
        <TouchableOpacity style={styles.addToCartBtn}>
          <Text style={styles.cartBtnText}>Thêm vào Giỏ hàng</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ==========================
// 💅 STYLE SHEET
// ==========================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  image: {
    width: 250,
    height: 250,
    borderRadius: 12,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  price: {
    color: '#3b82f6',
    fontWeight: 'bold',
    marginVertical: 8,
  },
  label: {
    marginTop: 16,
    fontWeight: '500',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginTop: 8,
  },
  colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
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
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  addToCartBtn: {
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  cartBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
