// Test file để kiểm tra luồng ZaloPay hoàn chỉnh
const axios = require('axios');

const API_BASE_URL = "http://192.168.1.7:3000/api";

// Test data từ log thực tế
const testData = {
  orderId: "6884900d3b29c77204a32e00",
  app_trans_id: "250726_885078",
  amount: 118950
};

async function testZaloPayFlow() {
  console.log("🧪 Testing Complete ZaloPay Flow...\n");

  try {
    // 1. Test ZaloPay status check
    console.log("📡 Step 1: Checking ZaloPay payment status...");
    const statusResponse = await axios.post(`${API_BASE_URL}/payments/zalopay/check-status`, {
      app_trans_id: testData.app_trans_id
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    });

    console.log("✅ Status Response:", statusResponse.data);

    // 2. Check if payment is successful
    if (statusResponse.data.return_code === 1 && 
        statusResponse.data.return_message === 'Giao dịch thành công') {
      console.log("🎉 Payment is successful!");
      
      // 3. Test order status history
      console.log("\n📡 Step 2: Checking order status history...");
      const orderStatusResponse = await axios.get(`${API_BASE_URL}/order-status-history/${testData.orderId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_TOKEN_HERE'
        }
      });

      console.log("✅ Order Status Response:", orderStatusResponse.data);
      
      // 4. Simulate navigation to OrderSuccess
      console.log("\n📱 Step 3: Simulating navigation to OrderSuccess...");
      console.log("Navigation params:", {
        orderCode: testData.app_trans_id,
        orderId: testData.orderId,
        total: testData.amount
      });
      
      console.log("✅ Flow completed successfully!");
      
    } else {
      console.log("❌ Payment not successful yet");
      console.log("Status:", statusResponse.data.return_message);
    }

  } catch (error) {
    console.error("❌ Error in ZaloPay flow:", error.response?.data || error.message);
  }
}

// Chạy test
testZaloPayFlow(); 