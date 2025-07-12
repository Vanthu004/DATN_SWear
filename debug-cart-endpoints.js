const axios = require("axios");

const API_BASE_URL = "http://192.168.1.15:3000/api";

async function debugCartEndpoints() {
  console.log("🔍 Debug Cart Endpoints...\n");

  const endpoints = [
    { method: "GET", url: "/carts", description: "Get all carts" },
    {
      method: "GET",
      url: "/carts/user/test123",
      description: "Get cart by user",
    },
    {
      method: "POST",
      url: "/carts",
      description: "Create cart",
      data: { user_id: "test123" },
    },
    { method: "GET", url: "/cart-items", description: "Get all cart items" },
    {
      method: "GET",
      url: "/cart-items/cart/test123",
      description: "Get cart items by cart",
    },
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing: ${endpoint.method} ${endpoint.url}`);
      console.log(`Description: ${endpoint.description}`);

      const config = {
        method: endpoint.method.toLowerCase(),
        url: `${API_BASE_URL}${endpoint.url}`,
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (endpoint.data) {
        config.data = endpoint.data;
      }

      const response = await axios(config);
      console.log(`✅ Status: ${response.status}`);
      console.log(`✅ Response:`, response.data);
    } catch (error) {
      console.log(`❌ Status: ${error.response?.status || "Network Error"}`);
      console.log(`❌ Error:`, error.response?.data || error.message);
    }

    console.log("---\n");
  }
}

// Test backend connectivity
async function testBackendConnectivity() {
  console.log("🌐 Testing Backend Connectivity...\n");

  try {
    const response = await axios.get(
      `${API_BASE_URL.replace("/api", "")}/health`
    );
    console.log("✅ Backend is running");
    console.log("✅ Health check response:", response.data);
  } catch (error) {
    console.log("❌ Backend connectivity issue:");
    console.log("❌ Error:", error.message);
    console.log(
      "❌ Please check if backend is running on http://192.168.1.15:3000"
    );
  }
}

// Run tests
async function runDebug() {
  await testBackendConnectivity();
  console.log("\n" + "=".repeat(50) + "\n");
  await debugCartEndpoints();
}

runDebug().catch(console.error);
