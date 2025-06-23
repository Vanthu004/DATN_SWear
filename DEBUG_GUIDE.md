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
console.log('userToken:', userToken);
console.log('userInfo:', userInfo);
console.log('isEmailVerified:', isEmailVerified);
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
console.log('Current auth state:', {
  userToken: userToken,
  userInfo: userInfo,
  isEmailVerified: isEmailVerified
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