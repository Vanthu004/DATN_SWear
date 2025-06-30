# Hệ thống Giỏ hàng - Hướng dẫn sử dụng

## Tổng quan

Hệ thống giỏ hàng đã được cập nhật để hỗ trợ thêm sản phẩm từ màn hình Home và ProductDetail. Hệ thống sử dụng hook `useCart` để quản lý state và tương tác với backend.

## Các thành phần chính

### 1. Hook useCart (`app/hooks/useCart.js`)

Hook này cung cấp tất cả chức năng quản lý giỏ hàng:

```javascript
const {
  cartItems,        // Danh sách sản phẩm trong giỏ hàng
  cartCount,        // Số lượng sản phẩm trong giỏ hàng
  loading,          // Trạng thái loading
  addToCart,        // Thêm sản phẩm vào giỏ hàng
  updateQuantity,   // Cập nhật số lượng
  removeFromCart,   // Xóa sản phẩm khỏi giỏ hàng
  getTotal,         // Tính tổng tiền
  isInCart,         // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
  refreshCart       // Refresh dữ liệu giỏ hàng
} = useCart();
```

### 2. ProductCard Component (`app/components/ProductCard.js`)

Component hiển thị sản phẩm với nút thêm vào giỏ hàng:
- Icon cart thay đổi thành checkmark khi sản phẩm đã có trong giỏ hàng
- Tự động cập nhật trạng thái khi thêm/xóa sản phẩm

### 3. CartBadge Component (`app/components/CartBadge.js`)

Component hiển thị số lượng sản phẩm trong giỏ hàng:
- Tự động ẩn khi giỏ hàng trống
- Có thể tùy chỉnh style

## Cách sử dụng

### Thêm sản phẩm vào giỏ hàng

```javascript
import { useCart } from '../hooks/useCart';

const MyComponent = () => {
  const { addToCart } = useCart();
  
  const handleAddToCart = async () => {
    const success = await addToCart(product, quantity, size, color);
    if (success) {
      // Thành công
    }
  };
};
```

### Hiển thị số lượng giỏ hàng

```javascript
import CartBadge from '../components/CartBadge';

const Header = () => {
  return (
    <TouchableOpacity style={{ position: 'relative' }}>
      <Ionicons name="cart-outline" size={24} />
      <CartBadge />
    </TouchableOpacity>
  );
};
```

### Kiểm tra sản phẩm đã có trong giỏ hàng

```javascript
const { isInCart } = useCart();

// Trong component
const isProductInCart = isInCart(product._id);
```

## API Endpoints

Hệ thống sử dụng các API endpoints sau:

### Cart API
- `POST /cart/api/carts` - Tạo giỏ hàng mới
- `GET /cart/api/carts/user/:userId` - Lấy giỏ hàng theo user
- `DELETE /cart/api/carts/:id` - Xóa giỏ hàng

### Cart Items API
- `POST /cart-items/api/cart-items` - Thêm sản phẩm vào giỏ hàng
- `GET /cart-items/api/cart-items/cart/:cartId` - Lấy danh sách sản phẩm trong giỏ hàng
- `PUT /cart-items/api/cart-items/:id` - Cập nhật số lượng
- `DELETE /cart-items/api/cart-items/:id` - Xóa sản phẩm khỏi giỏ hàng

## Các màn hình đã cập nhật

1. **HomeScreen** - Hiển thị số lượng giỏ hàng trên icon cart
2. **ProductDetailScreen** - Nút thêm vào giỏ hàng và mua ngay
3. **CartScreen** - Sử dụng hook useCart thay vì tự quản lý state
4. **CategoryScreen** - Sử dụng ProductCard component
5. **SearchScreen** - Sử dụng ProductCard component

## Tính năng mới

### 1. Thêm sản phẩm từ Home
- Click vào icon cart trên ProductCard
- Tự động thêm với số lượng 1
- Hiển thị thông báo thành công

### 2. Thêm sản phẩm từ ProductDetail
- Chọn size, color, số lượng
- Nút "Thêm vào giỏ hàng" và "Mua ngay"
- Hiển thị trạng thái đã có trong giỏ hàng

### 3. Quản lý giỏ hàng
- Tăng/giảm số lượng
- Xóa sản phẩm
- Tính tổng tiền tự động
- Empty state khi giỏ hàng trống

### 4. Badge số lượng
- Hiển thị số lượng sản phẩm trên tất cả icon cart
- Tự động cập nhật khi thêm/xóa sản phẩm

## Lưu ý

1. **Authentication**: Người dùng phải đăng nhập để thêm sản phẩm vào giỏ hàng
2. **Error Handling**: Hệ thống có xử lý lỗi và hiển thị thông báo phù hợp
3. **Loading States**: Hiển thị loading khi đang thực hiện các thao tác
4. **Real-time Updates**: Số lượng giỏ hàng được cập nhật real-time trên tất cả màn hình

## Troubleshooting

### Lỗi thường gặp

1. **"Vui lòng đăng nhập"**: Kiểm tra userInfo trong AuthContext
2. **"Không thể thêm sản phẩm"**: Kiểm tra kết nối API và dữ liệu sản phẩm
3. **Badge không hiển thị**: Kiểm tra cartCount trong useCart hook

### Debug

Sử dụng console.log để debug:
```javascript
console.log("Cart items:", cartItems);
console.log("Cart count:", cartCount);
console.log("Is in cart:", isInCart(productId));
``` 