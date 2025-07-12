# Hướng dẫn Debug Email Verification

## Vấn đề hiện tại

1. Khi đăng ký → chuyển sang màn hình chính thay vì EmailVerification
2. Khi đăng nhập → không đăng nhập được mặc dù mật khẩu đúng
3. Gửi 2 email xác nhận - Đã sửa với delay và kiểm tra trạng thái
4. Đăng nhập lại bị bắt xác thực - Đã sửa với kiểm tra trạng thái từ server

## Luồng mới (Đã thay đổi)

### 1. Đăng ký:

1. User nhập thông tin → POST /register
2. Server gửi email xác nhận
3. Chuyển đến EmailVerification (KHÔNG auto-send email)
4. User nhập OTP → POST /verify-email
5. **Sau khi xác nhận thành công → Chuyển về Login**
6. User đăng nhập → Kiểm tra email verification từ server → Đăng nhập thành công

### 2. Đăng nhập:

1. User nhập email/password
2. **Kiểm tra email verification từ server trước**
3. Nếu chưa verified → Chuyển đến EmailVerification
4. Nếu đã verified → POST /login → Lưu token → Chuyển sang Main

### 3. Xác nhận Email:

1. User nhập OTP → POST /verify-email
2. **Luôn chuyển về Login sau khi thành công**
3. Không lưu token, không chuyển thẳng sang Main

## Cách debug

### 1. Kiểm tra trạng thái AuthContext

```javascript
// Trong console, kiểm tra:
console.log("userToken:", userToken);
console.log("userInfo:", userInfo);
console.log("isEmailVerified:", isEmailVerified);
```

### 2. Clear data để test lại

- Sử dụng AsyncStorage.clear() trong console
- Hoặc gọi `clearAllData()` từ AuthContext

### 3. Kiểm tra console logs

- Tất cả API requests và responses được log tự động
- Kiểm tra console để debug các vấn đề API

## API Endpoints

### Register

- `POST /register`
- Body: `{ name, email, password }`
- Response: `{ token, user }`
- **Server tự động gửi email xác nhận**

### Send Verification Email

- `POST /resend-verification` (hoặc `/send-verification-email`, `/verify-email/resend`)
- Body: `{ email }`
- **Chỉ gọi khi vào từ Login, không gọi khi vào từ Register**

### Verify Email

- `POST /verify-email`
- Body: `{ email, otp }`
- **Sau khi thành công → Chuyển về Login**

### Login

- `POST /login`
- Body: `{ email, password }`
- Response: `{ token, user, isEmailVerified? }` (isEmailVerified có thể không có)
- **Nếu không có isEmailVerified, sẽ kiểm tra từ API riêng**

### Check Email Verification

- `GET /check-email-verification?email={email}`
- Response: `{ isEmailVerified }`
- **Fallback khi login response không có isEmailVerified**

## Common issues và solutions

#### Gửi 2 email:

- **Nguyên nhân**: Server gửi email khi register + app auto-send khi vào EmailVerification
- **Giải pháp**: Không auto-send khi vào từ Register, chỉ auto-send khi vào từ Login

#### Đăng nhập lại bị bắt xác thực:

- **Nguyên nhân**: Không kiểm tra trạng thái email verification từ server
- **Giải pháp**: Kiểm tra từ server trước khi đăng nhập

#### Luồng không đúng:

- **Nguyên nhân**: Chuyển thẳng sang Main sau khi xác nhận email
- **Giải pháp**: Luôn chuyển về Login sau khi xác nhận email thành công

## Test steps

1. Clear data
2. Đăng ký tài khoản mới
3. Kiểm tra có chuyển đến EmailVerification không
4. Kiểm tra chỉ có 1 email được gửi (từ server)
5. Nhập OTP và xác nhận
6. Kiểm tra có chuyển về Login không
7. Đăng nhập với email/password
8. Kiểm tra có đăng nhập được không
9. Logout và đăng nhập lại
10. Kiểm tra có đăng nhập được không

## Debug commands

```javascript
// Trong console của app
// Kiểm tra trạng thái hiện tại
console.log("Current auth state:", {
  userToken: userToken,
  userInfo: userInfo,
  isEmailVerified: isEmailVerified,
});

// Clear data
clearAllData();

// Test API
testAPIEndpoints();
```

## Logic mới cho Email Verification

### Trường hợp 1: Server trả về isEmailVerified = true

- Cho phép đăng nhập bình thường

### Trường hợp 2: Server trả về isEmailVerified = false

- Kiểm tra từ API `/check-email-verification`
- Nếu API riêng trả về true → Cho phép đăng nhập
- Nếu API riêng trả về false → Yêu cầu xác nhận email

### Trường hợp 3: Server không trả về isEmailVerified

- Giả sử email đã verified (vì server cho phép đăng nhập)
- Cho phép đăng nhập bình thường

### Trường hợp 4: Server trả về isEmailVerified = false nhưng đăng nhập thành công

- Giả sử email đã verified (vì server cho phép đăng nhập)
- Cho phép đăng nhập bình thường

### Trường hợp 5: Login thất bại với status 401

- Kiểm tra email có tồn tại không bằng API `/check-email-exists`
- Nếu email tồn tại → Yêu cầu xác nhận email
- Nếu email không tồn tại → Báo lỗi email/password sai

### Trường hợp 6: Register thất bại với status 409 (email đã tồn tại)

- Hiển thị dialog cho user chọn:
  - Xác nhận email (nếu chưa xác nhận)
  - Thử đăng nhập
  - Hủy

# Hướng dẫn Debug Cart System

## Vấn đề thường gặp và cách khắc phục

### 1. Lỗi 404 - Endpoint không tìm thấy

#### Triệu chứng:

```
Cannot GET /api/cart/api/carts/user/68581e3ce6e5bc1e56e7ce11
```

#### Nguyên nhân:

- URL bị duplicate `/api` do `API_BASE_URL` đã có `/api` nhưng endpoint lại thêm `/cart/api/carts`

#### Cách khắc phục:

1. Kiểm tra `API_BASE_URL` trong `app/utils/api.js`:

   ```javascript
   const API_BASE_URL = "http://192.168.1.15:3000/api";
   ```

2. Sửa các endpoint để không duplicate `/api`:

   ```javascript
   // ❌ Sai
   const response = await api.get("/cart/api/carts/user/${userId}");

   // ✅ Đúng
   const response = await api.get("/carts/user/${userId}");
   ```

### 2. Lỗi Network - Không kết nối được backend

#### Triệu chứng:

```
Network Error
Request failed with status code 500
```

#### Cách khắc phục:

1. Kiểm tra backend có đang chạy không:

   ```bash
   curl http://192.168.1.15:3000/health
   ```

2. Kiểm tra IP address có đúng không:

   ```javascript
   const API_BASE_URL = "http://192.168.1.15:3000/api";
   ```

3. Chạy debug script:
   ```bash
   node debug-cart-endpoints.js
   ```

### 3. Lỗi Authentication - Token không hợp lệ

#### Triệu chứng:

```
Request failed with status code 401
Unauthorized
```

#### Cách khắc phục:

1. Kiểm tra token trong AsyncStorage:

   ```javascript
   const token = await AsyncStorage.getItem("userToken");
   console.log("Token:", token);
   ```

2. Kiểm tra token có được gửi trong header không:

   ```javascript
   config.headers.Authorization = `Bearer ${token}`;
   ```

3. Đăng nhập lại để lấy token mới

### 4. Lỗi 500 - Server Error

#### Triệu chứng:

```
Request failed with status code 500
Internal Server Error
```

#### Cách khắc phục:

1. Kiểm tra logs của backend server
2. Kiểm tra database connection
3. Kiểm tra dữ liệu gửi lên có đúng format không

## Debug Tools

### 1. Debug Endpoints

```bash
node debug-cart-endpoints.js
```

### 2. Test Cart System

```bash
node test-cart-system.js
```

### 3. Console Logs

Thêm logs vào `useCart` hook:

```javascript
console.log("🧪 Gọi API cart của user:", USER_ID);
console.log("Cart:", cart);
console.log("CartItem:", items);
```

### 4. Network Tab

Sử dụng DevTools để xem:

- Request URL
- Request headers
- Request body
- Response status
- Response data

## Checklist Debug

### Trước khi test:

- [ ] Backend server đang chạy
- [ ] Database connection ổn định
- [ ] User đã đăng nhập
- [ ] Token hợp lệ
- [ ] Network connection ổn định

### Khi gặp lỗi:

- [ ] Kiểm tra console logs
- [ ] Kiểm tra Network tab
- [ ] Chạy debug scripts
- [ ] Kiểm tra backend logs
- [ ] Kiểm tra API endpoints

### Sau khi sửa:

- [ ] Test lại với debug script
- [ ] Test trên app
- [ ] Kiểm tra tất cả chức năng cart
- [ ] Cập nhật documentation

## Common Fixes

### 1. Sửa URL Endpoints

```javascript
// ❌ Cũ
"/cart/api/carts/user/${userId}";
"/cart-items/api/cart-items";

// ✅ Mới
"/carts/user/${userId}";
"/cart-items";
```

### 2. Sửa Error Handling

```javascript
try {
  const response = await api.get(`/carts/user/${userId}`);
  return response.data;
} catch (error) {
  if (error.response?.status === 404) {
    // User chưa có cart
    return null;
  }
  throw error;
}
```

### 3. Sửa Data Structure

```javascript
// Đảm bảo dữ liệu đúng format
const cartItemData = {
  cart_id: cartId,
  product_id: productId,
  quantity: quantity,
};
```

## Tips

1. **Luôn kiểm tra URL**: Đảm bảo không có duplicate `/api`
2. **Sử dụng debug scripts**: Chạy trước khi test trên app
3. **Kiểm tra logs**: Cả frontend và backend
4. **Test từng bước**: Không test tất cả cùng lúc
5. **Backup code**: Trước khi thay đổi lớn

## Emergency Fixes

### Nếu cart system không hoạt động:

1. Restart backend server
2. Clear AsyncStorage
3. Đăng nhập lại
4. Kiểm tra database connection
5. Rollback về version trước đó

### Nếu API endpoints thay đổi:

1. Cập nhật tất cả API functions
2. Cập nhật test files
3. Cập nhật documentation
4. Test toàn bộ system
