import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const ReviewStatusMessage = ({ status, message, onRetry }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'loading':
        return {
          icon: 'hourglass-outline',
          color: '#3b82f6',
          backgroundColor: '#eff6ff'
        };
      case 'error':
        return {
          icon: 'alert-circle-outline',
          color: '#dc2626',
          backgroundColor: '#fef2f2'
        };
      case 'success':
        return {
          icon: 'checkmark-circle-outline',
          color: '#059669',
          backgroundColor: '#f0fdf4'
        };
      case 'warning':
        return {
          icon: 'warning-outline',
          color: '#d97706',
          backgroundColor: '#fffbeb'
        };
      default:
        return {
          icon: 'information-circle-outline',
          color: '#6b7280',
          backgroundColor: '#f9fafb'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <View style={[styles.container, { backgroundColor: config.backgroundColor }]}>
      <Ionicons name={config.icon} size={20} color={config.color} />
      <Text style={[styles.message, { color: config.color }]}>
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  message: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ReviewStatusMessage;
