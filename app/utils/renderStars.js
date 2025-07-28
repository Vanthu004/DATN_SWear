// app/utils/renderStars.js
import { Ionicons } from '@expo/vector-icons'; // hoặc FontAwesome nếu bạn dùng nó
import React from 'react';
import { View } from 'react-native';

export const renderStars = (rating) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <Ionicons
        key={i}
        name={i <= rating ? 'star' : 'star-outline'}
        size={16}
        color="gold"
      />
    );
  }
  return <View style={{ flexDirection: 'row' }}>{stars}</View>;
};
