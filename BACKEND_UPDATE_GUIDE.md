# Hướng dẫn cập nhật Backend cho Profile Update

## Vấn đề hiện tại:
1. Field name không khớp: Frontend dùng `avatar_url` nhưng backend dùng `avata_url`
2. Backend không xử lý upload file multipart
3. Validation quá strict cho phone number

## Các thay đổi cần thực hiện:

### 1. Cài đặt multer (nếu chưa có):
```bash
npm install multer
```

### 2. Cập nhật User Schema:
Đảm bảo field name là `avata_url` (không phải `avatar_url`):
```javascript
avata_url: {
  type: String,
  default: ''
},
```

### 3. Cập nhật updateProfile function:
```javascript
const multer = require('multer');
const path = require('path');

// Cấu hình multer cho upload file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/avatars/') // Tạo thư mục này
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname))
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ cho phép upload file ảnh!'), false);
    }
  }
});

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, phone_number, email, gender, address } = req.body;
    
    // Validation cơ bản
    if (!name || !email) {
      return res.status(400).json({ 
        message: 'Vui lòng nhập đầy đủ họ tên và email' 
      });
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: 'Email không đúng định dạng' 
      });
    }

    // Validate phone (chỉ khi có phone)
    if (phone_number) {
      const phoneRegex = /^(\+84|84|0)[3|5|7|8|9][0-9]{8}$/;
      if (!phoneRegex.test(phone_number)) {
        return res.status(400).json({ 
          message: 'Số điện thoại không đúng định dạng Việt Nam' 
        });
      }
    }

    // Validate gender
    if (gender && !['male', 'female', 'other'].includes(gender)) {
      return res.status(400).json({ 
        message: 'Giới tính không hợp lệ' 
      });
    }

    // Kiểm tra email trùng
    const existingUserWithEmail = await User.findOne({ 
      email: email, 
      _id: { $ne: userId } 
    });
    if (existingUserWithEmail) {
      return res.status(400).json({ 
        message: 'Email đã được sử dụng bởi tài khoản khác' 
      });
    }

    // Kiểm tra phone trùng (nếu có)
    if (phone_number) {
      const existingUserWithPhone = await User.findOne({ 
        phone_number: phone_number, 
        _id: { $ne: userId } 
      });
      if (existingUserWithPhone) {
        return res.status(400).json({ 
          message: 'Số điện thoại đã được sử dụng bởi tài khoản khác' 
        });
      }
    }

    // Chuẩn bị dữ liệu cập nhật
    const updateData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      address: address ? address.trim() : ''
    };

    if (phone_number) {
      updateData.phone_number = phone_number.trim();
    }

    if (gender) {
      updateData.gender = gender;
    }

    // Xử lý upload ảnh
    if (req.file) {
      const avatarUrl = `${req.protocol}://${req.get('host')}/uploads/avatars/${req.file.filename}`;
      updateData.avata_url = avatarUrl;
    }

    // Cập nhật user
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy user' });
    }

    res.status(200).json({ 
      message: 'Cập nhật thông tin cá nhân thành công', 
      user 
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Middleware để xử lý upload file
exports.uploadAvatar = upload.single('avata_url');
```

### 4. Cập nhật route:
```javascript
// Trong file routes
router.put('/update-profile', authMiddleware, uploadAvatar, updateProfile);
```

### 5. Tạo thư mục uploads:
```bash
mkdir -p uploads/avatars
```

### 6. Thêm static file serving:
```javascript
// Trong app.js hoặc server.js
app.use('/uploads', express.static('uploads'));
```

## Các thay đổi đã thực hiện ở Frontend:

1. ✅ Sửa field name từ `avatar_url` thành `avata_url` trong ProfileScreen
2. ✅ Cập nhật EditProfileScreen để gọi `updateUserInfo` sau khi update thành công
3. ✅ Sửa FormData field name thành `avata_url`
4. ✅ Cải thiện logic xử lý upload ảnh

## Kiểm tra:
1. Đảm bảo backend trả về đúng format: `{ message: "...", user: {...} }`
2. Field `avata_url` trong response phải khớp với frontend
3. Upload ảnh phải hoạt động với multipart/form-data
4. ProfileScreen phải hiển thị thông tin đã cập nhật ngay lập tức 