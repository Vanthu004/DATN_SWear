# Hệ thống xử lý Token hết hạn

## Tổng quan
Hệ thống này tự động phát hiện khi JWT token hết hạn và hiển thị thông báo cho người dùng, sau đó chuyển hướng về màn hình đăng nhập.

## Cách hoạt động

### 1. API Interceptor (`app/utils/api.js`)
- Khi API trả về status 401 (Unauthorized), interceptor sẽ kiểm tra message
- Nếu message chứa "jwt", "token", hoặc "unauthorized", hệ thống sẽ:
  - Lưu flag `shouldLogout: "true"` vào AsyncStorage
  - Lưu thông báo `tokenExpiredMessage` vào AsyncStorage
  - Lưu message gốc vào `banMessage` để AuthContext xử lý

### 2. Hook useTokenExpiration (`app/hooks/useTokenExpiration.js`)
- Hook này chạy trong AppNavigator và kiểm tra AsyncStorage mỗi 10 giây
- Khi phát hiện `shouldLogout: "true"`, hook sẽ:
  - Hiển thị Alert thông báo token hết hạn
  - Gọi hàm `logout()` khi người dùng nhấn OK
  - Xóa các flag đã sử dụng

### 3. AuthContext (`app/context/AuthContext.js`)
- Xử lý logout và chuyển hướng về màn hình đăng nhập
- Cũng xử lý các trường hợp tài khoản bị khóa (status 403)

### 4. AppNavigator (`app/navigation/AppNavigator.js`)
- Sử dụng hook `useTokenExpiration` để xử lý token hết hạn
- Tự động chuyển hướng về Auth/Login khi logout

## Luồng xử lý

```
API Response 401 → API Interceptor → Lưu flags → useTokenExpiration → Alert → Logout → Navigate to Login
```

## Các trường hợp xử lý

### Token hết hạn (401)
- Hiển thị: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
- Hành động: Chuyển về màn hình đăng nhập

### Tài khoản bị khóa (403)
- Hiển thị: Message từ server về lý do bị khóa
- Hành động: Chuyển về màn hình đăng nhập

## Testing

Sử dụng component `TokenExpirationTest` để test:
1. Giả lập token hết hạn
2. Kiểm tra trạng thái flags
3. Xóa flags test

## Cấu hình

- Kiểm tra token mỗi 10 giây (useTokenExpiration)
- Kiểm tra ban status mỗi 30 giây (AuthContext)
- Tự động chuyển hướng khi logout

## Lưu ý

- Hệ thống hoạt động tự động, không cần can thiệp thủ công
- Tất cả API calls đều được bảo vệ bởi interceptor
- Navigation được xử lý tập trung trong AuthContext
