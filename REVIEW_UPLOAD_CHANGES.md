# Cập nhật Upload Ảnh Review - Tóm tắt Thay đổi

## 🎯 Mục tiêu
- Sử dụng API `/api/upload/upload` thay vì upload trực tiếp trong review
- Thêm tính năng chọn ảnh từ thư viện thiết bị
- Cải thiện UX khi upload ảnh review

## 📝 Các thay đổi đã thực hiện

### 1. Cập nhật API Upload (`app/utils/api.js`)
```javascript
// Thay đổi endpoint từ "/upload" thành "/api/upload/upload"
const response = await api.post("/api/upload/upload", formData, {
  headers: {
    "Content-Type": "multipart/form-data",
  },
});
```

### 2. Cải thiện WriteReviewScreen (`app/Screens/WriteReviewScreen.js`)

#### A. Thêm tùy chọn chọn ảnh
```javascript
Alert.alert(
  "Chọn ảnh",
  "Bạn muốn chụp ảnh mới hay chọn từ thư viện?",
  [
    { text: "Chụp ảnh", onPress: () => { /* Camera logic */ } },
    { text: "Chọn từ thư viện", onPress: () => { /* Gallery logic */ } },
    { text: "Hủy", style: "cancel" }
  ]
);
```

#### B. Upload ảnh trước khi tạo review
```javascript
// Upload ảnh trước
if (item.image) {
  const uploadResponse = await api.post("/api/upload/upload", formData);
  uploadId = uploadResponse.data._id;
}

// Tạo review với uploadId
const reviewData = {
  user_id: userInfo._id,
  product_id: item.product_id,
  rating: item.rating,
  comment: item.comment,
  upload_id: uploadId // Nếu có
};
```

#### C. Thêm nút xóa ảnh
```javascript
<TouchableOpacity
  style={styles.removeImageButton}
  onPress={() => {
    const updated = [...reviews];
    updated[index].image = null;
    setReviews(updated);
  }}
>
  <Text style={styles.removeImageText}>✕</Text>
</TouchableOpacity>
```

### 3. Cập nhật Hook useReview (`app/hooks/useReview.js`)

#### A. Upload ảnh riêng biệt
```javascript
// Upload ảnh trước nếu có
let uploadIds = [];
if (images) {
  for (const img of imageArray) {
    const uploadResponse = await api.post("/api/upload/upload", formData);
    if (uploadResponse.data && uploadResponse.data._id) {
      uploadIds.push(uploadResponse.data._id);
    }
  }
}

// Tạo review với uploadIds
const reviewData = {
  user_id: userInfo._id,
  product_id: productId,
  rating: rating,
  comment: comment,
  upload_ids: uploadIds // Nếu có
};
```

### 4. Thêm Styles mới
```javascript
imageContainer: {
  position: "relative",
  marginTop: 10,
},
removeImageButton: {
  position: "absolute",
  top: 5,
  right: 5,
  backgroundColor: "rgba(255, 0, 0, 0.8)",
  borderRadius: 15,
  width: 30,
  height: 30,
  justifyContent: "center",
  alignItems: "center",
},
removeImageText: {
  color: "#fff",
  fontSize: 16,
  fontWeight: "bold",
},
```

## 🔄 Flow Upload Mới

### Trước đây:
1. Chọn ảnh → Gửi review với ảnh đính kèm

### Bây giờ:
1. Chọn ảnh (Camera/Thư viện)
2. Upload ảnh lên `/api/upload/upload`
3. Nhận `uploadId` từ response
4. Tạo review với `upload_id` hoặc `upload_ids`

## 🛡️ Error Handling

### Upload ảnh thất bại:
- Hiển thị cảnh báo nhưng vẫn gửi review
- Log lỗi chi tiết để debug

### Chọn ảnh thất bại:
- Hiển thị thông báo lỗi
- Cho phép thử lại

### Review thất bại:
- Hiển thị thông báo lỗi chi tiết
- Giữ lại dữ liệu đã nhập

## 📊 Console Logs

### Upload thành công:
```
📤 Uploading image for review: image.jpg
✅ Image uploaded successfully, uploadId: 507f1f77bcf86cd799439011
```

### Review thành công:
```
📤 Sending review data: {user_id: "...", product_id: "...", upload_ids: [...]}
✅ Review submitted successfully: {...}
```

### Lỗi:
```
❌ Image upload failed: Network Error
❌ Lỗi thêm đánh giá: Invalid response
```

## ✅ Kết quả

### Tính năng mới:
- ✅ Chọn ảnh từ camera hoặc thư viện
- ✅ Upload ảnh riêng biệt trước khi tạo review
- ✅ Nút xóa ảnh đã chọn
- ✅ Preview ảnh trước khi upload
- ✅ Error handling cải thiện

### Cải thiện UX:
- ✅ Giao diện thân thiện hơn
- ✅ Thông báo lỗi rõ ràng
- ✅ Loading state khi upload
- ✅ Fallback khi upload thất bại

## 🧪 Test

File `test-review-logic.js` đã được tạo để kiểm tra:
- API endpoints
- Upload flow
- Data structure
- Validation rules
- Error handling

Chạy test: `node test-review-logic.js`

