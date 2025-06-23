# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

# DATN_SWear - React Native App

## Luồng Email Verification

### 1. Đăng ký tài khoản mới
- User nhập thông tin đăng ký (tên, email, mật khẩu)
- Sau khi đăng ký thành công:
  - Lưu token và thông tin user tạm thời (email_verified: false)
  - Tự động gửi OTP đến email
  - Chuyển đến màn hình EmailVerification

### 2. Xác nhận Email
- Màn hình EmailVerification tự động gửi OTP khi vào từ Register
- User nhập mã OTP 6 số
- Sau khi xác nhận thành công:
  - Cập nhật trạng thái email_verified: true
  - Hiển thị thông báo thành công
  - Chuyển về màn hình Login

### 3. Đăng nhập
- Kiểm tra email đã xác nhận chưa trước khi cho phép đăng nhập
- Nếu email chưa xác nhận:
  - Hiển thị thông báo yêu cầu xác nhận
  - Cho phép chuyển đến màn hình EmailVerification
- Nếu email đã xác nhận: Cho phép đăng nhập bình thường

### 4. Gửi lại OTP
- User có thể gửi lại OTP tối đa 3 lần
- Có timer 60 giây giữa các lần gửi
- Sau 3 lần, hiển thị option liên hệ hỗ trợ

## API Endpoints

### Register
- `POST /register`
- Body: `{ name, email, password }`
- Response: `{ token, user }`

### Send Verification Email
- `POST /resend-verification` (hoặc `/send-verification-email`, `/verify-email/resend`)
- Body: `{ email }`

### Verify Email
- `POST /verify-email`
- Body: `{ email, otp }`

### Login
- `POST /login`
- Body: `{ email, password }`
- Response: `{ token, user, isEmailVerified }`

### Check Email Verification
- `GET /check-email-verification?email={email}`
- Response: `{ isEmailVerified }`

## Cấu hình

### API Base URL
- File: `app/utils/api.js`
- Thay đổi `API_BASE_URL` theo server của bạn

### Debug
- API requests và responses được log tự động
- Kiểm tra console để debug các vấn đề API

## Lưu ý

1. Đảm bảo server hỗ trợ các endpoint cần thiết
2. Email service phải được cấu hình đúng trên server
3. OTP có hiệu lực trong 10 phút
4. User phải xác nhận email trước khi có thể đăng nhập
