/**
 * Font system for the entire app
 * 
 * Typography hierarchy:
 * - Headings/CTAs: Bold, prominent fonts (System fonts for safety)
 * - Body/Descriptions: Readable fonts (System fonts for safety)
 * - Mobile UI: System fonts for safety
 */

// Helper function to get safe system fonts based on platform
const getSafeSystemFonts = () => {
  return {
    heading: {
      primary: { fontFamily: 'System', fontWeight: '700' as const },
      secondary: { fontFamily: 'System', fontWeight: '700' as const },
      tertiary: { fontFamily: 'System', fontWeight: '700' as const },
    },
    body: {
      primary: { fontFamily: 'System', fontWeight: '400' as const },
      secondary: { fontFamily: 'System', fontWeight: '400' as const },
      tertiary: { fontFamily: 'System', fontWeight: '400' as const },
      medium: { fontFamily: 'System', fontWeight: '500' as const },
    },
    mobile: {
      android: { fontFamily: 'Roboto', fontWeight: '400' as const },
      ios: { fontFamily: 'System', fontWeight: '400' as const },
      cross: { fontFamily: 'System', fontWeight: '400' as const },
    },
  };
};

export const Fonts = getSafeSystemFonts();

// Font weights for different purposes
export const FontWeights = {
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
  extraBold: '800' as const,
};

// Font sizes for consistent typography
export const FontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  '6xl': 60,
};

// Line heights for better readability
export const LineHeights = {
  tight: 1.25,
  normal: 1.5,
  relaxed: 1.75,
};

// Typography presets for common use cases
export const Typography = {
  // Page titles
  pageTitle: {
    ...Fonts.heading.primary,
    fontSize: FontSizes['3xl'],
    lineHeight: LineHeights.tight,
  },

  // Section headers
  sectionHeader: {
    ...Fonts.heading.primary,
    fontSize: FontSizes['2xl'],
    lineHeight: LineHeights.tight,
  },

  // Card titles
  cardTitle: {
    ...Fonts.heading.secondary,
    fontSize: FontSizes.xl,
    lineHeight: LineHeights.tight,
  },

  // Button text
  button: {
    ...Fonts.heading.tertiary,
    fontSize: FontSizes.base,
    lineHeight: LineHeights.normal,
  },

  // Body text
  body: {
    ...Fonts.body.primary,
    fontSize: FontSizes.base,
    lineHeight: LineHeights.normal,
  },

  // Caption text
  caption: {
    ...Fonts.body.secondary,
    fontSize: FontSizes.sm,
    lineHeight: LineHeights.normal,
  },

  // Input text
  input: {
    ...Fonts.body.primary,
    fontSize: FontSizes.base,
    lineHeight: LineHeights.normal,
  },

  // Label text
  label: {
    ...Fonts.body.medium,
    fontSize: FontSizes.sm,
    lineHeight: LineHeights.normal,
  },
};

// Platform-specific font selection
export const getPlatformFont = (type: 'heading' | 'body' | 'mobile') => {
  if (type === 'heading') {
    return Fonts.heading.primary;
  } else if (type === 'body') {
    return Fonts.body.primary;
  } else {
    return Fonts.mobile.cross;
  }
};

// Function to get fonts with fallback
export const getFontsWithFallback = (useCustomFonts: boolean = false) => {
  // For now, always use system fonts for safety
  return getSafeSystemFonts();
};

export default Fonts;
