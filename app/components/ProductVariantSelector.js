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
    setSelectedSize(null);
    setSelectedColor(null);
  }, [productVariants]);

  useEffect(() => {
    if (selectedColor && selectedSize) {
      const matchedVariant = productVariants.find(v =>
        v.attributes.color._id === selectedColor._id &&
        v.attributes.size._id === selectedSize._id
      );
      onVariantChange(matchedVariant || null);
    } else {
      onVariantChange(null);
    }
  }, [selectedColor, selectedSize]);

  if (!productVariants || productVariants.length === 0) return null;

  const allSizes = Array.from(
    new Set(productVariants.map(v => JSON.stringify(v.attributes.size)))
  ).map(s => JSON.parse(s));

  const allColors = Array.from(
    new Set(productVariants.map(v => JSON.stringify(v.attributes.color)))
  ).map(c => JSON.parse(c));

  // Nếu đã chọn màu => chỉ lấy size phù hợp với màu đó
  const availableSizes = selectedColor
    ? allSizes.filter(size =>
        productVariants.some(v =>
          v.attributes.color._id === selectedColor._id &&
          v.attributes.size._id === size._id
        )
      )
    : allSizes;

  const availableColors = allColors; // ✅ Luôn hiển thị mọi màu

  return (
    <View style={styles.container}>
      {/* Màu sắc */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Màu sắc</Text>
        <View style={styles.colorGrid}>
          {allColors.map((color) => {
            const isAvailable = productVariants.some(v =>
              v.attributes.color._id === color._id
            );
            const isSelected = selectedColor?._id === color._id;

            return (
              <TouchableOpacity
                key={color._id}
                style={[
                  styles.colorBox,
                  isSelected && styles.selectedBox,
                  !isAvailable && styles.disabledOption
                ]}
                onPress={() => {
                  setSelectedColor(color);

                  // Nếu size hiện tại không hợp lệ với màu mới => reset size
                  const stillValidSize = productVariants.some(
                    v => v.attributes.color._id === color._id &&
                         v.attributes.size._id === selectedSize?._id
                  );
                  if (!stillValidSize) {
                    setSelectedSize(null);
                  }
                }}
                disabled={!isAvailable}
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsContainer}>
          {allSizes.map((size) => {
            const isAvailable = availableSizes.some(s => s._id === size._id);
            const isSelected = selectedSize?._id === size._id;
            return (
              <TouchableOpacity
                key={size._id}
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
                  {size.name}
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
  container: { marginVertical: 10 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#333' },
  optionsContainer: { flexDirection: 'row' },
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
  optionText: { fontSize: 14, color: '#666' },
  selectedOptionText: { color: '#3b82f6', fontWeight: '600' },
  disabledOption: { opacity: 0.4 },
  disabledText: { color: '#aaa' },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
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
  colorText: { fontSize: 14, color: '#333' },
  selectedText: { color: '#ec4899', fontWeight: 'bold' },
});

export default ProductVariantSelector;
