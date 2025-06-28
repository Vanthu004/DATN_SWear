// Test file để kiểm tra API flow update profile
// Chạy file này để test các API endpoints

const API_BASE_URL = 'http://192.168.1.5:3000/api';

// Test 1: Upload ảnh
async function testUploadAvatar() {
  console.log('=== Test Upload Avatar ===');
  
  try {
    // Giả lập ảnh (trong thực tế sẽ là file thật)
    const mockImageUri = 'file://mock-image.jpg';
    
    const formData = new FormData();
    formData.append("image", {
      uri: mockImageUri,
      type: "image/jpeg", 
      name: "avatar.jpg"
    });

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      headers: { 
        "Authorization": "Bearer YOUR_TOKEN_HERE",
        "Content-Type": "multipart/form-data"
      },
      body: formData
    });
    
    const result = await response.json();
    console.log('Upload response:', result);
    
    if (result.upload && result.upload._id) {
      console.log('✅ Upload thành công, uploadId:', result.upload._id);
      return result.upload._id;
    } else {
      console.log('❌ Upload thất bại');
      return null;
    }
  } catch (error) {
    console.error('❌ Upload error:', error);
    return null;
  }
}

// Test 2: Update avatar
async function testUpdateAvatar(uploadId) {
  console.log('=== Test Update Avatar ===');
  
  try {
    const response = await fetch(`${API_BASE_URL}/users/update-avatar`, {
      method: "PUT",
      headers: {
        "Authorization": "Bearer YOUR_TOKEN_HERE",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ uploadId })
    });
    
    const result = await response.json();
    console.log('Update avatar response:', result);
    
    if (response.ok) {
      console.log('✅ Update avatar thành công');
      return true;
    } else {
      console.log('❌ Update avatar thất bại');
      return false;
    }
  } catch (error) {
    console.error('❌ Update avatar error:', error);
    return false;
  }
}

// Test 3: Update profile
async function testUpdateProfile() {
  console.log('=== Test Update Profile ===');
  
  try {
    const profileData = {
      name: "Test User",
      email: "test@example.com",
      phone_number: "0123456789",
      gender: "male"
    };
    
    const response = await fetch(`${API_BASE_URL}/users/update-profile`, {
      method: "PUT",
      headers: {
        "Authorization": "Bearer YOUR_TOKEN_HERE",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(profileData)
    });
    
    const result = await response.json();
    console.log('Update profile response:', result);
    
    if (response.ok && result.user) {
      console.log('✅ Update profile thành công');
      return true;
    } else {
      console.log('❌ Update profile thất bại');
      return false;
    }
  } catch (error) {
    console.error('❌ Update profile error:', error);
    return false;
  }
}

// Test 4: Full flow
async function testFullFlow() {
  console.log('=== Test Full Flow ===');
  
  // Bước 1: Upload ảnh
  const uploadId = await testUploadAvatar();
  if (!uploadId) {
    console.log('❌ Dừng test vì upload thất bại');
    return;
  }
  
  // Bước 2: Update avatar
  const avatarUpdated = await testUpdateAvatar(uploadId);
  if (!avatarUpdated) {
    console.log('❌ Dừng test vì update avatar thất bại');
    return;
  }
  
  // Bước 3: Update profile
  const profileUpdated = await testUpdateProfile();
  if (profileUpdated) {
    console.log('✅ Full flow thành công!');
  } else {
    console.log('❌ Full flow thất bại ở bước cuối');
  }
}

// Chạy test
// testFullFlow();

module.exports = {
  testUploadAvatar,
  testUpdateAvatar,
  testUpdateProfile,
  testFullFlow
}; 