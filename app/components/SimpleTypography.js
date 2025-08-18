import React from 'react';
import { Text } from 'react-native';

/**
 * Simple Typography components for testing
 * No complex logic, just basic text styling
 */

export const SimpleTitle = ({ children, style, ...props }) => (
  <Text style={[{
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  }, style]} {...props}>
    {children}
  </Text>
);

export const SimpleBody = ({ children, style, ...props }) => (
  <Text style={[{
    fontSize: 16,
    fontWeight: 'normal',
    color: '#333',
  }, style]} {...props}>
    {children}
  </Text>
);

export const SimpleCaption = ({ children, style, ...props }) => (
  <Text style={[{
    fontSize: 14,
    fontWeight: 'normal',
    color: '#666',
  }, style]} {...props}>
    {children}
  </Text>
);

export default SimpleTitle;
