# Hướng dẫn sử dụng Cart System

## Tổng quan

Cart System đã được cập nhật để khớp với backend API. Hệ thống bao gồm:

- **Cart**: Giỏ hàng của user
- **CartItem**: Các sản phẩm trong giỏ hàng
- **API Functions**: Các hàm gọi API
- **useCart Hook**: Hook quản lý state cart

## Cấu trúc Backend

### Cart Model

```javascript
{
  _id: ObjectId,
  user_id: ObjectId (ref: User),
  created_at: Date
}
```

### CartItem Model

```javascript
{
  _id: ObjectId,
  cart_id: ObjectId (ref: Cart),
  product_id: ObjectId (ref: Product),
  quantity: Number,
  price_at_time: Number,
  product_name: String,
  product_image: String
}
```

## API Endpoints

### Cart APIs

- `POST /carts` - Tạo cart mới
- `GET /carts` - Lấy tất cả cart
- `GET /carts/:id` - Lấy cart theo ID
- `GET /carts/user/:userId` - Lấy cart theo user
- `DELETE /carts/:id` - Xóa cart
- `POST /carts/:id/checkout` - Tạo order từ cart

### CartItem APIs

- `POST /cart-items` - Thêm item vào cart
- `GET /cart-items/cart/:cartId` - Lấy items của cart
- `PUT /cart-items/:id` - Cập nhật số lượng
- `DELETE /cart-items/:id` - Xóa item

## Frontend Implementation

### 1. API Functions (`app/utils/api.js`)

```javascript
// Cart APIs
export const createCart = async (userId) => { ... }
export const getCartByUser = async (userId) => { ... }
export const deleteCart = async (cartId) => { ... }
export const createOrderFromCart = async (cartId, orderData) => { ... }

// CartItem APIs
export const addCartItem = async (cartItemData) => { ... }
export const getCartItemsByCart = async (cartId) => { ... }
export const updateCartItemQuantity = async (itemId, quantity) => { ... }
export const deleteCartItem = async (itemId) => { ... }
```

### 2. useCart Hook (`app/hooks/useCart.js`)

```javascript
const {
  cartItems, // Danh sách items trong cart
  cartCount, // Số lượng items
  cartId, // ID của cart
  loading, // Trạng thái loading
  addToCart, // Thêm sản phẩm vào cart
  updateQuantity, // Cập nhật số lượng
  removeFromCart, // Xóa sản phẩm khỏi cart
  getTotal, // Tính tổng tiền
  isInCart, // Kiểm tra sản phẩm có trong cart không
  refreshCart, // Refresh dữ liệu cart
} = useCart();
```

### 3. Sử dụng trong Components

#### ProductCard Component

```javascript
import { useCart } from "../hooks/useCart";

const ProductCard = ({ product }) => {
  const { addToCart, isInCart } = useCart();

  const handleAddToCart = async () => {
    await addToCart(product, 1);
  };

  return (
    <TouchableOpacity onPress={handleAddToCart}>
      <Text>{isInCart(product._id) ? "Đã có trong giỏ" : "Thêm vào giỏ"}</Text>
    </TouchableOpacity>
  );
};
```

#### CartScreen Component

```javascript
import { useCart } from "../hooks/useCart";

const CartScreen = () => {
  const { cartItems, loading, updateQuantity, removeFromCart, getTotal } =
    useCart();

  // Hiển thị danh sách sản phẩm
  // Xử lý cập nhật số lượng
  // Xử lý xóa sản phẩm
};
```

#### HomeScreen với Cart Badge

```javascript
import { useCart } from "../hooks/useCart";

const HomeScreen = () => {
  const { cartCount } = useCart();

  return (
    <TouchableOpacity onPress={() => navigation.navigate("Cart")}>
      <Ionicons name="cart-outline" size={24} />
      {cartCount > 0 && (
        <View style={styles.cartBadge}>
          <Text>{cartCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
```

## Flow hoạt động

### 1. Thêm sản phẩm vào cart

1. User click "Thêm vào giỏ hàng"
2. `addToCart()` được gọi với product data
3. Nếu user chưa có cart → tạo cart mới
4. Thêm cart item với product_id, quantity
5. Cập nhật local state
6. Hiển thị thông báo thành công

### 2. Hiển thị cart

1. `useCart` hook tự động fetch cart data khi component mount
2. Lấy cart theo user_id
3. Lấy cart items theo cart_id
4. Hiển thị danh sách sản phẩm với thông tin đầy đủ

### 3. Cập nhật số lượng

1. User thay đổi số lượng
2. `updateQuantity()` được gọi
3. API cập nhật số lượng trên server
4. Cập nhật local state

### 4. Xóa sản phẩm

1. User click nút xóa
2. Hiển thị confirm dialog
3. `removeFromCart()` được gọi
4. API xóa item trên server
5. Cập nhật local state

## Lưu ý quan trọng

1. **Authentication**: Cart system yêu cầu user đã đăng nhập
2. **Error Handling**: Tất cả API calls đều có try-catch
3. **Loading States**: Hiển thị loading khi đang fetch data
4. **Optimistic Updates**: Cập nhật UI ngay lập tức, sau đó sync với server
5. **Data Consistency**: Cart data được lưu trữ với thông tin sản phẩm tại thời điểm thêm vào

## Testing

Chạy test cart system:

```bash
node test-cart-system.js
```

Test sẽ kiểm tra:

- Tạo cart
- Thêm item
- Cập nhật số lượng
- Xóa item
- Xóa cart

## Troubleshooting

### Lỗi thường gặp

1. **Cart không tìm thấy**: User chưa có cart, sẽ tự động tạo mới
2. **Product không tồn tại**: Kiểm tra product_id có hợp lệ không
3. **Network error**: Kiểm tra kết nối và API endpoint
4. **Authentication error**: Kiểm tra token và user session

### Debug

- Sử dụng console.log trong useCart hook
- Kiểm tra Network tab trong DevTools
- Xem logs của backend server
