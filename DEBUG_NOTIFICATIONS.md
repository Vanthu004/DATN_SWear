# 🐛 Debug Notifications - Hướng dẫn khắc phục

## 📋 Các bước kiểm tra

### 1. **Kiểm tra logs khi đặt hàng**

Khi bạn đặt hàng thành công, hãy kiểm tra console logs để xem:

```
✅ Logs cần có:
- "id đơn hàng....... [orderId]"
- "userInfo: [user object]"
- "Sending order success notification..."
- "sendOrderNotification: Called with type: order_success"
- "sendOrderNotification: Sending notification: [notification object]"
- "sendLocalNotification: Called with title: [title]"
- "sendLocalNotification: Notification scheduled successfully: [result]"
- "Order success notification sent successfully"
```

### 2. **Kiểm tra khởi tạo notifications**

Khi app khởi động hoặc login, kiểm tra:

```
✅ Logs cần có:
- "AuthContext: Login called with user: [user]"
- "AuthContext: Initializing notifications for user: [userId]"
- "initializeNotifications: Called with userId: [userId]"
- "registerForPushNotificationsAsync: Starting registration..."
- "registerForPushNotificationsAsync: Device detected, checking permissions..."
- "registerForPushNotificationsAsync: Current permission status: [status]"
- "registerForPushNotificationsAsync: Getting Expo push token..."
- "Push token: [token]"
- "Notifications initialized successfully"
```

### 3. **Kiểm tra quyền thông báo**

Nếu không có thông báo, có thể do:

- ❌ Không có quyền thông báo
- ❌ Đang chạy trên simulator (không hỗ trợ)
- ❌ App bị kill trong background

### 4. **Test với button test**

Sử dụng button "🧪 Test Notification" trong OrderSuccessScreen để test:

1. Đặt hàng thành công
2. Nhấn button test
3. Kiểm tra xem có thông báo hiện ra không

## 🔧 Các vấn đề thường gặp

### 1. **Không có logs nào**

**Nguyên nhân:** Hook `useNotifications` không được gọi
**Giải pháp:** Kiểm tra xem `userInfo?._id` có tồn tại không

### 2. **Có logs nhưng không có thông báo**

**Nguyên nhân:** 
- Không có quyền thông báo
- Đang chạy trên simulator
- Notification handler không được setup

**Giải pháp:**
- Kiểm tra quyền thông báo trong Settings
- Test trên thiết bị thật
- Kiểm tra notification handler

### 3. **Lỗi "removeNotificationSubscription is deprecated"**

**Đã sửa:** Thay đổi từ `removeNotificationSubscription()` thành `.remove()`

### 4. **Token không được tạo**

**Nguyên nhân:**
- Project ID không đúng
- Không có quyền thông báo
- Đang chạy trên simulator

## 🧪 Test từng bước

### Bước 1: Test quyền thông báo
```javascript
import { checkNotificationPermission } from '../services/notificationService';

const permission = await checkNotificationPermission();
console.log('Permission status:', permission);
```

### Bước 2: Test gửi thông báo đơn giản
```javascript
import { sendLocalNotification } from '../services/notificationService';

await sendLocalNotification(
  'Test',
  'Test message',
  { test: true }
);
```

### Bước 3: Test hook useNotifications
```javascript
const { sendOrderSuccessNotification } = useNotifications(userInfo?._id);
console.log('Hook initialized with userId:', userInfo?._id);
```

## 📱 Kiểm tra trên thiết bị

1. **Mở Settings > Apps > [Your App] > Notifications**
2. **Đảm bảo "Allow notifications" được bật**
3. **Test trên thiết bị thật (không phải simulator)**

## 🔍 Debug commands

```bash
# Xem logs real-time
npx expo start --clear

# Test notifications
npm run test-notifications -- --real-token
```

## 📞 Nếu vẫn không hoạt động

1. **Kiểm tra tất cả logs** trong console
2. **Test trên thiết bị thật**
3. **Kiểm tra quyền thông báo**
4. **Restart app** và thử lại
5. **Kiểm tra project ID** trong `notificationService.js`

---

**💡 Tip:** Luôn test trên thiết bị thật, không phải simulator!
