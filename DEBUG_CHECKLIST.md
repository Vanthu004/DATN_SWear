# 🔍 DEBUG CHECKLIST: ZaloPay Cart Items

## ✅ BƯỚC 1: Frontend đã được sửa
- [x] **CheckoutScreen.js**: Đã thêm `cart_item_ids` vào API call
- [x] **ZaloPayQRScreen.js**: Đã sửa tên biến từ `checkedItems` thành `selectedItems`
- [x] **Navigation**: Đã truyền đúng `selectedItems` sang ZaloPayQRScreen

## 🔍 BƯỚC 2: Kiểm tra frontend có gửi cart_item_ids không
**Kết quả:** ✅ **ĐÃ SỬA** - Frontend giờ sẽ gửi:
```javascript
{
  orderId: "order_123",
  cart_id: "cart_456", 
  cart_item_ids: ["cart_item_1", "cart_item_2", "cart_item_3"], // ✅ MỚI THÊM
  // ... other fields
}
```

## 🔍 BƯỚC 3: Kiểm tra backend có nhận được cart_item_ids không
**Cần kiểm tra:** Backend logs khi tạo ZaloPay order
**Kỳ vọng:** Thấy `cart_item_ids` trong request body

## 🔍 BƯỚC 4: Hoàn thành giao dịch ZaloPay
**Hành động:** 
1. Quét QR code trên ZaloPay app
2. Hoàn thành thanh toán
3. Đợi callback từ ZaloPay

## 🔍 BƯỚC 5: Kiểm tra callback và xóa cart items
**Kỳ vọng:** 
1. Thấy logs callback từ ZaloPay
2. Thấy logs xóa cart items
3. Cart items được xóa khỏi database

## 📋 TRẠNG THÁI HIỆN TẠI
- [x] Frontend đã sửa xong
- [ ] Cần test lại với backend
- [ ] Cần hoàn thành giao dịch ZaloPay
- [ ] Cần kiểm tra logs backend

## 🎯 BƯỚC TIẾP THEO
1. **Test lại frontend** với backend thật
2. **Hoàn thành thanh toán** trên ZaloPay app  
3. **Xem logs backend** để thấy callback và xóa cart items
4. **Báo cáo kết quả** để tiếp tục debug nếu cần

## 📝 GHI CHÚ
- Frontend giờ sẽ gửi đầy đủ thông tin cần thiết
- Backend cần xử lý `cart_item_ids` để xóa đúng cart items
- Cần đợi giao dịch hoàn thành để thấy callback
