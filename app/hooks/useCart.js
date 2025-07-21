import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { useAuth } from "../context/AuthContext";
import {
  addCartItem,
  createCart,
  deleteCartItem,
  getCartByUser,
  getCartItemsByCart,
  updateCartItemQuantity,
} from "../utils/api";

export const useCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cartId, setCartId] = useState(null);

  const { userInfo } = useAuth();
  const USER_ID = userInfo?._id || userInfo?.id;

  // Lấy dữ liệu giỏ hàng
  const fetchCartData = async () => {
    if (!USER_ID) return;

    try {
      setLoading(true);
      console.log("🧪 Gọi API cart của user:", USER_ID);

      let cart;
      try {
        cart = await getCartByUser(USER_ID);
        console.log("Cart:", cart);
        setCartId(cart._id);
      } catch (err) {
        if (err.response?.status === 404) {
          console.log("❌ User chưa có cart, sẽ tạo mới khi cần");
          setCartItems([]);
          setCartId(null);
          return;
        }
        throw err;
      }

      if (!cart) {
        console.log("❌ Không tìm thấy cart cho user");
        setCartItems([]);
        setCartId(null);
        return;
      }

      const items = await getCartItemsByCart(cart._id);
      console.log("CartItem:", items);

      const processedItems = items.map((item) => ({
        ...item,
        product: {
          _id: item.product_id,
          name: item.product_name,
          price: item.price_at_time,
          image_url: item.product_image,
        },
      }));

      setCartItems(processedItems);
    } catch (err) {
      console.error("❌ Lỗi fetch cart:", err);
      setCartItems([]);
      setCartId(null);
    } finally {
      setLoading(false);
    }
  };

  // Thêm sản phẩm vào giỏ hàng
  const addToCart = async (
    product,
    quantity = 1,
    size = null,
    color = null
  ) => {
    if (!USER_ID) {
      Alert.alert("Lỗi", "Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
      return false;
    }

    try {
      setLoading(true);
      console.log("🛒 Thêm sản phẩm vào giỏ hàng:", product.name);

      let cart;
      if (!cartId) {
        try {
          cart = await getCartByUser(USER_ID);
          setCartId(cart._id);
        } catch (err) {
          if (err.response?.status === 404) {
            console.log("🆕 Tạo cart mới cho user");
            cart = await createCart(USER_ID);
            setCartId(cart._id);
          } else {
            throw err;
          }
        }
      } else {
        cart = { _id: cartId };
      }

      const cartItemData = {
        cart_id: cart._id,
        product_id: product._id,
        quantity: quantity,
      };

      const newItem = await addCartItem(cartItemData);
      console.log("✅ Đã thêm sản phẩm vào giỏ hàng:", newItem);

      const processedItem = {
        ...newItem,
        product: {
          _id: product._id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
        },
      };

      setCartItems((prev) => [...prev, processedItem]);

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
      const updatedItem = await updateCartItemQuantity(itemId, newQuantity);

      setCartItems((prev) => {
        const updated = [...prev];
        const index = updated.findIndex((item) => item._id === itemId);
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
    await deleteCartItem(itemId);
    
    // Cập nhật local
    setCartItems((prev) => prev.filter((item) => item._id !== itemId));
    
    // 👉 Load lại toàn bộ cart để đồng bộ hóa
    await fetchCartData();
    
  } catch (err) {
    console.error("❌ Lỗi xoá sản phẩm:", err);
    Alert.alert("Lỗi", "Không thể xoá sản phẩm khỏi giỏ hàng");
  }
};


  const getTotal = () => {
    return cartItems.reduce(
      (sum, item) => sum + (item.product?.price || 0) * item.quantity,
      0
    );
  };

  const isInCart = (productId) => {
    return cartItems.some((item) => item.product_id === productId);
  };

  useEffect(() => {
    fetchCartData();
  }, [USER_ID]);

  return {
    cartItems,
    cartCount: cartItems.length,
    cartId,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    getTotal,
    isInCart,
    refreshCart: fetchCartData,
  };
};
