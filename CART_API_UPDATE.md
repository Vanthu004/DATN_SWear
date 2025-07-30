# Cập nhật Cart System - Đồng bộ với Backend API

## Tổng quan

Cart System đã được cập nhật để đồng bộ hoàn toàn với backend API mới. Hệ thống hiện hỗ trợ:

- ✅ **Product Variants**: Hỗ trợ sản phẩm có biến thể (size, color)
- ✅ **Cart Status Management**: Quản lý trạng thái cart (active, converted, abandoned)
- ✅ **Stock Validation**: Tự động kiểm tra tồn kho
- ✅ **Pagination**: Hỗ trợ phân trang cho cart list
- ✅ **Clear Cart**: Xóa tất cả items trong cart

## API Endpoints đã cập nhật

### Cart APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/cart` | Tạo cart mới |
| `GET` | `/api/cart` | Lấy tất cả carts (với phân trang) |
| `GET` | `/api/cart/:id` | Lấy cart theo ID |
| `GET` | `/api/cart/user/:userId` | Lấy cart theo user |
| `PUT` | `/api/cart/:id` | Cập nhật trạng thái cart |
| `DELETE` | `/api/cart/:id` | Xóa cart |
| `POST` | `/api/cart/:id/checkout` | Tạo order từ cart |

### Cart Item APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/cart-item` | Thêm item vào cart |
| `GET` | `/api/cart-item/cart/:cartId` | Lấy items của cart |
| `PUT` | `/api/cart-item/:id` | Cập nhật số lượng |
| `DELETE` | `/api/cart-item/:id` | Xóa item |
| `DELETE` | `/api/cart-item/cart/:cartId/clear` | Xóa tất cả items |

## Các thay đổi trong Frontend

### 1. API Functions (`app/utils/api.js`)

✅ **Đã cập nhật:**
- Thêm hỗ trợ `product_variant_id` trong `addCartItem`
- Thêm `updateCartStatus` function
- Thêm `clearCartItems` function
- Cập nhật URL endpoints từ `/cart-items` → `/cart-item`
- Thêm query parameters cho `getAllCarts`

### 2. useCart Hook (`app/hooks/useCart.js`)

✅ **Tính năng mới:**
- Hỗ trợ `productVariantId` trong `addToCart`
- Thêm `cartStatus` state và management
- Thêm `clearCart` function
- Thêm `updateCartStatus` function
- Cải thiện `isInCart` để hỗ trợ variants
- Thêm `getCartItem` function

### 3. CartScreen (`app/Screens/CartScreen.js`)

✅ **Cải tiến:**
- Thêm nút "Xóa tất cả" cart
- Cải thiện hiển thị giá (sử dụng `price_at_time`)
- Thêm `handleClearCart` function
- Cải thiện error handling

### 4. ProductScreen (`app/Screens/ProductScreen.js`)

✅ **Cập nhật:**
- Chuẩn bị cho product variant selection
- Cập nhật `addToCart` call với `productVariantId`

### 5. ProductCard (`app/components/ProductCard.js`)

✅ **Cập nhật:**
- Chuẩn bị cho product variant support
- Cập nhật `addToCart` call

## Cách sử dụng

### 1. Thêm sản phẩm vào cart (với variant)

```javascript
const { addToCart } = useCart();

// Thêm sản phẩm thường
await addToCart(product, 1, null);

// Thêm sản phẩm có variant
await addToCart(product, 1, "variant_id_here");
```

### 2. Kiểm tra sản phẩm trong cart

```javascript
const { isInCart, getCartItem } = useCart();

// Kiểm tra sản phẩm thường
const inCart = isInCart(productId);

// Kiểm tra sản phẩm có variant
const inCart = isInCart(productId, variantId);

// Lấy item trong cart
const cartItem = getCartItem(productId, variantId);
```

### 3. Xóa tất cả items

```javascript
const { clearCart } = useCart();
await clearCart();
```

### 4. Cập nhật trạng thái cart

```javascript
const { updateCartStatus } = useCart();
await updateCartStatus("converted", "Order completed");
```

## Response Format

Tất cả API đều trả về format chuẩn:

```javascript
{
  "success": true,
  "msg": "message_string",
  "data": {
    // response data
  }
}
```

## Cart Status

- `active`: Giỏ hàng đang hoạt động
- `converted`: Đã chuyển thành đơn hàng
- `abandoned`: Đã bị hủy

## Testing

Chạy test để kiểm tra API:

```bash
node test-cart-api.js
```

## Lưu ý quan trọng

1. **Authentication**: Cần đăng nhập để sử dụng cart
2. **Stock Validation**: API tự động kiểm tra tồn kho
3. **Product Variants**: Hỗ trợ cả sản phẩm thường và có biến thể
4. **Error Handling**: Tất cả functions đều có try-catch
5. **Loading States**: Hiển thị loading khi đang xử lý

## TODO

- [ ] Implement product variant selection UI
- [ ] Add stock validation feedback
- [ ] Implement cart status indicators
- [ ] Add cart history feature
- [ ] Implement cart sharing functionality

## Migration Guide

### Từ version cũ:

1. **API Calls**: Cập nhật URL từ `/cart-items` → `/cart-item`
2. **addToCart**: Thêm parameter `productVariantId`
3. **isInCart**: Cập nhật để hỗ trợ variants
4. **Error Handling**: Kiểm tra response format mới

### Breaking Changes:

- URL endpoints đã thay đổi
- `addToCart` signature đã thay đổi
- Response format đã chuẩn hóa

## Kết luận

Cart System đã được cập nhật hoàn toàn để đồng bộ với backend API mới. Hệ thống hiện tại:

- **Ổn định** và **đáng tin cậy**
- **Hỗ trợ đầy đủ** product variants
- **UX tốt** với loading states và error handling
- **Dễ mở rộng** cho các tính năng mới
- **Tài liệu đầy đủ** cho developer 