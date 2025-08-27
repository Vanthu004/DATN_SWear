#!/usr/bin/env node

/**
 * Script để test notifications
 * Chạy: node scripts/test-notifications.js
 */

const { sendPushNotification } = require('../app/services/pushNotificationService');

// Test data
const testToken = 'ExponentPushToken[your-test-token-here]';
const testOrderData = {
  orderId: 'TEST123',
  userId: 'test-user-id',
  timestamp: new Date().toISOString(),
};

// Test notifications
const testNotifications = [
  {
    title: '🎉 Đặt hàng thành công!',
    body: `Đơn hàng #${testOrderData.orderId} của bạn đã được đặt thành công. Chúng tôi sẽ xử lý sớm nhất có thể.`,
    data: { type: 'order_success', orderId: testOrderData.orderId }
  },
  {
    title: '✅ Đơn hàng đã được xác nhận',
    body: `Đơn hàng #${testOrderData.orderId} đã được xác nhận và đang được chuẩn bị.`,
    data: { type: 'order_confirmed', orderId: testOrderData.orderId }
  },
  {
    title: '🚚 Đơn hàng đang giao',
    body: `Đơn hàng #${testOrderData.orderId} đã được shipper nhận và đang trên đường giao đến bạn.`,
    data: { type: 'order_shipping', orderId: testOrderData.orderId }
  },
  {
    title: '📦 Giao hàng thành công',
    body: `Đơn hàng #${testOrderData.orderId} đã được giao thành công. Cảm ơn bạn đã mua sắm!`,
    data: { type: 'order_delivered', orderId: testOrderData.orderId }
  },
  {
    title: '❌ Đơn hàng đã bị hủy',
    body: `Đơn hàng #${testOrderData.orderId} đã bị hủy. Vui lòng liên hệ hỗ trợ nếu có thắc mắc.`,
    data: { type: 'order_cancelled', orderId: testOrderData.orderId }
  },
  {
    title: '⚠️ Vấn đề với đơn hàng',
    body: `Đơn hàng #${testOrderData.orderId} gặp vấn đề. Chúng tôi sẽ liên hệ bạn sớm nhất.`,
    data: { type: 'order_issue', orderId: testOrderData.orderId }
  }
];

async function testNotifications() {
  console.log('🚀 Bắt đầu test notifications...\n');

  for (let i = 0; i < testNotifications.length; i++) {
    const notification = testNotifications[i];
    
    console.log(`📱 Test notification ${i + 1}/${testNotifications.length}:`);
    console.log(`   Title: ${notification.title}`);
    console.log(`   Body: ${notification.body}`);
    console.log(`   Data: ${JSON.stringify(notification.data)}\n`);

    try {
      const result = await sendPushNotification(
        testToken,
        notification.title,
        notification.body,
        notification.data
      );

      if (result.success) {
        console.log('   ✅ Gửi thành công!\n');
      } else {
        console.log(`   ❌ Lỗi: ${result.error}\n`);
      }
    } catch (error) {
      console.log(`   ❌ Exception: ${error.message}\n`);
    }

    // Delay giữa các notifications
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('🏁 Test hoàn thành!');
}

// Test với token thật
async function testWithRealToken() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('🔑 Nhập Expo Push Token để test:');
  console.log('   (Lấy từ console.log trong app hoặc Expo Dev Tools)\n');

  rl.question('Token: ', async (token) => {
    if (token && token.trim()) {
      console.log(`\n🎯 Testing với token: ${token}\n`);
      
      // Test một notification đơn giản
      const result = await sendPushNotification(
        token.trim(),
        '🧪 Test Notification',
        'Đây là thông báo test từ script!',
        { test: true, timestamp: new Date().toISOString() }
      );

      if (result.success) {
        console.log('✅ Test notification gửi thành công!');
        console.log('📱 Kiểm tra thiết bị của bạn.');
      } else {
        console.log(`❌ Lỗi: ${result.error}`);
      }
    } else {
      console.log('❌ Token không hợp lệ!');
    }
    
    rl.close();
  });
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--real-token')) {
    await testWithRealToken();
  } else {
    console.log('💡 Sử dụng --real-token để test với token thật\n');
    await testNotifications();
  }
}

// Run script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testNotifications,
  testWithRealToken
};
