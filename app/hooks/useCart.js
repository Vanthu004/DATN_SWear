import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { useAuth } from "../context/AuthContext";
import {
  addCartItem,
  clearCartItems,
  createCart,
  deleteCartItem,
  getCartByUser,
  getCartItemsByCart,
  updateCartItemQuantity
} from "../utils/api";

export const useCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cartId, setCartId] = useState(null);
  const [cartStatus, setCartStatus] = useState("active");

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
        const response = await getCartByUser(USER_ID);
        cart = response.data; // Access the actual cart object from the 'data' field
        console.log("Cart:", cart);
        setCartId(cart._id);
        setCartStatus(cart.status || "active");
      } catch (err) {
        if (err.response?.status === 404) {
          console.log("❌ User chưa có cart, sẽ tạo mới khi cần");
          setCartId(null);
          setCartStatus("active");
          return;
        }
        throw err;
      }

      if (!cart) {
        console.log("❌ Không tìm thấy cart cho user");
        setCartId(null);
        setCartStatus("active");
        return;
      }

      const itemsResponse = await getCartItemsByCart(cart._id);
      console.log("ItemsResponse:", itemsResponse);
      
      // Xử lý các trường hợp khác nhau của response
      let items;
      if (itemsResponse && typeof itemsResponse === 'object') {
        if (Array.isArray(itemsResponse)) {
          items = itemsResponse; // Response trực tiếp là mảng
        } else if (itemsResponse.data && Array.isArray(itemsResponse.data)) {
          items = itemsResponse.data; // Response có data là mảng
        } else if (itemsResponse.data && itemsResponse.data.items && Array.isArray(itemsResponse.data.items)) {
          items = itemsResponse.data.items; // Response có data.items là mảng
        } else if (itemsResponse.data && Array.isArray(itemsResponse.data.data)) {
          items = itemsResponse.data.data; // Response có data.data là mảng
        } else {
          console.log("⚠️ Không tìm thấy items trong response, đặt thành mảng rỗng");
          console.log("Response structure:", JSON.stringify(itemsResponse, null, 2));
          items = []; // Fallback thành mảng rỗng
        }
      } else {
        items = []; // Fallback thành mảng rỗng
      }
      
      // console.log("CartItem:", items);
      // console.log("CartItem length:", items.length);

      // Kiểm tra items có phải là mảng không
      if (!Array.isArray(items)) {
        console.log("⚠️ Items không phải là mảng, đặt thành mảng rỗng");
        setCartItems([]);
        return;
      }

      const processedItems = items.map((item) => {
        // Kiểm tra nếu item.product_id là object (đã populate)
        if (item.product_id && typeof item.product_id === 'object' && item.product_id._id) {
          return {
            ...item,
            size: item.size || item.product_variant_id?.attributes?.size?.name || item.product_variant_id?.size,
            color: item.color || item.product_variant_id?.attributes?.color?.name || item.product_variant_id?.color,
            product: {
              ...item.product_id, // Sử dụng toàn bộ thông tin sản phẩm đã populate
              _id: item.product_id._id,
              name: item.product_id.name || item.product_name,
              price: item.price_at_time || item.product_id.price,
              image_url: item.product_image || item.product_id.image_url,
              variants: item.product_id.variants || [],
            },
          };
        } else {
          // Fallback cho trường hợp chưa populate
          return {
            ...item,
            size: item.size,
            color: item.color,
            product: {
              _id: item.product_id,
              name: item.product_name,
              price: item.price_at_time,
              image_url: item.product_image,
              variants: [],
            },
          };
        }
      });

      setCartItems(processedItems);
    } catch (err) {
      console.error("❌ Lỗi fetch cart:", err);
      setCartItems([]);
      setCartId(null);
      setCartStatus("active");
    } finally {
      setLoading(false);
    }
  };

  // Thêm sản phẩm vào giỏ hàng với hỗ trợ variants
  const addToCart = async (
    product,
    quantity = 1,
    productVariantId = null
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
          const response = await getCartByUser(USER_ID);
          cart = response.data;
          setCartId(cart._id);
          setCartStatus(cart.status || "active");
        } catch (err) {
          if (err.response?.status === 404) {
            console.log("🆕 Tạo cart mới cho user");
            const createResponse = await createCart(USER_ID);
            cart = createResponse.data;
            setCartId(cart._id);
            setCartStatus("active");
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

      // Thêm product_variant_id nếu có
      if (productVariantId) {
        cartItemData.product_variant_id = productVariantId;
      }

      const newItemResponse = await addCartItem(cartItemData);
      console.log("NewItemResponse:", newItemResponse);
      
      // Xử lý response từ addCartItem
      let newItem;
      if (newItemResponse && typeof newItemResponse === 'object') {
        if (newItemResponse.data) {
          newItem = newItemResponse.data; // Response có data
        } else if (newItemResponse.data && newItemResponse.data.data) {
          newItem = newItemResponse.data.data; // Response có data.data
        } else {
          newItem = newItemResponse; // Response trực tiếp
        }
      } else {
        console.error("❌ Response không hợp lệ từ addCartItem");
        throw new Error("Invalid response from addCartItem");
      }
      
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
      const status = err?.response?.status;
      const apiMsg = err?.response?.data?.msg || err?.response?.data?.message;
      if (status === 400 && apiMsg) {
        Alert.alert("Hết hàng", apiMsg);
        return false;
      }
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
      const updatedItemResponse = await updateCartItemQuantity(itemId, newQuantity);
      console.log("UpdatedItemResponse:", updatedItemResponse);
      
      // Xử lý response từ updateCartItemQuantity
      let updatedItem;
      if (updatedItemResponse && typeof updatedItemResponse === 'object') {
        if (updatedItemResponse.data) {
          updatedItem = updatedItemResponse.data; // Response có data
        } else if (updatedItemResponse.data && updatedItemResponse.data.data) {
          updatedItem = updatedItemResponse.data.data; // Response có data.data
        } else {
          updatedItem = updatedItemResponse; // Response trực tiếp
        }
      } else {
        console.error("❌ Response không hợp lệ từ updateCartItemQuantity");
        throw new Error("Invalid response from updateCartItemQuantity");
      }

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

  // Xóa tất cả items trong cart
  const clearCart = async () => {
    if (!cartId) return;

    try {
      await clearCartItems(cartId);
      setCartItems([]);
      Alert.alert("Thành công", "Đã xóa tất cả sản phẩm khỏi giỏ hàng");
    } catch (err) {
      console.error("❌ Lỗi xóa tất cả sản phẩm:", err);
      Alert.alert("Lỗi", "Không thể xóa tất cả sản phẩm");
    }
  };

  // Cập nhật trạng thái cart
  const updateCartStatusHook = async (status, note = null) => {
    if (!cartId) return;

    try {
      await updateCartStatus(cartId, status, note);
      setCartStatus(status);
      console.log("✅ Đã cập nhật trạng thái cart:", status);
    } catch (err) {
      console.error("❌ Lỗi cập nhật trạng thái cart:", err);
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái giỏ hàng");
    }
  };

  const getTotal = () => {
    return cartItems.reduce(
      (sum, item) => sum + (item.price_at_time || item.product?.price || 0) * item.quantity,
      0
    );
  };

  // Kiểm tra sản phẩm có trong cart không (bao gồm variant)
  const isInCart = (productId, productVariantId = null) => {
    return cartItems.some((item) => {
      const productMatch = item.product_id === productId;
      if (productVariantId) {
        return productMatch && item.product_variant_id === productVariantId;
      }
      return productMatch;
    });
  };

  // Lấy item trong cart theo product và variant
  const getCartItem = (productId, productVariantId = null) => {
    return cartItems.find((item) => {
      const productMatch = item.product_id === productId;
      if (productVariantId) {
        return productMatch && item.product_variant_id === productVariantId;
      }
      return productMatch;
    });
  };

  useEffect(() => {
    fetchCartData();
  }, [USER_ID]);

// ... giữ nguyên phần import và các hàm khác
const getTotalQuantity = () => {
  return cartItems.length;
};


  useEffect(() => {
    fetchCartData();
  }, [USER_ID]);

  return {
    cartItems,
    cartCount: getTotalQuantity(), // ✅ Sửa lại từ cartItems.length
    cartId,
    cartStatus,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    updateCartStatus: updateCartStatusHook,
    getTotal,
    isInCart,
    getCartItem,
    refreshCart: fetchCartData,
  };
};