# Chức Năng Gợi Ý Sản Phẩm - Product Suggestions

## Tổng quan
Dự án đã được tích hợp đầy đủ các chức năng gợi ý sản phẩm thông minh để cải thiện trải nghiệm tìm kiếm và mua sắm của người dùng.

## Các Chức Năng Đã Tích Hợp

### 1. Gợi Ý Sản Phẩm (Autocomplete) - SearchSc.js
- **Vị trí**: Màn hình tìm kiếm (`app/Screens/SearchSc.js`)
- **Chức năng**: 
  - Hiển thị gợi ý sản phẩm khi người dùng gõ từ khóa (từ 2 ký tự trở lên)
  - Debounced search để tối ưu hiệu suất
  - Gợi ý hiển thị tên, giá, danh mục và hình ảnh sản phẩm
- **Component**: `ProductSuggestions.js`

### 2. Sản Phẩm Liên Quan - ProductDetailScreen.js
- **Vị trí**: Màn hình chi tiết sản phẩm (`app/Screens/ProductDetailScreen.js`)
- **Chức năng**:
  - Hiển thị sản phẩm liên quan dựa trên sản phẩm hiện tại
  - Tự động tải khi vào màn hình chi tiết
  - Có thể xem tất cả sản phẩm liên quan
- **Component**: `RelatedProducts.js`

### 3. Sản Phẩm Phổ Biến (Trending) - HomeScreen.js
- **Vị trí**: Màn hình chính (`app/Screens/HomeScreen.js`)
- **Chức năng**:
  - Hiển thị sản phẩm phổ biến theo tuần
  - Có badge hiển thị điểm phổ biến
  - Có thể xem tất cả sản phẩm trending
- **Component**: `TrendingProducts.js`

### 4. Gợi Ý Cá Nhân Hóa - HomeScreen.js
- **Vị trí**: Màn hình chính (`app/Screens/HomeScreen.js`)
- **Chức năng**:
  - Hiển thị gợi ý dành riêng cho người dùng đã đăng nhập
  - Dựa trên lịch sử và sở thích người dùng
  - Chỉ hiển thị khi có người dùng đăng nhập
- **Component**: `RelatedProducts.js` (tái sử dụng)

## Cấu Trúc Files

### API Functions (`app/utils/api.js`)
```javascript
// Gợi ý sản phẩm (Autocomplete)
export const getProductSuggestions = async (keyword, limit = 8)

// Sản phẩm liên quan
export const getRelatedProducts = async (productId, limit = 6)

// Sản phẩm phổ biến (Trending)
export const getTrendingProducts = async (limit = 10, timeRange = 'all')

// Gợi ý cá nhân hóa
export const getPersonalizedProducts = async (userId, limit = 8)

// Tìm kiếm nâng cao với gợi ý
export const searchProductsEnhanced = async (params)
```

### Components
- **`ProductSuggestions.js`**: Hiển thị gợi ý tìm kiếm
- **`RelatedProducts.js`**: Hiển thị sản phẩm liên quan
- **`TrendingProducts.js`**: Hiển thị sản phẩm trending

### Custom Hooks (`app/hooks/useProductSuggestions.js`)
- **`useProductSuggestions`**: Quản lý gợi ý tìm kiếm
- **`useRelatedProducts`**: Quản lý sản phẩm liên quan
- **`useTrendingProducts`**: Quản lý sản phẩm trending
- **`usePersonalizedProducts`**: Quản lý gợi ý cá nhân

## Cách Sử Dụng

### 1. Tích Hợp Vào Màn Hình Mới
```javascript
import { useProductSuggestions } from '../hooks/useProductSuggestions';
import ProductSuggestions from '../components/ProductSuggestions';

const MyScreen = () => {
  const { suggestions, loading, searchSuggestions } = useProductSuggestions();
  
  return (
    <View>
      <TextInput 
        onChangeText={(text) => searchSuggestions(text)}
        placeholder="Tìm kiếm..."
      />
      <ProductSuggestions
        suggestions={suggestions}
        loading={loading}
        visible={suggestions.length > 0}
        onSelectSuggestion={(item) => console.log(item)}
        onClose={() => {}}
      />
    </View>
  );
};
```

### 2. Sử Dụng Custom Hooks
```javascript
import { useTrendingProducts } from '../hooks/useProductSuggestions';

const MyComponent = () => {
  const { trendingProducts, loading, fetchTrendingProducts } = useTrendingProducts();
  
  useEffect(() => {
    fetchTrendingProducts(8, 'week');
  }, []);
  
  // Sử dụng trendingProducts và loading
};
```

## API Endpoints Cần Thiết

Để chức năng hoạt động, backend cần cung cấp các endpoint sau:

1. **GET** `/api/products/suggest?keyword=...&limit=...`
2. **GET** `/api/products/related?productId=...&limit=...`
3. **GET** `/api/products/trending?limit=...&timeRange=...`
4. **GET** `/api/products/personalized?userId=...&limit=...`
5. **GET** `/api/products/search/enhanced?keyword=...&page=...&limit=...`

## Tính Năng Nâng Cao

### Debounced Search
- Tự động tìm kiếm sau 300ms khi người dùng ngừng gõ
- Tối ưu hiệu suất và giảm số lượng API calls

### Error Handling
- Xử lý lỗi gracefully
- Hiển thị thông báo lỗi thân thiện với người dùng

### Loading States
- Hiển thị loading indicator khi đang tải dữ liệu
- Trải nghiệm người dùng mượt mà

### Responsive Design
- Components tự động điều chỉnh theo kích thước màn hình
- Hỗ trợ cả portrait và landscape

## Lưu Ý Khi Phát Triển

1. **Performance**: Sử dụng debouncing cho search suggestions
2. **Memory**: Clear timers và state khi component unmount
3. **Error Boundaries**: Xử lý lỗi API gracefully
4. **Accessibility**: Đảm bảo components có thể sử dụng với screen readers
5. **Testing**: Test các trường hợp loading, error, và empty state

## Tương Lai

- [ ] Tích hợp machine learning để cải thiện gợi ý
- [ ] Thêm analytics để theo dõi hiệu quả gợi ý
- [ ] A/B testing cho các thuật toán gợi ý khác nhau
- [ ] Cache gợi ý để giảm API calls
- [ ] Offline support cho gợi ý cơ bản
