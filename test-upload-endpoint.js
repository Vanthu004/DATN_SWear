// Test upload endpoint
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const API_BASE_URL = "http://192.168.0.104:3000/api";

async function testUploadEndpoint() {
  console.log('🧪 Testing upload endpoint...');
  
  try {
    // Test 1: Kiểm tra endpoint có tồn tại không
    console.log('📡 Testing endpoint availability...');
    const testResponse = await axios.get(`${API_BASE_URL}/upload`);
    console.log('✅ Endpoint exists, response:', testResponse.data);
  } catch (error) {
    if (error.response?.status === 405) {
      console.log('✅ Endpoint exists (Method Not Allowed for GET is expected)');
    } else {
      console.log('❌ Endpoint test failed:', error.message);
    }
  }

  try {
    // Test 2: Kiểm tra server có hoạt động không
    console.log('📡 Testing server connectivity...');
    const serverTest = await axios.get(`${API_BASE_URL.replace('/api', '')}/health`);
    console.log('✅ Server is running, health check:', serverTest.data);
  } catch (error) {
    console.log('⚠️ Server health check failed:', error.message);
  }

  try {
    // Test 3: Kiểm tra cấu trúc API
    console.log('📡 Testing API structure...');
    const apiTest = await axios.get(`${API_BASE_URL}/reviews`);
    console.log('✅ Reviews endpoint works, count:', apiTest.data?.length || 'unknown');
  } catch (error) {
    console.log('⚠️ Reviews endpoint test failed:', error.message);
  }

  try {
    // Test 4: Thử POST /api/upload với multipart/form-data
    console.log('📤 Testing POST /upload with multipart/form-data...');
    const filePath = path.join(__dirname, 'assets', 'sp1.png');
    if (!fs.existsSync(filePath)) {
      console.log('⚠️ Test image not found at', filePath);
    } else {
      const form = new FormData();
      form.append('image', fs.createReadStream(filePath), {
        filename: 'test.png',
        contentType: 'image/png',
      });
      const uploadRes = await axios.post(`${API_BASE_URL}/upload`, form, {
        headers: form.getHeaders(),
        maxBodyLength: Infinity,
      });
      console.log('✅ Upload success:', uploadRes.data);
    }
  } catch (error) {
    console.log('❌ Upload POST test failed:', error.message, error.response?.data || '');
  }

  console.log('🎯 Upload endpoint test completed!');
  console.log('📝 Next steps:');
  console.log('1. Check if server is running on 192.168.0.104:3000');
  console.log('2. Verify /upload endpoint accepts POST with multipart/form-data');
  console.log('3. Check server logs for upload requests');
}

testUploadEndpoint().catch(console.error);

