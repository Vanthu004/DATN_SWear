// Debug script để kiểm tra dữ liệu cart
import { api } from './app/utils/api.js';

const debugCart = async () => {
  try {
    console.log('🔍 Debug Cart Data...');
    
    // Test API cart
    const cartResponse = await api.get('/cart/user/689de91180fa2c570c2cfc41');
    console.log('📦 Cart Response:', JSON.stringify(cartResponse.data, null, 2));
    
    if (cartResponse.data._id) {
      const itemsResponse = await api.get(`/cart-items/cart/${cartResponse.data._id}?populate=product_id`);
      console.log('🛍️ Cart Items Response:', JSON.stringify(itemsResponse.data, null, 2));
      
      // Kiểm tra từng item
      itemsResponse.data.forEach((item, index) => {
        console.log(`\n📋 Item ${index + 1}:`);
        console.log('  - _id:', item._id);
        console.log('  - product_id:', item.product_id);
        console.log('  - product_id type:', typeof item.product_id);
        console.log('  - product_name:', item.product_name);
        console.log('  - price_at_time:', item.price_at_time);
        console.log('  - product_image:', item.product_image);
      });
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error.response?.data || error.message);
  }
};

// Chạy debug
debugCart();
