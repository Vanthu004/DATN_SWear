import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useProductVariant } from '../hooks/useProductVariant';

const ProductVariantSelector = ({ productId, onVariantChange }) => {
  const {
    variants: productVariants,
    selectedVariant,
    loading,
    error,
    selectVariant,
    getAvailableSizes,
    getAvailableColors,
    getVariantBySizeAndColor,
  } = useProductVariant(productId);

  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  useEffect(() => {
    if (productVariants.length > 0) {
      // Set default selections
      const firstVariant = productVariants[0];
      setSelectedSize(firstVariant.size || null);
      setSelectedColor(firstVariant.color || null);
      
      // Notify parent component
      if (onVariantChange) {
        onVariantChange(firstVariant);
      }
    }
  }, [productVariants]);

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    const availableVariants = productVariants.filter(v => v.size === size);
    if (availableVariants.length > 0) {
      const variant = availableVariants.find(v => v.color === selectedColor) || availableVariants[0];
      setSelectedColor(variant.color);
      
      if (onVariantChange) {
        onVariantChange(variant);
      }
    }
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    const variant = productVariants.find(v => v.size === selectedSize && v.color === color);
    
    if (variant && onVariantChange) {
      onVariantChange(variant);
    }
  };

  const currentVariant = getVariantBySizeAndColor(selectedSize, selectedColor);

  if (productVariants.length === 0) {
    return null;
  }

  // If only one variant, show variant info without selectors
  if (productVariants.length === 1) {
    const singleVariant = productVariants[0];
    // Notify parent component about the single variant
    if (onVariantChange) {
      onVariantChange(singleVariant);
    }
    return (
      <View style={styles.container}>
        <View style={styles.variantInfo}>
          <Text style={styles.variantPrice}>
            {singleVariant.price?.toLocaleString('vi-VN')} ₫
          </Text>
          {singleVariant.stock !== undefined && (
            <Text style={[
              styles.stockInfo,
              singleVariant.stock > 0 ? styles.inStock : styles.outOfStock,
            ]}>
              {singleVariant.stock > 0 ? `Còn ${singleVariant.stock} sản phẩm` : 'Hết hàng'}
            </Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Show variant info even if no selectors needed */}
      {currentVariant && (
        <View style={styles.variantInfo}>
          <Text style={styles.variantPrice}>
            {currentVariant.price?.toLocaleString('vi-VN')} ₫
          </Text>
          {currentVariant.stock !== undefined && (
            <Text style={[
              styles.stockInfo,
              currentVariant.stock > 0 ? styles.inStock : styles.outOfStock,
            ]}>
              {currentVariant.stock > 0 ? `Còn ${currentVariant.stock} sản phẩm` : 'Hết hàng'}
            </Text>
          )}
        </View>
      )}

      {/* Color Selection - Grid layout */}
      {getAvailableColors(selectedSize).length > 1 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Màu sắc</Text>
          <View style={styles.colorGrid}>
            {getAvailableColors(selectedSize).map((color, index) => {
              // Find the variant to get hex_code for color
              const variant = productVariants.find(v => v.color === color);
              const hexCode = variant?.hex_code || color;
              const isHot = index === 0; // First color is hot
              
              return (
                <View key={color} style={styles.colorItemContainer}>
                  <TouchableOpacity
                    style={[
                      styles.colorOption,
                      { backgroundColor: hexCode },
                      selectedColor === color && styles.selectedColorOption,
                    ]}
                    onPress={() => handleColorSelect(color)}
                  >
                    {isHot && (
                      <View style={styles.hotLabel}>
                        <Text style={styles.hotText}>Hot</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  <Text style={styles.colorName}>{color}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Size Selection - Horizontal layout */}
      {getAvailableSizes().length > 1 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kích cỡ</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsContainer}>
            {getAvailableSizes().map((size) => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.optionButton,
                  selectedSize === size && styles.selectedOption,
                ]}
                onPress={() => handleSizeSelect(size)}
              >
                <Text style={[
                  styles.optionText,
                  selectedSize === size && styles.selectedOptionText,
                ]}>
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  optionsContainer: {
    flexDirection: 'row',
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  selectedOption: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  optionText: {
    fontSize: 14,
    color: '#666',
  },
  selectedOptionText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorItemContainer: {
    alignItems: 'center',
    width: 80,
  },
  colorOption: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    marginBottom: 4,
    position: 'relative',
  },
  selectedColorOption: {
    borderColor: '#3b82f6',
    borderWidth: 3,
  },
  hotLabel: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#dc2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  hotText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  colorName: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  variantInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  variantPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  stockInfo: {
    fontSize: 14,
    fontWeight: '500',
  },
  inStock: {
    color: '#16a34a',
  },
  outOfStock: {
    color: '#dc2626',
  },
});

export default ProductVariantSelector; 