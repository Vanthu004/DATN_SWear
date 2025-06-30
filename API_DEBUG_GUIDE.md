# Hướng dẫn Debug API Endpoints

## Vấn đề hiện tại

Bạn đang gặp lỗi 404 khi gọi API để lấy thông tin sản phẩm:
```
Cannot GET /api/products/api/products/685ec3fd90bb2d4a84bf5848
```

## Cách debug

### 1. Chạy test script

Tạo file `test-api-endpoints.js` và chạy:

```bash
node test-api-endpoints.js
```

Script này sẽ test các endpoint khác nhau để tìm endpoint đúng.

### 2. Kiểm tra backend routes

Kiểm tra file routes trong backend của bạn:

```javascript
// Kiểm tra file routes/products.js hoặc tương tự
router.get('/products/:id', productController.getProduct);
router.get('/api/products/:id', productController.getProduct);
router.get('/products/detail/:id', productController.getProduct);
```

### 3. Các endpoint cần kiểm tra

#### Products API
- `/products/:id`
- `/products/api/products/:id`
- `/api/products/:id`
- `/products/detail/:id`
- `/products/get/:id`

#### Cart API
- `/cart/api/carts/user/:userId`
- `/carts/user/:userId`
- `/cart/user/:userId`

#### Cart Items API
- `/cart-items/api/cart-items/cart/:cartId`
- `/cart-items/cart/:cartId`
- `/cart/items/:cartId`

## Giải pháp tạm thời

Tôi đã cập nhật `useCart` hook để:

1. **Không gọi API lấy sản phẩm**: Sử dụng dữ liệu sản phẩm đã có từ cart items
2. **Xử lý populate**: Nếu backend đã populate product data, sử dụng luôn
3. **Fallback**: Tạo object product giả nếu không có dữ liệu

## Cách sửa vĩnh viễn

### Option 1: Sửa backend routes

Thêm route để lấy sản phẩm theo ID:

```javascript
// Trong backend routes
router.get('/products/:id', productController.getProductById);
```

### Option 2: Populate trong cart items

Sửa backend để populate product data khi lấy cart items:

```javascript
// Trong cart items controller
const cartItems = await CartItem.find({ cart_id: cartId })
  .populate('product_id', 'name price image_url');
```

### Option 3: Sử dụng endpoint hiện có

Tìm endpoint đúng trong backend và cập nhật frontend:

```javascript
// Trong useCart hook
const productRes = await api.get(`/products/${productId}`); // hoặc endpoint đúng
```

## Test thủ công

Bạn có thể test thủ công bằng cách:

1. Mở browser và truy cập: `http://192.168.1.6:3000/api/products/685ec3fd90bb2d4a84bf5848`
2. Kiểm tra response
3. Thử các endpoint khác nhau

## Log để debug

Thêm log trong backend để xem request đến đâu:

```javascript
// Trong backend middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
```

## Kết quả mong đợi

Sau khi tìm được endpoint đúng, cập nhật `useCart` hook:

```javascript
// Thay thế dòng này trong useCart
const productRes = await api.get(`/products/${productId}`); // endpoint đúng
```

## Liên hệ

Nếu vẫn gặp vấn đề, hãy cung cấp:
1. Cấu trúc routes trong backend
2. Response từ test script
3. Log từ backend khi gọi API 