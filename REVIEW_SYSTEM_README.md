# Hệ thống Đánh giá Sản phẩm - Cải thiện

## Tổng quan
Hệ thống đánh giá sản phẩm đã được cải thiện để giải quyết các vấn đề về logic kiểm tra khả năng đánh giá và trải nghiệm người dùng.

## Các thay đổi chính

### 1. Hook useReview được cải thiện (`app/hooks/useReview.js`)
- **Thêm logic kiểm tra khả năng đánh giá**: `checkCanReview()` kiểm tra xem người dùng đã đánh giá sản phẩm chưa
- **State mới**: 
  - `canReview`: boolean - có thể đánh giá hay không
  - `reviewedProducts`: array - danh sách sản phẩm đã đánh giá
- **Cải thiện error handling**: Hiển thị thông báo lỗi chi tiết hơn
- **Logging**: Thêm console.log để debug
- **Upload ảnh mới**: Sử dụng API `/api/upload/upload` để upload ảnh trước khi tạo review

### 2. ProductDetailScreen được cập nhật (`app/Screens/ProductDetailScreen.js`)
- **Nút đánh giá trực tiếp**: Hiển thị nút "Viết đánh giá" trên trang chi tiết sản phẩm
- **Trạng thái đánh giá**: Hiển thị "Đã đánh giá" nếu người dùng đã đánh giá
- **Navigation**: Chuyển đến WriteReviewScreen với tham số `isDirectReview: true`

### 3. WriteReviewScreen được mở rộng (`app/Screens/WriteReviewScreen.js`)
- **Hỗ trợ đánh giá trực tiếp**: Có thể đánh giá từ trang chi tiết sản phẩm
- **Logic phân biệt**: Xử lý khác nhau cho đánh giá từ đơn hàng vs đánh giá trực tiếp
- **Navigation thông minh**: Quay về trang trước đó sau khi đánh giá thành công
- **Upload ảnh cải tiến**: 
  - Chọn ảnh từ camera hoặc thư viện
  - Upload ảnh lên `/api/upload/upload` trước khi tạo review
  - Nút xóa ảnh đã chọn
  - Hiển thị preview ảnh

### 4. OrderHistoryScreen được cải thiện (`app/Screens/OrderHistoryScreen.js`)
- **Mở rộng điều kiện đánh giá**: Cho phép đánh giá cả đơn hàng "delivered" và "completed"
- **Logic trạng thái**: Cải thiện hàm `getTabKeyFromStatus()`

### 5. Component mới (`app/components/ReviewStatusMessage.js`)
- **Thông báo trạng thái**: Component để hiển thị thông báo lỗi/thành công đẹp mắt
- **Icon động**: Thay đổi icon theo trạng thái
- **Màu sắc**: Phân biệt các loại thông báo bằng màu sắc

## Cách sử dụng

### Đánh giá từ trang chi tiết sản phẩm
1. Vào trang chi tiết sản phẩm
2. Nếu chưa đánh giá: Hiển thị nút "✍️ Viết đánh giá"
3. Nếu đã đánh giá: Hiển thị "✅ Đã đánh giá"
4. Nhấn nút để chuyển đến màn hình đánh giá

### Đánh giá từ đơn hàng
1. Vào "Lịch sử mua hàng"
2. Tìm đơn hàng có trạng thái "Đã giao hàng" hoặc "Hoàn thành"
3. Nhấn nút "Viết đánh giá"
4. Đánh giá các sản phẩm trong đơn hàng

## Logic kiểm tra khả năng đánh giá

### Điều kiện để có thể đánh giá:
1. **Đăng nhập**: Người dùng phải đã đăng nhập
2. **Chưa đánh giá**: Sản phẩm chưa được đánh giá bởi người dùng này
3. **Trạng thái đơn hàng**: Đơn hàng phải ở trạng thái "delivered" hoặc "completed" (nếu đánh giá từ đơn hàng)

### API Endpoints sử dụng:
- `GET /reviews/user/{userId}` - Lấy danh sách đánh giá của user
- `GET /reviews/product/{productId}` - Lấy đánh giá của sản phẩm
- `POST /reviews` - Tạo đánh giá mới
- `POST /api/upload/upload` - Upload ảnh (sử dụng cho review)

## Debug và Troubleshooting

### Console Logs:
- `🔍 Review check:` - Thông tin kiểm tra khả năng đánh giá
- `📤 Uploading image for review:` - Thông tin upload ảnh
- `✅ Image uploaded successfully:` - Xác nhận upload ảnh thành công
- `📤 Sending review data:` - Thông tin đánh giá đang gửi
- `✅ Review submitted successfully:` - Xác nhận đánh giá thành công
- `❌ Lỗi...` - Các lỗi xảy ra

### Các lỗi thường gặp:
1. **"Vui lòng đăng nhập để đánh giá"**: User chưa đăng nhập
2. **"Bạn đã đánh giá sản phẩm này"**: Sản phẩm đã được đánh giá
3. **"Không thể gửi đánh giá"**: Lỗi từ server
4. **"Không thể upload ảnh"**: Lỗi upload ảnh (vẫn gửi được review)
5. **"Không thể chọn ảnh"**: Lỗi quyền truy cập camera/thư viện

## Cải thiện trong tương lai
1. Thêm tính năng chỉnh sửa đánh giá
2. Thêm tính năng xóa đánh giá
3. Thêm filter và sort cho đánh giá
4. Thêm tính năng like/dislike đánh giá
5. Thêm tính năng báo cáo đánh giá không phù hợp
