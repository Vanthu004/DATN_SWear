import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const ProductVariantInfo = ({ product }) => {
  if (!product.variants || product.variants.length === 0) {
    return null;
  }

  const variants = product.variants;
  const availableSizes = [...new Set(variants.map(v => v.size))].filter(Boolean);
  const availableColors = [...new Set(variants.map(v => v.color))].filter(Boolean);

  return (
    <View style={styles.container}>
      {availableSizes.length > 0 && (
        <Text style={styles.variantText}>
          Size: {availableSizes.join(', ')}
        </Text>
      )}
      {availableColors.length > 0 && (
        <Text style={styles.variantText}>
          Màu: {availableColors.length} màu
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
  },
  variantText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
});

export default ProductVariantInfo; 