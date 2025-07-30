const axios = require('axios');

const API_BASE_URL = "http://192.168.1.85:3000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Test data
const TEST_USER_ID = "65f1a2b3c4d5e6f7g8h9i0j1"; // Thay bằng user ID thực tế
const TEST_PRODUCT_ID = "65f1a2b3c4d5e6f7g8h9i0j2"; // Thay bằng product ID thực tế
const TEST_PRODUCT_VARIANT_ID = "65f1a2b3c4d5e6f7g8h9i0j3"; // Thay bằng variant ID thực tế

async function testCartAPIs() {
  console.log("🧪 Bắt đầu test Cart APIs...\n");

  try {
    // 1. Test tạo cart mới
    console.log("1. Test tạo cart mới...");
    const createCartResponse = await api.post("/cart", {
      user_id: TEST_USER_ID,
      note: "Test cart"
    });
    console.log("✅ Tạo cart thành công:", createCartResponse.data);
    const cartId = createCartResponse.data.data._id;

    // 2. Test lấy cart theo user
    console.log("\n2. Test lấy cart theo user...");
    const getCartByUserResponse = await api.get(`/cart/user/${TEST_USER_ID}`);
    console.log("✅ Lấy cart theo user thành công:", getCartByUserResponse.data);

    // 3. Test lấy tất cả carts với phân trang
    console.log("\n3. Test lấy tất cả carts với phân trang...");
    const getAllCartsResponse = await api.get("/cart", {
      params: { status: "active", page: 1, limit: 10 }
    });
    console.log("✅ Lấy tất cả carts thành công:", getAllCartsResponse.data);

    // 4. Test thêm item vào cart
    console.log("\n4. Test thêm item vào cart...");
    const addCartItemResponse = await api.post("/cart-item", {
      cart_id: cartId,
      product_id: TEST_PRODUCT_ID,
      product_variant_id: TEST_PRODUCT_VARIANT_ID,
      quantity: 2
    });
    console.log("✅ Thêm cart item thành công:", addCartItemResponse.data);
    const cartItemId = addCartItemResponse.data.data._id;

    // 5. Test lấy items của cart
    console.log("\n5. Test lấy items của cart...");
    const getCartItemsResponse = await api.get(`/cart-item/cart/${cartId}`);
    console.log("✅ Lấy cart items thành công:", getCartItemsResponse.data);

    // 6. Test cập nhật số lượng item
    console.log("\n6. Test cập nhật số lượng item...");
    const updateQuantityResponse = await api.put(`/cart-item/${cartItemId}`, {
      quantity: 3
    });
    console.log("✅ Cập nhật số lượng thành công:", updateQuantityResponse.data);

    // 7. Test cập nhật trạng thái cart
    console.log("\n7. Test cập nhật trạng thái cart...");
    const updateCartStatusResponse = await api.put(`/cart/${cartId}`, {
      status: "active",
      note: "Updated cart status"
    });
    console.log("✅ Cập nhật trạng thái cart thành công:", updateCartStatusResponse.data);

    // 8. Test xóa item khỏi cart
    console.log("\n8. Test xóa item khỏi cart...");
    const deleteCartItemResponse = await api.delete(`/cart-item/${cartItemId}`);
    console.log("✅ Xóa cart item thành công:", deleteCartItemResponse.data);

    // 9. Test xóa cart
    console.log("\n9. Test xóa cart...");
    const deleteCartResponse = await api.delete(`/cart/${cartId}`);
    console.log("✅ Xóa cart thành công:", deleteCartResponse.data);

    console.log("\n🎉 Tất cả tests thành công!");

  } catch (error) {
    console.error("❌ Test thất bại:", error.response?.data || error.message);
  }
}

async function testCartFlow() {
  console.log("🧪 Bắt đầu test Cart Flow...\n");

  try {
    // 1. Tạo cart
    console.log("1. Tạo cart...");
    const createCartResponse = await api.post("/cart", {
      user_id: TEST_USER_ID
    });
    const cartId = createCartResponse.data.data._id;
    console.log("✅ Cart ID:", cartId);

    // 2. Thêm nhiều items
    console.log("\n2. Thêm nhiều items...");
    const itemsToAdd = [
      { product_id: TEST_PRODUCT_ID, quantity: 1 },
      { product_id: TEST_PRODUCT_ID, quantity: 2, product_variant_id: TEST_PRODUCT_VARIANT_ID }
    ];

    for (let i = 0; i < itemsToAdd.length; i++) {
      const item = itemsToAdd[i];
      const addResponse = await api.post("/cart-item", {
        cart_id: cartId,
        ...item
      });
      console.log(`✅ Thêm item ${i + 1}:`, addResponse.data.data._id);
    }

    // 3. Lấy cart items
    console.log("\n3. Lấy cart items...");
    const getItemsResponse = await api.get(`/cart-item/cart/${cartId}`);
    console.log("✅ Số lượng items:", getItemsResponse.data.data.length);

    // 4. Test checkout (tạo order từ cart)
    console.log("\n4. Test checkout...");
    const checkoutResponse = await api.post(`/cart/${cartId}/checkout`, {
      shippingmethod_id: "shipping_method_id",
      paymentmethod_id: "payment_method_id",
      shipping_address: "Test address",
      note: "Test order"
    });
    console.log("✅ Checkout thành công:", checkoutResponse.data);

    console.log("\n🎉 Cart Flow test thành công!");

  } catch (error) {
    console.error("❌ Cart Flow test thất bại:", error.response?.data || error.message);
  }
}

// Chạy tests
async function runTests() {
  console.log("🚀 Bắt đầu test Cart System...\n");
  
  await testCartAPIs();
  console.log("\n" + "=".repeat(50) + "\n");
  await testCartFlow();
}

runTests().catch(console.error); 