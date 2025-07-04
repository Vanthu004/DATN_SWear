import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export const useCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const { userInfo } = useAuth();
  const USER_ID = userInfo?._id || userInfo?.id;

  // Lấy dữ liệu giỏ hàng
  const fetchCartData = async () => {
    if (!USER_ID) return;
    
    try {
      setLoading(true);
      console.log("🧪 Gọi API cart của user:", USER_ID);

      // 1. Lấy Cart theo user_id
      let cart;
      try {
        const cartRes = await api.get(`/cart/api/carts/user/${USER_ID}`);
        cart = cartRes.data;
        console.log("Cart:", cart);
      } catch (err) {
        if (err.response?.status === 404) {
          console.log("❌ User chưa có cart, sẽ tạo mới khi cần");
          setCartItems([]);
          setCartCount(0);
          return;
        }
        throw err;
      }

      if (!cart) {
        console.log("❌ Không tìm thấy cart cho user");
        setCartItems([]);
        setCartCount(0);
        return;
      }

      // 2. Lấy CartItem theo cart_id
      const cartItemRes = await api.get(`/cart-items/api/cart-items/cart/${cart._id}`);
      const items = cartItemRes.data;
      console.log("CartItem:", items);

      // Kiểm tra và log các items có product_id null
      const invalidItems = items.filter(item => item.product_id === null || item.product_id === undefined);
      if (invalidItems.length > 0) {
        console.log("⚠️ Phát hiện", invalidItems.length, "items có product_id null:", invalidItems.map(item => item._id));
      }

      // 3. Xử lý cart items mà không cần lấy thông tin sản phẩm từ API
      const processedItems = items
        .filter(item => item.product_id !== null && item.product_id !== undefined) // Lọc bỏ items có product_id null
        .map(item => {
          // Nếu item.product_id là object (đã được populate), sử dụng luôn
          if (typeof item.product_id === 'object' && item.product_id._id) {
            return {
              ...item,
              product: item.product_id, // Sử dụng dữ liệu đã có
              product_id: item.product_id._id // Chuẩn hóa product_id
            };
          }
          
          // Nếu item.product_id là string, tạo object product giả
          return {
            ...item,
            product: {
              _id: item.product_id,
              name: `Product ${item.product_id}`,
              price: 0,
              image_url: null
            }
          };
        });

      setCartItems(processedItems);
      setCartCount(processedItems.length);
    } catch (err) {
      console.error("❌ Lỗi fetch cart:", err);
      setCartItems([]);
      setCartCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Thêm sản phẩm vào giỏ hàng
  const addToCart = async (product, quantity = 1, size = null, color = null) => {
    if (!USER_ID) {
      Alert.alert("Lỗi", "Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
      return false;
    }

    try {
      setLoading(true);
      console.log("🛒 Thêm sản phẩm vào giỏ hàng:", product.name);

      // 1. Lấy hoặc tạo cart cho user
      let cart;
      try {
        const cartRes = await api.get(`/cart/api/carts/user/${USER_ID}`);
        cart = cartRes.data;
      } catch (err) {
        if (err.response?.status === 404) {
          // Nếu không có cart, tạo mới
          console.log("🆕 Tạo cart mới cho user");
          const createCartRes = await api.post('/cart/api/carts', {
            user_id: USER_ID
          });
          cart = createCartRes.data;
        } else {
          throw err;
        }
      }

      // 2. Thêm item vào cart
      const cartItemData = {
        cart_id: cart._id,
        product_id: product._id,
        quantity: quantity,
        size: size,
        color: color
      };

      const addItemRes = await api.post('/cart-items/api/cart-items', cartItemData);
      console.log("✅ Đã thêm sản phẩm vào giỏ hàng:", addItemRes.data);

      // 3. Thêm sản phẩm vào local state ngay lập tức
      const newItem = {
        ...addItemRes.data,
        product: product // Sử dụng dữ liệu sản phẩm đã có
      };
      
      setCartItems(prev => [...prev, newItem]);
      setCartCount(prev => prev + 1);
      
      Alert.alert("Thành công", "Đã thêm sản phẩm vào giỏ hàng");
      return true;
    } catch (err) {
      console.error("❌ Lỗi thêm vào giỏ hàng:", err);
      Alert.alert("Lỗi", "Không thể thêm sản phẩm vào giỏ hàng");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật số lượng sản phẩm
  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      await api.put(`/cart-items/api/cart-items/${itemId}`, {
        quantity: newQuantity,
      });

      // Cập nhật local state
      setCartItems((prev) => {
        const updated = [...prev];
        const index = updated.findIndex(item => item._id === itemId);
        if (index !== -1) {
          updated[index] = { ...updated[index], quantity: newQuantity };
        }
        return updated;
      });
    } catch (err) {
      console.error("❌ Lỗi cập nhật số lượng:", err);
      Alert.alert("Lỗi", "Không thể cập nhật số lượng");
    }
  };

  // Xóa sản phẩm khỏi giỏ hàng
  const removeFromCart = async (itemId) => {
    try {
      await api.delete(`/cart-items/api/cart-items/${itemId}`);
      setCartItems((prev) => prev.filter((item) => item._id !== itemId));
      setCartCount(prev => prev - 1);
    } catch (err) {
      console.error("❌ Lỗi xoá sản phẩm:", err);
      Alert.alert("Lỗi", "Không thể xoá sản phẩm khỏi giỏ hàng");
    }
  };

  // Tính tổng tiền
  const getTotal = () => {
    return cartItems.reduce(
      (sum, item) => sum + (item.product?.price || 0) * item.quantity,
      0
    );
  };

  // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
  const isInCart = (productId) => {
    return cartItems.some(item => {
      const itemProductId = typeof item.product_id === 'object' ? item.product_id._id : item.product_id;
      return itemProductId === productId;
    });
  };

  useEffect(() => {
    fetchCartData();
  }, [USER_ID]);

  return {
    cartItems,
    cartCount,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    getTotal,
    isInCart,
    refreshCart: fetchCartData
  };
}; 