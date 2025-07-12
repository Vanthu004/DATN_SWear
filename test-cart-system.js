const axios = require("axios");

const API_BASE_URL = "http://192.168.1.15:3000/api";

// Test data
const testUserId = "test_user_id_123";
const testProductId = "test_product_id_456";

async function testCartSystem() {
  console.log("🧪 Bắt đầu test Cart System...\n");

  try {
    // Test 1: Tạo cart
    console.log("1. Test tạo cart...");
    const createCartRes = await axios.post(`${API_BASE_URL}/carts`, {
      user_id: testUserId,
    });
    console.log("✅ Cart được tạo:", createCartRes.data);
    const cartId = createCartRes.data._id;

    // Test 2: Lấy cart theo user
    console.log("\n2. Test lấy cart theo user...");
    const getCartRes = await axios.get(
      `${API_BASE_URL}/carts/user/${testUserId}`
    );
    console.log("✅ Cart được lấy:", getCartRes.data);

    // Test 3: Thêm item vào cart
    console.log("\n3. Test thêm item vào cart...");
    const addItemRes = await axios.post(`${API_BASE_URL}/cart-items`, {
      cart_id: cartId,
      product_id: testProductId,
      quantity: 2,
    });
    console.log("✅ Item được thêm:", addItemRes.data);
    const itemId = addItemRes.data._id;

    // Test 4: Lấy items của cart
    console.log("\n4. Test lấy items của cart...");
    const getItemsRes = await axios.get(
      `${API_BASE_URL}/cart-items/cart/${cartId}`
    );
    console.log("✅ Items được lấy:", getItemsRes.data);

    // Test 5: Cập nhật số lượng
    console.log("\n5. Test cập nhật số lượng...");
    const updateRes = await axios.put(`${API_BASE_URL}/cart-items/${itemId}`, {
      quantity: 3,
    });
    console.log("✅ Số lượng được cập nhật:", updateRes.data);

    // Test 6: Xóa item
    console.log("\n6. Test xóa item...");
    const deleteRes = await axios.delete(
      `${API_BASE_URL}/cart-items/${itemId}`
    );
    console.log("✅ Item được xóa:", deleteRes.data);

    // Test 7: Xóa cart
    console.log("\n7. Test xóa cart...");
    const deleteCartRes = await axios.delete(`${API_BASE_URL}/carts/${cartId}`);
    console.log("✅ Cart được xóa:", deleteCartRes.data);

    console.log("\n🎉 Tất cả test đều thành công!");
  } catch (error) {
    console.error("❌ Test thất bại:", error.response?.data || error.message);
  }
}

// Chạy test
testCartSystem();
