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
import ProductVariantSelector from './ProductVariantSelector';

const { width } = Dimensions.get('window');

const ProductVariantModal = ({ 
  visible, 
  onClose, 
  product, 
  onBuyNow, 
  onAddToCart,
  userInfo,
  actionType,
  selectedColor,
  setSelectedColor,
  selectedSize,
  setSelectedSize,
}) => {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedColorImageUrl, setSelectedColorImageUrl] = useState(null);

  useEffect(() => {
    if (visible) {
      setQuantity(1);
      setSelectedVariant(null);
    }
  }, [visible]);

  const handleBuyNow = () => {
    if (!userInfo?._id) {
      Alert.alert('Lỗi', 'Vui lòng đăng nhập để mua sản phẩm');
      return;
    }

    if (!selectedVariant) {
      Alert.alert('Lỗi', 'Vui lòng chọn biến thể sản phẩm');
      return;
    }

    onBuyNow({
      product,
      variant: selectedVariant,
      quantity,
    });
    onClose();
  };

  const handleVariantChange = (variant) => {
      setSelectedVariant(variant);

      if (!variant && product?.variants?.length > 0) {
        const colorVariants = product.variants.filter(
          v => v.attributes.color._id === selectedColor?._id
        );
        if (colorVariants.length > 0) {
          setSelectedColorImageUrl(colorVariants[0].image_url);
        }
      } else if (variant?.image_url) {
        setSelectedColorImageUrl(variant.image_url);
      }
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
      await onAddToCart({
        product,
        variant: selectedVariant,
        quantity,
      });
      onClose();
    } catch (error) {
      console.error('Lỗi thêm vào giỏ hàng:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentPrice = selectedVariant?.price || product?.price || 0;
  const originalPrice = product?.original_price || product?.price || currentPrice;
  const discount = originalPrice > currentPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

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
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={{flexDirection: 'row', padding: 16, gap: 16}}>
          {/* Product Image */}
          <View style={styles.imageContainer}>
        <Image
           source={{ 
          uri: selectedColorImageUrl 
            || selectedVariant?.image_url 
            || product?.images?.[0]?.url 
            || product?.image_url 
            || product?.main_image 
        }}
            style={styles.productImage}
            resizeMode="cover"
          />
         
          </View>

          {/* Product Info */}
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product?.name}</Text>
            
            {/* Price */}
            <View style={styles.priceContainer}>
              <Text style={styles.currentPrice}>
                {currentPrice.toLocaleString('vi-VN')} ₫
              </Text>
            </View>

            <View style={{ marginTop: 8 }}>
              {(selectedColor?.name || selectedSize?.name) && (
                <Text style={{ fontSize: 14, color: '#444' }}>
                  {selectedColor?.name && (
                    <Text style={{ fontWeight: 'bold' }}>{selectedColor.name}</Text>
                  )}
                  {selectedColor?.name && selectedSize?.name && ', '}
                  {selectedSize?.name && (
                    <Text style={{ fontWeight: 'bold' }}>{selectedSize.name}</Text>
                  )}
                </Text>
              )}
            </View>


          {selectedVariant?.stock !== undefined && (
            <View style={styles.stockInfo}>
              <Text style={styles}>
                {selectedVariant.stock > 0 
                  ? `Còn ${selectedVariant.stock} sản phẩm` 
                  : 'Hết hàng'
                }
              </Text>
            </View>
          )}
          </View>
      </View>
          {/* Variant Selector */}
          <ProductVariantSelector
            productId={product?._id}
            onVariantChange={handleVariantChange}
            setSelectedColor={setSelectedColor}
            setSelectedSize={setSelectedSize}
          />

          {/* Size with Weight Info */}
          {selectedVariant && (
            <View style={styles.sizeSection}>
              <Text style={styles.sectionTitle}>Gợi ý cân nặng phù hợp với Size</Text>
              <View style={styles.sizeContainer}>
                <Text style={styles.sizeText}>

                  Size {selectedVariant.size}: {getWeightRange(selectedVariant.size)}
                </Text>
              </View>
            </View>
          )}
          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <Text style={styles.sectionTitle}>Số lượng</Text>
            <View style={styles.quantityContainer}>
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

          {/* Stock Info */}
        </ScrollView>

        {/* Footer Actions */}
        {/* <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.actionButton, 
              styles.buyNowButton,
              (!selectedVariant || loading) && styles.disabledButton
            ]}
            onPress={handleBuyNow}
            disabled={loading || !selectedVariant}
          >
            <Text style={styles.buyNowText}>Mua ngay</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.actionButton, 
              styles.addToCartButton,
              (!selectedVariant || loading) && styles.disabledButton
            ]}
            onPress={handleAddToCart}
            disabled={loading || !selectedVariant}
          >
            <Text style={styles.addToCartText}>
              {loading ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
            </Text>
          </TouchableOpacity>
        </View> */}

          <View style={styles.footer}>
            {/* <Text style={styles.footerPrice}>
              {selectedVariant?.price?.toLocaleString('vi-VN') || product.price?.toLocaleString('vi-VN')} VND
            </Text> */}

            {actionType === 'buy' && (
              <TouchableOpacity
                style={[styles.actionButton, 
              styles.buyNowButton,]}
                onPress={handleBuyNow} // gọi hàm truyền từ props
              >
                <Text style={styles.cartBtnText}>Mua ngay</Text>
              </TouchableOpacity>
            )}

            {actionType === 'cart' && (
              <TouchableOpacity
                style={[styles.actionButton, 
                styles.buyNowButton,]}
                onPress={handleAddToCart} // gọi hàm truyền từ props
              >
                <Text style={styles.cartBtnText}>Thêm vào Giỏ hàng</Text>
              </TouchableOpacity>
            )}
          </View>

      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f6f6f6',
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    alignItems: 'center',
    padding: 16,
  },
  productImage: {
    width: width * 0.25,
    height: width * 0.25,
    borderRadius: 8,
    backgroundColor: '#f6f6f6',
  },
  productInfo: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  currentPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 16,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  discount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#dc2626',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  promotions: {
    flexDirection: 'row',
    gap: 8,
  },
  promotionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  promotionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  sizeSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sizeContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  sizeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  quantitySection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f6f6f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 30,
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  actionButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  buyNowButton: {
    backgroundColor: '#3b82f6',
  },
  addToCartButton: {
    backgroundColor: '#3b82f6',
  },
  buyNowText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default ProductVariantModal; 