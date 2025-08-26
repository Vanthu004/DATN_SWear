# 🔍 Notification Debug Guide - Hướng dẫn debug chi tiết

## 🚨 Vấn đề hiện tại
- ✅ Notification được gửi thành công (có log)
- ❌ Notification không hiển thị trên thanh thông báo
- ⚠️ Warning về `shouldShowAlert` deprecated

## 🔧 Các bước debug

### 1. **Kiểm tra notification handler**
```javascript
// Đã sửa từ:
shouldShowAlert: true

// Thành:
shouldShowBanner: true,
shouldShowList: true
```

### 2. **Test với component đơn giản**
Sử dụng `SimpleNotificationTest` component để test:
- Test quyền thông báo
- Test gửi notification trực tiếp
- Kiểm tra settings

### 3. **Kiểm tra logs chi tiết**
Khi test, cần thấy các logs sau:
```
=== SIMPLE NOTIFICATION TEST START ===
Permission status: granted
Sending simple notification...
Notification result: [notification-id]
```

### 4. **Kiểm tra Android notification channel**
```javascript
// Đã thêm các options:
sound: 'default',
enableVibrate: true,
showBadge: true,
```

## 🧪 Test từng bước

### Bước 1: Test quyền thông báo
1. Nhấn "Check Settings" button
2. Kiểm tra status có phải "granted" không
3. Nếu không, cấp quyền trong Settings

### Bước 2: Test notification đơn giản
1. Nhấn "Test Simple Notification" button
2. Kiểm tra logs trong console
3. Kiểm tra thanh thông báo

### Bước 3: Test notification từ service
1. Nhấn "🧪 Test Notification" button (button cũ)
2. So sánh logs với button đơn giản
3. Tìm sự khác biệt

## 🔍 Các nguyên nhân có thể

### 1. **Notification handler không đúng**
- Đã sửa `shouldShowAlert` thành `shouldShowBanner` và `shouldShowList`

### 2. **Android notification channel**
- Đã thêm `sound`, `enableVibrate`, `showBadge`

### 3. **Quyền thông báo**
- Kiểm tra trong Settings > Apps > [Your App] > Notifications
- Đảm bảo "Allow notifications" được bật

### 4. **App đang foreground**
- Notification có thể không hiển thị khi app đang mở
- Thử đóng app và test lại

### 5. **Emulator settings**
- Kiểm tra emulator có hỗ trợ notifications không
- Thử test trên thiết bị thật

## 📱 Kiểm tra trên thiết bị

### Android:
1. **Settings > Apps > [Your App] > Notifications**
2. **Đảm bảo:**
   - Allow notifications: ON
   - Show notifications: ON
   - Sound: ON
   - Vibration: ON

### iOS:
1. **Settings > [Your App] > Notifications**
2. **Đảm bảo:**
   - Allow Notifications: ON
   - Show in Notification Center: ON
   - Sounds: ON
   - Badges: ON

## 🐛 Debug commands

```bash
# Clear cache và restart
npx expo start --clear

# Xem logs real-time
npx expo start --clear --no-dev --minify
```

## 📊 So sánh logs

### Logs thành công:
```
=== SIMPLE NOTIFICATION TEST START ===
Permission status: granted
Sending simple notification...
Notification result: 0b5ae246-2345-4be0-a9b2-c1c1c7ef4a10
Notification received: {...}
```

### Logs lỗi:
```
Permission status: denied
// hoặc
Error scheduling notification: ...
```

## 🎯 Next steps

1. **Test với SimpleNotificationTest** trước
2. **So sánh logs** giữa 2 button test
3. **Kiểm tra quyền** trong Settings
4. **Test trên thiết bị thật** nếu có thể
5. **Kiểm tra notification channel** trên Android

---

**💡 Tip:** Luôn bắt đầu với test đơn giản trước khi debug logic phức tạp!
