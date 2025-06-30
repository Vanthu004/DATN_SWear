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
    top: -6,
    right: -6,
    backgroundColor: '#FF5252',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 2,
  },
});

export default CartBadge; 