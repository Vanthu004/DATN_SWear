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
    loading,
    error,
    getAvailableSizes,
    getAvailableColors,
    getVariantBySizeAndColor,
  } = useProductVariant(productId);

  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  useEffect(() => {
    // Không chọn mặc định size/color khi mở modal
    setSelectedSize(null);
    setSelectedColor(null);
  }, [productVariants]);

  useEffect(() => {
    if (selectedSize && selectedColor) {
      const variant = getVariantBySizeAndColor(selectedSize, selectedColor);
      if (variant && onVariantChange) {
        onVariantChange(variant);
      }
    } else {
      onVariantChange(null); // Bắt buộc phải chọn đủ cả 2
    }
  }, [selectedSize, selectedColor]);

  if (productVariants.length === 0) return null;

  const availableSizes = selectedColor ? productVariants
    .filter(v => v.color === selectedColor)
    .map(v => v.size) : getAvailableSizes();

  const availableColors = selectedSize ? productVariants
    .filter(v => v.size === selectedSize)
    .map(v => v.color) : getAvailableColors();

  return (
    <View style={styles.container}>
      {/* Màu sắc */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Màu sắc</Text>
        <View style={styles.colorGrid}>
         {getAvailableColors(selectedSize).map((color) =>{
            const isAvailable = availableColors.includes(color);
            const isSelected = selectedColor === color;
            return (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorBox,
                  isSelected && styles.selectedBox,
                  !isAvailable && styles.disabledOption
                ]}
                onPress={() => isAvailable && setSelectedColor(color)}
                disabled={!isAvailable}
              >
                <Text style={[styles.colorText, isSelected && styles.selectedText]}>
                  {color}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Kích cỡ */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kích cỡ</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsContainer}>
          {getAvailableSizes().map((size) => {
            const isAvailable = availableSizes.includes(size);
            const isSelected = selectedSize === size;
            return (
              <TouchableOpacity
                key={size}
                style={[
                  styles.optionButton,
                  isSelected && styles.selectedOption,
                  !isAvailable && styles.disabledOption
                ]}
                onPress={() => isAvailable && setSelectedSize(size)}
                disabled={!isAvailable}
              >
                <Text style={[
                  styles.optionText,
                  isSelected && styles.selectedOptionText,
                  !isAvailable && styles.disabledText
                ]}>
                  {size}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
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
  disabledOption: {
    opacity: 0.4,
  },
  disabledText: {
    color: '#aaa',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorBox: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    marginBottom: 8,
    marginRight: 8,
  },
  selectedBox: {
    borderColor: '#ec4899',
    backgroundColor: '#fdf2f8',
  },
  colorText: {
    fontSize: 14,
    color: '#333',
  },
  selectedText: {
    color: '#ec4899',
    fontWeight: 'bold',
  },
});

export default ProductVariantSelector;
