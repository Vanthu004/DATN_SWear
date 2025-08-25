# Hướng dẫn tích hợp Push Notifications

## 📋 Tổng quan

Hệ thống thông báo đã được tích hợp đầy đủ cho ứng dụng SWear với các tính năng:

- ✅ Đăng ký và quản lý push tokens
- ✅ Gửi thông báo local và remote
- ✅ Thông báo theo trạng thái đơn hàng
- ✅ Cài đặt tùy chỉnh thông báo
- ✅ Xử lý navigation khi tap vào thông báo

## 🚀 Cài đặt

### 1. Dependencies đã được cài đặt
```json
{
  "expo-notifications": "^0.31.4",
  "expo-device": "~7.1.4"
}
```

### 2. Cấu hình app.json
```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff",
          "sounds": ["./assets/notification-sound.wav"]
        }
      ]
    ]
  }
}
```

## 📁 Cấu trúc files

```
app/
├── services/
│   ├── notificationService.js      # Service chính cho notifications
│   └── pushNotificationService.js  # Service gửi push từ server
├── hooks/
│   └── useNotifications.js         # Custom hook quản lý notifications
├── components/
│   └── NotificationBanner.js       # Component hiển thị thông báo
├── Screens/
│   └── NotificationSettingsScreen.js # Màn hình cài đặt
└── context/
    └── AuthContext.js              # Đã tích hợp notifications
```

## 🔧 Sử dụng

### 1. Khởi tạo trong component

```javascript
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../context/AuthContext';

const MyComponent = () => {
  const { userInfo } = useAuth();
  const { 
    sendOrderSuccessNotification,
    sendOrderConfirmedNotification,
    sendOrderShippingNotification,
    sendOrderDeliveredNotification,
    sendOrderCancelledNotification,
    sendOrderIssueNotification
  } = useNotifications(userInfo?._id);

  // Gửi thông báo đặt hàng thành công
  const handleOrderSuccess = () => {
    sendOrderSuccessNotification({
      orderId: 'ORDER123',
      userId: userInfo._id,
      timestamp: new Date().toISOString(),
    });
  };
};
```

### 2. Các loại thông báo

```javascript
// Đặt hàng thành công
sendOrderSuccessNotification(orderData);

// Đơn hàng được xác nhận
sendOrderConfirmedNotification(orderData);

// Đơn hàng đang giao
sendOrderShippingNotification(orderData);

// Giao hàng thành công
sendOrderDeliveredNotification(orderData);

// Đơn hàng bị hủy
sendOrderCancelledNotification(orderData);

// Đơn hàng có vấn đề
sendOrderIssueNotification(orderData);
```

### 3. Tích hợp vào màn hình đơn hàng

```javascript
// OrderSuccessScreen.js
useEffect(() => {
  if (orderId) {
    sendOrderSuccessNotification({
      orderId: orderId,
      userId: userInfo?._id,
      timestamp: new Date().toISOString(),
    });
  }
}, [orderId]);
```

## 🔄 API Endpoints cần implement trên server

### 1. Lưu token
```
POST /api/notifications/save-token
{
  "userId": "user_id",
  "token_device": "expo_push_token",
  "token_type": "expo",
  "platform": "ios|android"
}
```

### 2. Xóa token
```
DELETE /api/notifications/remove-token
{
  "userId": "user_id",
  "token_device": "expo_push_token"
}
```

### 3. Gửi thông báo đơn hàng
```
POST /api/notifications/send-order-notification
{
  "userId": "user_id",
  "orderId": "order_id",
  "notificationType": "order_success|order_confirmed|...",
  "additionalData": {}
}
```

## 🎨 Customization

### 1. Thay đổi nội dung thông báo

Chỉnh sửa trong `notificationService.js`:

```javascript
const notifications = {
  [NOTIFICATION_TYPES.ORDER_SUCCESS]: {
    title: '🎉 Đặt hàng thành công!',
    body: `Đơn hàng #${orderData.orderId} của bạn đã được đặt thành công.`,
  },
  // Thêm các loại khác...
};
```

### 2. Thêm loại thông báo mới

```javascript
// Thêm vào NOTIFICATION_TYPES
export const NOTIFICATION_TYPES = {
  // ... existing types
  NEW_PRODUCT: 'new_product',
};

// Thêm vào notifications object
const notifications = {
  // ... existing notifications
  [NOTIFICATION_TYPES.NEW_PRODUCT]: {
    title: '🆕 Sản phẩm mới',
    body: 'Có sản phẩm mới phù hợp với bạn!',
  },
};
```

### 3. Custom notification sound

Thêm file âm thanh vào `assets/` và cập nhật `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "sounds": ["./assets/custom-notification.wav"]
        }
      ]
    ]
  }
}
```

## 🐛 Troubleshooting

### 1. Token không hợp lệ
- Kiểm tra project ID trong `notificationService.js`
- Đảm bảo đã build app với EAS hoặc Expo

### 2. Không nhận được thông báo
- Kiểm tra quyền thông báo
- Đảm bảo app không bị kill trong background
- Test trên thiết bị thật (không phải simulator)

### 3. Thông báo không hiển thị
- Kiểm tra notification handler
- Đảm bảo app đang chạy foreground

### 4. Navigation không hoạt động
- Kiểm tra navigation listener
- Đảm bảo route name đúng

## 📱 Testing

### 1. Test local notification
```javascript
import { sendLocalNotification } from '../services/notificationService';

// Test notification
sendLocalNotification(
  'Test Title',
  'Test message',
  { test: true }
);
```

### 2. Test push notification
```javascript
import { sendPushNotification } from '../services/pushNotificationService';

// Test push
sendPushNotification(
  'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
  'Test Push',
  'Test push message',
  { test: true }
);
```

## 🔒 Security

### 1. Token validation
- Validate token format trước khi lưu
- Xóa tokens không hợp lệ định kỳ

### 2. Rate limiting
- Expo có giới hạn 100 requests/second
- Implement rate limiting trên server

### 3. User authentication
- Chỉ lưu token cho user đã đăng nhập
- Xóa token khi logout

## 📊 Monitoring

### 1. Logs
- Log tất cả notification events
- Track delivery status

### 2. Analytics
- Track notification open rates
- Monitor user engagement

### 3. Error handling
- Handle network errors gracefully
- Retry failed notifications

## 🚀 Production Checklist

- [ ] Test trên thiết bị thật
- [ ] Configure production project ID
- [ ] Set up server endpoints
- [ ] Test all notification types
- [ ] Configure error handling
- [ ] Set up monitoring
- [ ] Test background/foreground behavior
- [ ] Verify navigation works correctly

## 📞 Support

Nếu gặp vấn đề, kiểm tra:
1. Expo documentation: https://docs.expo.dev/versions/latest/sdk/notifications/
2. Console logs trong development
3. Expo push notification tool: https://expo.dev/notifications
