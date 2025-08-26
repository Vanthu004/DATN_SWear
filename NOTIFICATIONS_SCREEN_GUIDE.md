# 📱 NotificationsScreen - Hướng dẫn sử dụng

## ✨ Tính năng mới

### 1. **Hiển thị thông báo thật**
- Tự động lưu và hiển thị notifications từ hệ thống
- Phân biệt thông báo đã đọc/chưa đọc
- Hiển thị timestamp cho mỗi thông báo

### 2. **Giao diện cải tiến**
- Thông báo chưa đọc có màu nền khác và chấm đỏ
- Icon chuông thay đổi theo trạng thái đọc
- Timestamp hiển thị thời gian tương đối (vừa xong, 5 phút trước, etc.)

### 3. **Tính năng quản lý**
- Đánh dấu đã đọc khi nhấn vào thông báo
- Xóa tất cả thông báo
- Thêm thông báo test để demo

### 4. **Navigation thông minh**
- Tự động navigate đến OrderDetail cho thông báo đơn hàng
- Navigate đến OrderStatus cho thông báo khác

## 🎯 Cách sử dụng

### 1. **Xem thông báo**
- Mở màn hình Notifications
- Thông báo mới nhất hiển thị ở đầu danh sách
- Thông báo chưa đọc có màu nền xanh nhạt và chấm đỏ

### 2. **Đánh dấu đã đọc**
- Nhấn vào thông báo để đánh dấu đã đọc
- Icon chuông sẽ chuyển từ đỏ sang xám
- Chấm đỏ sẽ biến mất

### 3. **Quản lý thông báo**
- Nhấn icon "+" để thêm thông báo test
- Nhấn icon "🗑️" để xóa tất cả thông báo

### 4. **Navigation**
- Thông báo đơn hàng → OrderDetail
- Thông báo khác → OrderStatus

## 🔧 Tích hợp với hệ thống

### 1. **Tự động lưu notification**
```javascript
// Khi gửi notification, tự động lưu vào AsyncStorage
await sendLocalNotification(title, body, data);
// → Tự động lưu vào 'userNotifications' trong AsyncStorage
```

### 2. **Listener cho notification mới**
```javascript
// NotificationsScreen tự động lắng nghe notification mới
const subscription = Notifications.addNotificationReceivedListener(notification => {
  addNewNotification(notification);
});
```

### 3. **Badge notification**
```javascript
// Sử dụng NotificationBadge component để hiển thị số thông báo chưa đọc
<NotificationBadge />
```

## 📊 Cấu trúc dữ liệu

### Notification Object:
```javascript
{
  id: "1234567890",
  text: "Nội dung thông báo",
  type: "order_success", // order_success, order_confirmed, etc.
  orderId: "ORDER123",
  timestamp: "2025-01-24T08:00:00.000Z",
  isRead: false
}
```

### AsyncStorage Key:
- `userNotifications`: Lưu danh sách notifications

## 🎨 UI/UX Features

### 1. **Trạng thái đọc**
- **Chưa đọc**: Nền xanh nhạt, icon đỏ, chấm đỏ, text đậm
- **Đã đọc**: Nền xám, icon xám, không chấm đỏ, text bình thường

### 2. **Timestamp**
- Vừa xong
- 5 phút trước
- 2 giờ trước
- 3 ngày trước

### 3. **Empty State**
- Icon notifications-off
- Text "Chưa có thông báo nào"
- Button "Thêm thông báo test"

## 🔄 Workflow

### 1. **Khi có notification mới**
1. Notification được gửi qua `sendLocalNotification`
2. Tự động lưu vào AsyncStorage
3. NotificationsScreen cập nhật UI
4. Badge hiển thị số thông báo chưa đọc

### 2. **Khi user nhấn vào notification**
1. Đánh dấu đã đọc
2. Cập nhật UI (màu sắc, icon)
3. Navigate đến màn hình tương ứng
4. Cập nhật badge

### 3. **Khi user xóa thông báo**
1. Hiển thị confirm dialog
2. Xóa tất cả notifications
3. Cập nhật UI về empty state

## 🐛 Troubleshooting

### 1. **Notification không hiển thị**
- Kiểm tra AsyncStorage có dữ liệu không
- Kiểm tra listener có hoạt động không
- Kiểm tra console logs

### 2. **Badge không cập nhật**
- Kiểm tra NotificationBadge component
- Kiểm tra interval có chạy không
- Kiểm tra AsyncStorage

### 3. **Navigation không hoạt động**
- Kiểm tra route names có đúng không
- Kiểm tra navigation object
- Kiểm tra orderId có tồn tại không

## 📱 Next Steps

### 1. **Tích hợp với server**
- Sync notifications với server
- Push notifications từ server
- Real-time updates

### 2. **Advanced features**
- Filter notifications theo loại
- Search notifications
- Notification categories
- Notification preferences

### 3. **Performance**
- Pagination cho notifications
- Lazy loading
- Cache optimization

---

**💡 Tip:** NotificationsScreen giờ đây hoàn toàn tích hợp với hệ thống notification và có thể hiển thị thông báo thật từ app!
