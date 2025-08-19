import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const ProductVariantInfo = ({ product }) => {
  if (!product.variants || product.variants.length === 0) {
    return null;
  }

  const variants = product.variants;
  const availableSizes = [...new Set(variants.map(v => v.size))].filter(Boolean);
  const availableColors = [...new Set(variants.map(v => v.color))].filter(Boolean);
  
  // Tính tổng stock từ tất cả variants
  const totalStock = variants.reduce((sum, variant) => {
    const variantStock = variant.stock_quantity || variant.stock || variant.quantity || 0;
    return sum + variantStock;
  }, 0);
  
  // Kiểm tra có hết hàng không
  const isOutOfStock = totalStock <= 0;

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
      {/* Hiển thị thông tin stock */}
      <Text style={[
        styles.stockText,
        isOutOfStock ? styles.outOfStockText : styles.inStockText
      ]}>
        {isOutOfStock ? 'Hết hàng' : `Còn ${totalStock} sản phẩm`}
      </Text>
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
  stockText: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  inStockText: {
    color: '#16a34a',
  },
  outOfStockText: {
    color: '#dc2626',
  },
});

export default ProductVariantInfo; 