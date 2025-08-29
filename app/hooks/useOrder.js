import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { useAuth } from "../context/AuthContext";
import {
  createOrder,
  createOrderWithDetails,
  getOrderById,
  getOrdersByUser,
  updateOrder,
} from "../utils/api";

export const useOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const { userInfo } = useAuth();
  const USER_ID = userInfo?._id || userInfo?.id;

  // Lấy danh sách đơn hàng của user
  const fetchUserOrders = async () => {
    if (!USER_ID) return;

    try {
      setLoading(true);
      const userOrders = await getOrdersByUser(USER_ID);
      setOrders(userOrders);
    } catch (error) {
      console.error("❌ Lỗi fetch user orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Tạo đơn hàng từ cart
  const createOrderFromCart = async (cartItems, orderData) => {
    if (!USER_ID) {
      Alert.alert("Lỗi", "Vui lòng đăng nhập để đặt hàng");
      return null;
    }

    try {
      setLoading(true);

      // console.log("🛒 Tạo đơn hàng từ cart:", cartItems.length, "items");


      // Chuẩn bị order details từ cart items
      const orderDetails = cartItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      }));

      // Dữ liệu đơn hàng - sử dụng ObjectId hợp lệ hoặc tạo temporary
      const orderPayload = {
        user_id: USER_ID,
        total_price: orderData.total,
        // Sử dụng ObjectId hợp lệ hoặc tạo temporary ID
        shippingmethod_id: orderData.shippingMethodId, // Temporary ObjectId
        paymentmethod_id: orderData.paymentMethodId, // Temporary ObjectId
        shipping_address: orderData.shippingAddress,
        voucher_ids: orderData.voucher_ids || [],
        note: orderData.note || "",
        orderDetails: orderDetails,
      };


    //  console.log("📦 Order payload:", orderPayload);

      // Tạo đơn hàng với details
      const result = await createOrderWithDetails(orderPayload);
     // console.log("✅ Đơn hàng được tạo:", result);


      // Refresh danh sách đơn hàng
      await fetchUserOrders();

      // Alert.alert(
      //   "Thành công",
      //   `Đơn hàng ${result.order.order_code} đã được tạo thành công!`
      // );

      return result;
    } catch (error) {
      console.error("❌ Lỗi tạo đơn hàng:", error);

      // Hiển thị lỗi chi tiết hơn
      let errorMessage = "Không thể tạo đơn hàng. Vui lòng thử lại.";

      if (error.response?.data?.error) {
        const backendError = error.response.data.error;
        if (backendError.includes("Cast to ObjectId failed")) {
          errorMessage = "Lỗi dữ liệu: Vui lòng kiểm tra thông tin đơn hàng.";
        } else if (backendError.includes("validation failed")) {
          errorMessage =
            "Lỗi validation: Vui lòng kiểm tra thông tin bắt buộc.";
        } else {
          errorMessage = `Lỗi backend: ${backendError}`;
        }
      }

      Alert.alert("Lỗi", errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Tạo đơn hàng đơn giản
  const createSimpleOrder = async (orderData) => {
    if (!USER_ID) {
      Alert.alert("Lỗi", "Vui lòng đăng nhập để đặt hàng");
      return null;
    }

    try {
      setLoading(true);
      const orderPayload = {
        ...orderData,
        user_id: USER_ID,
        // Sử dụng ObjectId hợp lệ
        shippingmethod_id:
          orderData.shippingmethod_id || "507f1f77bcf86cd799439011",
        paymentmethod_id:
          orderData.paymentmethod_id || "507f1f77bcf86cd799439012",
      };

      const result = await createOrder(orderPayload);
      //console.log("✅ Đơn hàng đơn giản được tạo:", result);

      // Refresh danh sách đơn hàng
      await fetchUserOrders();

      Alert.alert("Thành công", "Đơn hàng đã được tạo thành công!");
      return result;
    } catch (error) {
      console.error("❌ Lỗi tạo đơn hàng đơn giản:", error);
      Alert.alert("Lỗi", "Không thể tạo đơn hàng. Vui lòng thử lại.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Lấy chi tiết đơn hàng
  const getOrderDetails = async (orderId) => {
    try {
      const order = await getOrderById(orderId);
      return order;
    } catch (error) {
      console.error("❌ Lỗi lấy chi tiết đơn hàng:", error);
      return null;
    }
  };

  // Cập nhật trạng thái đơn hàng
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const result = await updateOrder(orderId, { status: newStatus });
      //console.log("✅ Cập nhật trạng thái đơn hàng:", result);

      // Refresh danh sách đơn hàng
      await fetchUserOrders();

      return result;
    } catch (error) {
      console.error("❌ Lỗi cập nhật trạng thái đơn hàng:", error);
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái đơn hàng");
      return null;
    }
  };

  // Tính tổng tiền từ cart items
  const calculateTotalFromCart = (cartItems, shipping = 0, tax = 0) => {
    const subtotal = cartItems.reduce(
      (sum, item) => sum + (item.price_at_time || 0) * item.quantity,
      0
    );
    return subtotal + shipping + tax;
  };

  useEffect(() => {
    fetchUserOrders();
  }, [USER_ID]);

  return {
    orders,
    loading,
    createOrderFromCart,
    createSimpleOrder,
    getOrderDetails,
    updateOrderStatus,
    calculateTotalFromCart,
    refreshOrders: fetchUserOrders,
  };
};
