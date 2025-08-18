# Hệ thống Font mới cho SWear App

## Tổng quan
Hệ thống font mới được thiết kế để cung cấp trải nghiệm đọc tốt hơn và giao diện nhất quán trên toàn bộ app.

## Cài đặt Fonts

### 1. Tải fonts
```bash
npm run install-fonts
```

Script này sẽ tải các font cần thiết từ Google Fonts và lưu vào thư mục `assets/fonts/`.

### 2. Fonts được cài đặt

#### Headings & CTAs (Tiêu đề & Nút bấm)
- **Montserrat-Bold**: Font chính cho tiêu đề, nổi bật và dễ đọc
- **DIN-Bold**: Font thay thế cho tiêu đề, hiện đại và chuyên nghiệp
- **Futura-Bold**: Font thay thế khác, cổ điển và thanh lịch

#### Body & Descriptions (Nội dung & Mô tả)
- **Roboto-Regular**: Font chính cho nội dung, dễ đọc trên mobile
- **OpenSans-Regular**: Font thay thế, thân thiện và dễ tiếp cận
- **HelveticaNeue-Regular**: Font thay thế, sạch sẽ và chuyên nghiệp

#### Mobile UI
- **Inter-Regular**: Font hiện đại cho giao diện mobile
- **SFPro-Regular**: Font tối ưu cho iOS
- **Roboto-Regular**: Font tối ưu cho Android

## Sử dụng Fonts

### 1. Sử dụng Typography Components

```jsx
import { 
  PageTitle, 
  SectionHeader, 
  CardTitle, 
  ButtonText, 
  BodyText, 
  CaptionText 
} from './app/components/Typography';

// Tiêu đề trang
<PageTitle>Chào mừng đến với SWear</PageTitle>

// Tiêu đề section
<SectionHeader>Sản phẩm nổi bật</SectionHeader>

// Tiêu đề card
<CardTitle>Tên sản phẩm</CardTitle>

// Nút bấm
<ButtonText>Thêm vào giỏ hàng</ButtonText>

// Nội dung chính
<BodyText>Mô tả chi tiết về sản phẩm...</BodyText>

// Chú thích
<CaptionText>Giá đã bao gồm VAT</CaptionText>
```

### 2. Sử dụng Typography Component với variant

```jsx
import Typography from './app/components/Typography';

<Typography variant="pageTitle">Tiêu đề trang</Typography>
<Typography variant="sectionHeader">Tiêu đề section</Typography>
<Typography variant="cardTitle">Tiêu đề card</Typography>
<Typography variant="button">Nút bấm</Typography>
<Typography variant="body">Nội dung chính</Typography>
<Typography variant="caption">Chú thích</Typography>
<Typography variant="input">Văn bản input</Typography>
<Typography variant="label">Nhãn form</Typography>
```

### 3. Sử dụng Fonts trực tiếp

```jsx
import { Fonts } from '../constants/Fonts';

const styles = StyleSheet.create({
  title: {
    ...Fonts.heading.primary,
    fontSize: Fonts.sizes['2xl'],
    lineHeight: Fonts.lineHeights.tight,
  },
  content: {
    ...Fonts.body.primary,
    fontSize: Fonts.sizes.base,
    lineHeight: Fonts.lineHeights.normal,
  },
});
```

## Cấu trúc Font System

### Fonts Object
```typescript
export const Fonts = {
  heading: {
    primary: { fontFamily: 'Montserrat-Bold', fontWeight: '700' },
    secondary: { fontFamily: 'DIN-Bold', fontWeight: '700' },
    tertiary: { fontFamily: 'Futura-Bold', fontWeight: '700' },
  },
  body: {
    primary: { fontFamily: 'Roboto-Regular', fontWeight: '400' },
    secondary: { fontFamily: 'OpenSans-Regular', fontWeight: '400' },
    tertiary: { fontFamily: 'HelveticaNeue-Regular', fontWeight: '400' },
  },
  mobile: {
    android: { fontFamily: 'Roboto-Regular', fontWeight: '400' },
    ios: { fontFamily: 'SFPro-Regular', fontWeight: '400' },
    cross: { fontFamily: 'Inter-Regular', fontWeight: '400' },
  },
  weights: { light: '300', regular: '400', medium: '500', semiBold: '600', bold: '700', extraBold: '800' },
  sizes: { xs: 12, sm: 14, base: 16, lg: 18, xl: 20, '2xl': 24, '3xl': 30, '4xl': 36, '5xl': 48, '6xl': 60 },
  lineHeights: { tight: 1.25, normal: 1.5, relaxed: 1.75 },
};
```

### Typography Presets
```typescript
export const Typography = {
  pageTitle: { ...Fonts.heading.primary, fontSize: Fonts.sizes['3xl'], lineHeight: Fonts.lineHeights.tight },
  sectionHeader: { ...Fonts.heading.primary, fontSize: Fonts.sizes['2xl'], lineHeight: Fonts.lineHeights.tight },
  cardTitle: { ...Fonts.heading.secondary, fontSize: Fonts.sizes.xl, lineHeight: Fonts.lineHeights.tight },
  button: { ...Fonts.heading.tertiary, fontSize: Fonts.sizes.base, lineHeight: Fonts.lineHeights.normal },
  body: { ...Fonts.body.primary, fontSize: Fonts.sizes.base, lineHeight: Fonts.lineHeights.normal },
  caption: { ...Fonts.body.secondary, fontSize: Fonts.sizes.sm, lineHeight: Fonts.lineHeights.normal },
  input: { ...Fonts.body.primary, fontSize: Fonts.sizes.base, lineHeight: Fonts.lineHeights.normal },
  label: { ...Fonts.body.medium, fontSize: Fonts.sizes.sm, lineHeight: Fonts.lineHeights.normal },
};
```

## Hook useFonts

```jsx
import useFonts from './app/hooks/useFonts';

const { fontsLoaded, fontError, getPlatformFont, getFallbackFont } = useFonts();

if (!fontsLoaded) {
  return <LoadingScreen />;
}

if (fontError) {
  return <ErrorScreen error={fontError} />;
}
```

## Platform-specific Fonts

### iOS
- Headings: SF Pro Bold
- Body: SF Pro Regular
- Fallback: System

### Android
- Headings: Roboto Bold
- Body: Roboto Regular
- Fallback: Roboto

## Fallback Strategy

1. **Primary fonts**: Fonts tùy chỉnh (Montserrat, Roboto, etc.)
2. **Platform fonts**: Fonts mặc định của hệ thống (SF Pro, Roboto)
3. **System fonts**: Fonts fallback cuối cùng

## Best Practices

### 1. Sử dụng Typography Components
- Đảm bảo tính nhất quán
- Dễ dàng thay đổi font toàn bộ app
- Tự động áp dụng line-height và spacing

### 2. Font Hierarchy
- **PageTitle**: Tiêu đề chính của trang
- **SectionHeader**: Tiêu đề section
- **CardTitle**: Tiêu đề card/sản phẩm
- **ButtonText**: Văn bản nút bấm
- **BodyText**: Nội dung chính
- **CaptionText**: Chú thích, thông tin phụ

### 3. Responsive Typography
```jsx
const styles = StyleSheet.create({
  title: {
    ...Typography.pageTitle,
    fontSize: isSmallScreen ? Fonts.sizes['2xl'] : Fonts.sizes['3xl'],
  },
});
```

## Troubleshooting

### Font không load được
1. Kiểm tra `assets/fonts/` có đầy đủ file .ttf
2. Chạy `npm run install-fonts` để tải lại
3. Kiểm tra console log để xem lỗi

### Font hiển thị không đúng
1. Kiểm tra tên font trong constants/Fonts.ts
2. Đảm bảo font file đã được load trong useFonts hook
3. Sử dụng fallback fonts nếu cần

## Migration từ Font cũ

1. Thay thế `fontFamily` cũ bằng Typography components
2. Cập nhật StyleSheet để sử dụng Fonts constants
3. Test trên cả iOS và Android để đảm bảo tương thích
