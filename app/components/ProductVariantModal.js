import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useProductVariant } from '../hooks/useProductVariant';

const { height, width } = Dimensions.get('window');

const ProductVariantModal = ({ 
  visible, 
  onClose, 
  product, 
  onBuyNow, 
  onAddToCart,
  userInfo,
  actionType,
}) => {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedColorImageUrl, setSelectedColorImageUrl] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  const {
    variants: productVariants,
  } = useProductVariant(product?._id);

  useEffect(() => {
    if (visible) {
      setQuantity(1);
      setSelectedVariant(null);
      setSelectedColor(null);
      setSelectedSize(null);
    }
  }, [visible]);

  useEffect(() => {
    if (selectedColor && selectedSize) {
      const matchedVariant = productVariants.find(v =>
        v.attributes.color._id === selectedColor._id &&
        v.attributes.size._id === selectedSize._id
      );
      setSelectedVariant(matchedVariant || null);
    } else if (selectedColor && !selectedSize) {
      const matchedByColor = productVariants.find(v =>
        v.attributes.color._id === selectedColor._id
      );
      setSelectedVariant(matchedByColor || null);
    } else {
      setSelectedVariant(null);
    }
  }, [selectedColor, selectedSize]);

  const handleBuyNow = () => {
    if (!userInfo?._id) {
      Alert.alert('Lỗi', 'Vui lòng đăng nhập để mua sản phẩm');
      return;
    }
    if (!selectedVariant) {
      Alert.alert('Lỗi', 'Vui lòng chọn biến thể sản phẩm');
      return;
    }
    onBuyNow({ product, variant: selectedVariant, quantity });
    onClose();
  };

  const handleAddToCart = async () => {
    if (!userInfo?._id) {
      Alert.alert('Lỗi', 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      return;
    }
    if (!selectedVariant) {
      Alert.alert('Lỗi', 'Vui lòng chọn biến thể sản phẩm');
      return;
    }
    setLoading(true);
    try {
      await onAddToCart({ product, variant: selectedVariant, quantity });
      onClose();
    } catch (error) {
      console.error('Lỗi thêm vào giỏ hàng:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentPrice = selectedVariant?.price || product?.price || 0;
  const allSizes = Array.from(
    new Set(productVariants.map(v => JSON.stringify(v.attributes.size)))
  ).map(s => JSON.parse(s));

  const allColors = Array.from(
    new Set(productVariants.map(v => JSON.stringify(v.attributes.color)))
  ).map(c => JSON.parse(c));

  const availableSizes = selectedColor
    ? allSizes.filter(size =>
        productVariants.some(v =>
          v.attributes.color._id === selectedColor._id &&
          v.attributes.size._id === size._id
        )
      )
    : allSizes;

    const getWeightRange = (size) => {
    const weightRanges = {
      'M': '40kg đến 53kg',
      'L': '54kg đến 63kg',
      'XL': '64kg đến 80kg',
      'XXL': '75kg đến 95kg',
      'S': '75kg đến 95kg',

    };
    return weightRanges[size] || '';
  };
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={20} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.rowInfo}>
            <Image
              source={{
                uri: selectedColorImageUrl || selectedVariant?.image_url || product?.images?.[0]?.url
              }}
              style={styles.productImage}
            />

            <View style={styles.productInfo}>
              {/* <Text style={styles.productName}>{product?.name}</Text> */}
              <Text style={styles.price}>{currentPrice.toLocaleString('vi-VN')} ₫</Text>
              {(selectedColor?.name || selectedSize?.name) && (
                <Text style={styles.selectedText}>
                  Đã chọn:{' '}
                  {selectedColor?.name && <Text style={styles.bold}>{selectedColor.name}</Text>}
                  {selectedColor?.name && selectedSize?.name && ', '}
                  {selectedSize?.name && <Text style={styles.bold}>{selectedSize.name}</Text>}
                </Text>
              )}
               {selectedVariant?.stock !== undefined && (
                 <View style={styles.stockInfo}>
                   <Text style={styles.stockText}>
                     {selectedVariant.stock > 0 
                       ? `Còn ${selectedVariant.stock} sản phẩm` 
                       : 'Hết hàng'
                     }
                   </Text>
                 </View>
               )}
            </View>
          </View>

          <ScrollView>
            {/* Màu sắc */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Màu sắc</Text>
              <View style={styles.colorGrid}>
                {allColors.map((color) => {
                  const isSelected = selectedColor?._id === color._id;
                  return (
                    <TouchableOpacity
                      key={color._id}
                      style={[styles.colorBox, isSelected && styles.selectedBox]}
                      onPress={() => {
                        setSelectedColor(color);
                        const stillValid = productVariants.some(v =>
                          v.attributes.color._id === color._id &&
                          v.attributes.size._id === selectedSize?._id
                        );
                        if (!stillValid) setSelectedSize(null);
                      }}
                    >
                      <Text style={[styles.colorText, isSelected && styles.selectedText]}>
                        {color.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Kích cỡ */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Kích cỡ</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {allSizes.map((size) => {
                  const isAvailable = availableSizes.some(s => s._id === size._id);
                  const isSelected = selectedSize?._id === size._id;
                  return (
                    <TouchableOpacity
                      key={size._id}
                      style={[styles.sizeBox, isSelected && styles.selectedBox]}
                      onPress={() => isAvailable && setSelectedSize(size)}
                      disabled={!isAvailable}
                    >
                      <Text style={[styles.sizeText, isSelected && styles.selectedText]}>
                        {size.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          {/* Size with Weight Info */}
          {selectedVariant && (
            <View style={styles.sizeSection}>
              <Text style={styles.sectionTitle}>Gợi ý cân nặng phù hợp</Text>
              <View style={styles.sizeContainer}>
                <Text style={styles.sizeText}>
                  Size {selectedVariant.size}: {getWeightRange(selectedVariant.size)}
                </Text>
              </View>
            </View>
          )}
            {/* Quantity */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Số lượng</Text>
              <View style={styles.quantityRow}>
                <TouchableOpacity
                  onPress={() => quantity > 1 && setQuantity(quantity - 1)}
                  style={styles.quantityButton}
                >
                  <Ionicons name="remove" size={20} color="#666" />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity
                  onPress={() => setQuantity(quantity + 1)}
                  style={styles.quantityButton}
                >
                  <Ionicons name="add" size={20} color="#666" />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            {actionType === 'buy' && (
              <TouchableOpacity style={styles.buyNowButton} onPress={handleBuyNow}>
                <Text style={styles.buyNowText}>Mua ngay</Text>
              </TouchableOpacity>
            )}
            {actionType === 'cart' && (
              <TouchableOpacity style={styles.buyNowButton} onPress={handleAddToCart}>
                <Text style={styles.buyNowText}>{loading ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContent: {
    height: height * 0.8,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
  },
  closeButton: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  rowInfo: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  productImage: {
    width: 100,
    height:100,
    borderRadius: 8,
    backgroundColor: '#f6f6f6',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  selectedText: {
    color: '#555',
    fontSize: 14,
  },
  bold: {
    fontWeight: 'bold',
    color: '#222',
  },
  section: {
    marginTop: 12,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorBox: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  selectedBox: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  colorText: {
    fontSize: 14,
  },
  sizeBox: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
  },
  sizeText: {
    fontSize: 14,
  },
  stockInfo: {
    marginTop: 6,
  },
  stockText: {
    fontSize: 13,
    color: '#555',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
    sizeSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  quantityButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  buyNowButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buyNowText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProductVariantModal;