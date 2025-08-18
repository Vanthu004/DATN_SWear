# Chức Năng Lịch Sử Tìm Kiếm - Search History

## Tổng quan
Dự án đã được tích hợp đầy đủ chức năng quản lý lịch sử tìm kiếm thông minh để cải thiện trải nghiệm tìm kiếm của người dùng.

## Các Chức Năng Đã Tích Hợp

### 1. Từ Khóa Phổ Biến - PopularKeywords.js
- **Vị trí**: Màn hình tìm kiếm (`app/Screens/SearchSc.js`)
- **Chức năng**: 
  - Hiển thị từ khóa tìm kiếm phổ biến theo tuần
  - Có badge ranking cho top 3 từ khóa
  - Hiển thị số lượt tìm kiếm
- **Component**: `PopularKeywords.js`

### 2. Lịch Sử Tìm Kiếm - SearchHistory.js
- **Vị trí**: Màn hình tìm kiếm (`app/Screens/SearchSc.js`)
- **Chức năng**:
  - Hiển thị lịch sử tìm kiếm gần đây của user
  - Có thể xóa từng lịch sử hoặc xóa tất cả
  - Hiển thị thời gian tìm kiếm và số kết quả
  - Chỉ hiển thị khi user đã đăng nhập
- **Component**: `SearchHistory.js`

### 3. Gợi Ý Tìm Kiếm Thông Minh - SmartSearchSuggestions.js
- **Vị trí**: Màn hình tìm kiếm (`app/Screens/SearchSc.js`)
- **Chức năng**:
  - Gợi ý dựa trên lịch sử và từ khóa phổ biến
  - Highlight từ khóa tìm kiếm
  - Phân biệt nguồn gợi ý (lịch sử/phổ biến)
  - Chỉ hiển thị khi user đã đăng nhập
- **Component**: `SmartSearchSuggestions.js`

## Cấu Trúc Files

### API Functions (`app/utils/api.js`)
```javascript
// Lấy từ khóa tìm kiếm phổ biến
export const getPopularKeywords = async (limit = 10, timeRange = 'all')

// Lấy từ khóa phổ biến thời gian thực
export const getRealtimePopularKeywords = async (limit = 10, hours = 24)

// Lấy lịch sử tìm kiếm của user
export const getSearchHistory = async (limit = 10)

// Lấy lịch sử tìm kiếm gần đây
export const getRecentSearchHistory = async (limit = 5)

// Lấy gợi ý tìm kiếm thông minh
export const getSearchSuggestions = async (keyword, limit = 5)

// Thêm lịch sử tìm kiếm
export const addSearchHistory = async (searchData)

// Xóa lịch sử tìm kiếm
export const deleteSearchHistory = async (keyword = null)

// Lấy thống kê tìm kiếm
export const getSearchStats = async (timeRange = 'all')
```

### Components
- **`PopularKeywords.js`**: Hiển thị từ khóa phổ biến
- **`SearchHistory.js`**: Hiển thị lịch sử tìm kiếm
- **`SmartSearchSuggestions.js`**: Hiển thị gợi ý thông minh

### Custom Hooks (`app/hooks/useSearchHistory.js`)
- **`useSearchHistory`**: Quản lý search history chính
- **`useRealtimePopularKeywords`**: Quản lý từ khóa thời gian thực

## Cách Sử Dụng

### 1. Tích Hợp Vào Màn Hình Mới
```javascript
import { useSearchHistory } from '../hooks/useSearchHistory';
import PopularKeywords from '../components/PopularKeywords';
import SearchHistory from '../components/SearchHistory';

const MyScreen = () => {
  const {
    popularKeywords,
    recentHistory,
    loading,
    fetchPopularKeywords,
    fetchRecentHistory,
    addToSearchHistory
  } = useSearchHistory();
  
  useEffect(() => {
    fetchPopularKeywords(8, 'week');
    fetchRecentHistory(5);
  }, []);
  
  return (
    <View>
      <PopularKeywords
        keywords={popularKeywords}
        loading={loading}
        onKeywordPress={(keyword) => console.log(keyword)}
      />
      <SearchHistory
        history={recentHistory}
        loading={loading}
        onKeywordPress={(keyword) => console.log(keyword)}
        onDeleteHistory={(keyword) => console.log('delete', keyword)}
      />
    </View>
  );
};
```

### 2. Sử Dụng Smart Suggestions
```javascript
import { useSearchHistory } from '../hooks/useSearchHistory';
import SmartSearchSuggestions from '../components/SmartSearchSuggestions';

const MyComponent = () => {
  const {
    searchSuggestions,
    fetchSearchSuggestions
  } = useSearchHistory();
  
  const handleInputChange = (text) => {
    if (text.length >= 2) {
      fetchSearchSuggestions(text);
    }
  };
  
  return (
    <View>
      <TextInput onChangeText={handleInputChange} />
      <SmartSearchSuggestions
        suggestions={searchSuggestions}
        currentKeyword={input}
        onSelectSuggestion={(keyword) => console.log(keyword)}
      />
    </View>
  );
};
```

## API Endpoints Cần Thiết

Để chức năng hoạt động, backend cần cung cấp các endpoint sau:

1. **GET** `/api/search-history/popular?limit=...&timeRange=...`
2. **GET** `/api/search-history/realtime-popular?limit=...&hours=...`
3. **GET** `/api/search-history/history?limit=...`
4. **GET** `/api/search-history/recent?limit=...`
5. **GET** `/api/search-history/suggestions?keyword=...&limit=...`
6. **POST** `/api/search-history/add`
7. **DELETE** `/api/search-history/delete`
8. **GET** `/api/search-history/stats?timeRange=...`

## Tính Năng Nâng Cao

### Debounced Search
- Tự động tìm kiếm sau 300ms khi người dùng ngừng gõ
- Tối ưu hiệu suất và giảm số lượng API calls

### User Authentication
- Chỉ lưu lịch sử cho user đã đăng nhập
- Hiển thị lịch sử cá nhân riêng biệt

### Smart Suggestions
- Kết hợp lịch sử cá nhân và từ khóa phổ biến
- Highlight từ khóa tìm kiếm
- Phân biệt nguồn gợi ý

### Error Handling
- Xử lý lỗi gracefully
- Fallback khi không có dữ liệu

## Trải Nghiệm Người Dùng

### 1. Màn Hình Tìm Kiếm Trống
- Hiển thị từ khóa phổ biến tuần này
- Hiển thị lịch sử tìm kiếm gần đây (nếu đã đăng nhập)

### 2. Khi Gõ Từ Khóa
- Từ 2 ký tự: Hiển thị gợi ý sản phẩm
- Nếu đã đăng nhập: Hiển thị thêm gợi ý thông minh
- Ẩn lịch sử và từ khóa phổ biến

### 3. Khi Chọn Gợi Ý
- Tự động lưu vào lịch sử (nếu đã đăng nhập)
- Thực hiện tìm kiếm ngay lập tức
- Ẩn tất cả gợi ý

### 4. Quản Lý Lịch Sử
- Có thể xóa từng lịch sử riêng lẻ
- Có thể xóa tất cả lịch sử
- Hiển thị thời gian tìm kiếm

## Lưu Ý Khi Phát Triển

1. **Performance**: Sử dụng debouncing cho search suggestions
2. **Memory**: Clear timers và state khi component unmount
3. **Authentication**: Kiểm tra user login trước khi lưu lịch sử
4. **Error Boundaries**: Xử lý lỗi API gracefully
5. **Offline Support**: Cache dữ liệu cơ bản cho offline

## Tương Lai

- [ ] Tích hợp machine learning để cải thiện gợi ý
- [ ] Thêm analytics để theo dõi hiệu quả tìm kiếm
- [ ] A/B testing cho các thuật toán gợi ý khác nhau
- [ ] Cache lịch sử local để giảm API calls
- [ ] Sync lịch sử giữa các thiết bị
- [ ] Thêm filter và sort cho lịch sử
