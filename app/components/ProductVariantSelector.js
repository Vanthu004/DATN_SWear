import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useProductVariant } from '../hooks/useProductVariant';

const ProductVariantSelector = ({ productId, onVariantChange, setSelectedColor, setSelectedSize }) => {
  const {
    variants: productVariants,
    loading,
    error,
  } = useProductVariant(productId);

  const [internalSelectedSize, setInternalSelectedSize] = useState(null);
  const [internalSelectedColor, setInternalSelectedColor] = useState(null);

  useEffect(() => {
    setInternalSelectedSize(null);
    setInternalSelectedColor(null);
  }, [productVariants]);

  useEffect(() => {
    if (internalSelectedColor && internalSelectedSize) {
      const matchedVariant = productVariants.find(v =>
        v.attributes.color._id === internalSelectedColor._id &&
        v.attributes.size._id === internalSelectedSize._id
      );
      onVariantChange(matchedVariant || null);
    } else if (internalSelectedColor && !internalSelectedSize) {
      const matchedByColor = productVariants.find(v =>
        v.attributes.color._id === internalSelectedColor._id
      );
      onVariantChange(matchedByColor || null);
    } else {
      onVariantChange(null);
    }
  }, [internalSelectedColor, internalSelectedSize]);

  if (!productVariants || productVariants.length === 0) return null;

  const allSizes = Array.from(
    new Set(productVariants.map(v => JSON.stringify(v.attributes.size)))
  ).map(s => JSON.parse(s));

  const allColors = Array.from(
    new Set(productVariants.map(v => JSON.stringify(v.attributes.color)))
  ).map(c => JSON.parse(c));

  const availableSizes = internalSelectedColor
    ? allSizes.filter(size =>
        productVariants.some(v =>
          v.attributes.color._id === internalSelectedColor._id &&
          v.attributes.size._id === size._id
        )
      )
    : allSizes;

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
            const isSelected = internalSelectedColor?._id === color._id;

            return (
              <TouchableOpacity
                key={color._id}
                style={[
                  styles.colorBox,
                  isSelected && styles.selectedBox,
                  !isAvailable && styles.disabledOption
                ]}
                onPress={() => {
                  setInternalSelectedColor(color);
                  setSelectedColor && setSelectedColor(color);

                  const stillValidSize = productVariants.some(
                    v => v.attributes.color._id === color._id &&
                         v.attributes.size._id === internalSelectedSize?._id
                  );
                  if (!stillValidSize) {
                    setInternalSelectedSize(null);
                    setSelectedSize && setSelectedSize(null);
                  }
                }}
                disabled={!isAvailable}
              >
                <Text style={[
                  styles.colorText,
                  isSelected && styles.selectedText
                ]}>
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
            const isSelected = internalSelectedSize?._id === size._id;

            return (
              <TouchableOpacity
                key={size._id}
                style={[
                  styles.optionButton,
                  isSelected && styles.selectedOption,
                  !isAvailable && styles.disabledOption
                ]}
                onPress={() => {
                  if (isAvailable) {
                    setInternalSelectedSize(size);
                    setSelectedSize && setSelectedSize(size);
                  }
                }}
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
  container: { marginVertical: 10,marginHorizontal: 16 },
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
    borderColor: '#3b82f6',
    backgroundColor: '#fdf2f8',
  },
  colorText: { fontSize: 14, color: '#333' },
  selectedText: { color: '#3b82f6', fontWeight: 'bold' },
});

export default ProductVariantSelector;
