// Test script để kiểm tra các API endpoints
// Chạy file này để xem backend có những endpoint nào

const API_BASE = 'http://192.168.1.6:3000/api';

// Test các endpoint products
async function testProductEndpoints() {
  console.log('🧪 Testing Product API endpoints...');
  
  const testProductId = '685ec3fd90bb2d4a84bf5848'; // ID từ lỗi bạn gặp
  
  const endpoints = [
    `/products/${testProductId}`,
    `/products/api/products/${testProductId}`,
    `/api/products/${testProductId}`,
    `/products/detail/${testProductId}`,
    `/products/get/${testProductId}`,
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔍 Testing: ${endpoint}`);
      const response = await fetch(`${API_BASE}${endpoint}`);
      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ SUCCESS:', data);
        return endpoint; // Tìm thấy endpoint đúng
      } else {
        console.log('❌ FAILED:', response.status, data);
      }
    } catch (error) {
      console.log('❌ ERROR:', error.message);
    }
  }
  
  return null;
}

// Test các endpoint cart
async function testCartEndpoints() {
  console.log('\n🧪 Testing Cart API endpoints...');
  
  const testUserId = '685fbc5ad6ddc6b2fa9eee6e'; // ID từ lỗi bạn gặp
  
  const endpoints = [
    `/cart/api/carts/user/${testUserId}`,
    `/carts/user/${testUserId}`,
    `/cart/user/${testUserId}`,
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔍 Testing: ${endpoint}`);
      const response = await fetch(`${API_BASE}${endpoint}`);
      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ SUCCESS:', data);
        return endpoint;
      } else {
        console.log('❌ FAILED:', response.status, data);
      }
    } catch (error) {
      console.log('❌ ERROR:', error.message);
    }
  }
  
  return null;
}

// Test các endpoint cart-items
async function testCartItemsEndpoints() {
  console.log('\n🧪 Testing Cart Items API endpoints...');
  
  const testCartId = 'test_cart_id';
  
  const endpoints = [
    `/cart-items/api/cart-items/cart/${testCartId}`,
    `/cart-items/cart/${testCartId}`,
    `/cart/items/${testCartId}`,
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔍 Testing: ${endpoint}`);
      const response = await fetch(`${API_BASE}${endpoint}`);
      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ SUCCESS:', data);
        return endpoint;
      } else {
        console.log('❌ FAILED:', response.status, data);
      }
    } catch (error) {
      console.log('❌ ERROR:', error.message);
    }
  }
  
  return null;
}

// Main test function
async function runEndpointTests() {
  console.log('🚀 Starting API Endpoint Tests...\n');
  
  // Test Product endpoints
  const productEndpoint = await testProductEndpoints();
  
  // Test Cart endpoints
  const cartEndpoint = await testCartEndpoints();
  
  // Test Cart Items endpoints
  const cartItemsEndpoint = await testCartItemsEndpoints();
  
  console.log('\n📋 SUMMARY:');
  console.log('Product endpoint:', productEndpoint || 'NOT FOUND');
  console.log('Cart endpoint:', cartEndpoint || 'NOT FOUND');
  console.log('Cart Items endpoint:', cartItemsEndpoint || 'NOT FOUND');
  
  if (productEndpoint && cartEndpoint && cartItemsEndpoint) {
    console.log('\n✅ All endpoints found! Update your useCart hook with these endpoints.');
  } else {
    console.log('\n❌ Some endpoints not found. Check your backend routes.');
  }
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  runEndpointTests().catch(console.error);
}

module.exports = {
  testProductEndpoints,
  testCartEndpoints,
  testCartItemsEndpoints,
  runEndpointTests
}; 