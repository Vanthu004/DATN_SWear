import React from 'react';
import { Platform, Text } from 'react-native';

/**
 * Typography component that provides consistent text styling across the app
 * Uses safe system fonts to avoid crashes
 */

// Helper function to get safe font family
const getSafeFontFamily = () => {
  if (Platform.OS === 'ios') {
    return 'System';
  } else {
    return 'Roboto';
  }
};

// Helper function to get safe typography style
const getSafeTypographyStyle = (baseStyle) => {
  return {
    ...baseStyle,
    fontFamily: getSafeFontFamily(),
  };
};

// Page Title - Large, bold text for main page headers
export const PageTitle = ({ children, style, ...props }) => (
  <Text style={[getSafeTypographyStyle({
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 37.5,
  }), style]} {...props}>
    {children}
  </Text>
);

// Section Header - Medium, bold text for section titles
export const SectionHeader = ({ children, style, ...props }) => (
  <Text style={[getSafeTypographyStyle({
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
  }), style]} {...props}>
    {children}
  </Text>
);

// Card Title - Bold text for card headers
export const CardTitle = ({ children, style, ...props }) => (
  <Text style={[getSafeTypographyStyle({
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 25,
  }), style]} {...props}>
    {children}
  </Text>
);

// Button Text - Bold text for buttons and CTAs
export const ButtonText = ({ children, style, ...props }) => (
  <Text style={[getSafeTypographyStyle({
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
  }), style]} {...props}>
    {children}
  </Text>
);

// Body Text - Regular text for main content
export const BodyText = ({ children, style, ...props }) => (
  <Text style={[getSafeTypographyStyle({
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  }), style]} {...props}>
    {children}
  </Text>
);

// Caption Text - Small text for captions and secondary info
export const CaptionText = ({ children, style, ...props }) => (
  <Text style={[getSafeTypographyStyle({
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 21,
  }), style]} {...props}>
    {children}
  </Text>
);

// Input Text - Text for input fields
export const InputText = ({ children, style, ...props }) => (
  <Text style={[getSafeTypographyStyle({
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  }), style]} {...props}>
    {children}
  </Text>
);

// Label Text - Text for form labels
export const LabelText = ({ children, style, ...props }) => (
  <Text style={[getSafeTypographyStyle({
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 21,
  }), style]} {...props}>
    {children}
  </Text>
);

// Custom Typography component with variant prop
export const Typography = ({ 
  variant = 'body', 
  children, 
  style, 
  ...props 
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'pageTitle':
        return { fontSize: 30, fontWeight: '700', lineHeight: 37.5 };
      case 'sectionHeader':
        return { fontSize: 24, fontWeight: '700', lineHeight: 30 };
      case 'cardTitle':
        return { fontSize: 20, fontWeight: '700', lineHeight: 25 };
      case 'button':
        return { fontSize: 16, fontWeight: '700', lineHeight: 24 };
      case 'body':
        return { fontSize: 16, fontWeight: '400', lineHeight: 24 };
      case 'caption':
        return { fontSize: 14, fontWeight: '400', lineHeight: 21 };
      case 'input':
        return { fontSize: 16, fontWeight: '400', lineHeight: 24 };
      case 'label':
        return { fontSize: 14, fontWeight: '500', lineHeight: 21 };
      default:
        return { fontSize: 16, fontWeight: '400', lineHeight: 24 };
    }
  };

  return (
    <Text style={[getSafeTypographyStyle(getVariantStyle()), style]} {...props}>
      {children}
    </Text>
  );
};

// Export all components
export default Typography;
