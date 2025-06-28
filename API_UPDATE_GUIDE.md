# API Update Profile Flow

## Flow cập nhật profile với avatar

### 1. Upload ảnh đại diện
```javascript
// Bước 1: Upload ảnh
const formData = new FormData();
formData.append("image", {
  uri: imageUri,
  type: "image/jpeg", 
  name: "avatar.jpg"
});

const uploadResponse = await fetch("/api/upload", {
  method: "POST",
  headers: { "Authorization": "Bearer token" },
  body: formData
});
const { uploadId } = await uploadResponse.json();
```

### 2. Cập nhật avatar
```javascript
// Bước 2: Update avatar
const updateResponse = await fetch("/api/users/update-avatar", {
  method: "PUT",
  headers: {
    "Authorization": "Bearer token",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ uploadId })
});
```

### 3. Cập nhật thông tin profile
```javascript
// Bước 3: Update profile info
const profileResponse = await fetch("/api/users/update-profile", {
  method: "PUT",
  headers: {
    "Authorization": "Bearer token",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    name: "Tên người dùng",
    email: "email@example.com",
    phone_number: "0123456789",
    gender: "male"
  })
});
```

## Implementation trong code

### File: `app/utils/api.js`
- `uploadAvatar(imageUri)`: Upload ảnh đại diện
- `updateUserAvatar(uploadId)`: Cập nhật avatar với uploadId
- `updateProfileWithAvatar(profileData, imageUri)`: Hàm helper xử lý toàn bộ flow

### File: `app/Screens/EditProfileScreen.js`
- Sử dụng `updateProfileWithAvatar()` để xử lý toàn bộ flow update
- Xử lý lỗi và loading state
- Cập nhật UI sau khi thành công

## Lưu ý
- API trả về `uploadId` thay vì `avatarId`
- Cần xử lý lỗi cho từng bước riêng biệt
- Đảm bảo token được gửi trong header Authorization 