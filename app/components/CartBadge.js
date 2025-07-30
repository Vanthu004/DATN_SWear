import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useCart } from '../hooks/useCart';

const CartBadge = ({ style }) => {
  const { cartCount } = useCart();

  if (cartCount === 0) return null;

  return (
    <View style={[styles.badge, style]}>
      <Text style={styles.badgeText}>{cartCount}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4, // cao hơn một chút để không bị che
    right: -8, // lệch phải nhiều hơn để tránh bị đè lên icon
    backgroundColor: '#FF5252',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99, // đảm bảo luôn nổi trên icon
    elevation: 5, // giúp hiển thị tốt hơn trên Android
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 3,
  },
});

export default CartBadge;
