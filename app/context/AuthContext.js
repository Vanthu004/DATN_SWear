import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../utils/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  useEffect(() => {
    // Kiểm tra token đã lưu
    checkLoginState();
  }, []);

  const checkLoginState = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const user = await AsyncStorage.getItem("userInfo");
      const emailVerified = await AsyncStorage.getItem("isEmailVerified");
      
      console.log('Checking login state:', {
        hasToken: !!token,
        hasUser: !!user,
        emailVerified: emailVerified
      });
      
      if (token && user) {
        const userData = JSON.parse(user);
        
        // Kiểm tra xem user có email_verified field không
        const isVerified = emailVerified === 'true' || userData.email_verified === true;
        
        console.log('User data:', userData);
        console.log('Email verified status:', isVerified);
        
        setUserToken(token);
        setUserInfo(userData);
        setIsEmailVerified(isVerified);
        
        // Không logout khi email chưa verified vì user có thể đang trong quá trình xác nhận
        // Chỉ logout khi không có token hoặc user
      }
    } catch (error) {
      console.log("Error checking login state:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (token, user, verified = true) => {
    try {
      await AsyncStorage.setItem("userToken", token);
      await AsyncStorage.setItem("userInfo", JSON.stringify(user));
      await AsyncStorage.setItem("isEmailVerified", verified.toString());
      
      setUserToken(token);
      setUserInfo(user);
      setIsEmailVerified(verified);
    } catch (error) {
      console.log("Error storing auth data:", error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("userInfo");
      await AsyncStorage.removeItem("isEmailVerified");
      
      setUserToken(null);
      setUserInfo(null);
      setIsEmailVerified(false);
    } catch (error) {
      console.log("Error removing auth data:", error);
    }
  };

  const updateEmailVerificationStatus = async (verified) => {
    try {
      await AsyncStorage.setItem("isEmailVerified", verified.toString());
      setIsEmailVerified(verified);
      
      // Cập nhật userInfo nếu có
      if (userInfo) {
        const updatedUserInfo = { ...userInfo, email_verified: verified };
        await AsyncStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));
        setUserInfo(updatedUserInfo);
      }
      
      console.log("Email verification status updated:", verified);
    } catch (error) {
      console.log("Error updating email verification status:", error);
    }
  };

  const updateUserInfo = async (newUserInfo) => {
    try {
      console.log('AuthContext: Updating user info from:', userInfo);
      console.log('AuthContext: Updating user info to:', newUserInfo);
      
      await AsyncStorage.setItem("userInfo", JSON.stringify(newUserInfo));
      setUserInfo(newUserInfo);
      console.log("User info updated successfully:", newUserInfo);
    } catch (error) {
      console.log("Error updating user info:", error);
    }
  };

  const refreshUserData = async () => {
    if (!userToken) return;
    
    try {
      console.log('Refreshing user data from server...');
      

      // Sử dụng api instance thay vì fetch trực tiếp
      const response = await api.get('/users/profile');
      
      if (response.data && response.data.user) {
        console.log('Fresh user data from server:', response.data.user);
        await updateUserInfo(response.data.user);
        return response.data.user;
      }
    } catch (error) {
      console.log('Error refreshing user data:', error);
    }
    
    return null;
  };

  const clearAllData = async () => {
    try {
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("userInfo");
      await AsyncStorage.removeItem("isEmailVerified");
      
      setUserToken(null);
      setUserInfo(null);
      setIsEmailVerified(false);
      
      console.log("All auth data cleared");
    } catch (error) {
      console.log("Error clearing auth data:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        userToken,
        userInfo,
        isEmailVerified,
        login,
        logout,
        updateEmailVerificationStatus,
        updateUserInfo,
        refreshUserData,
        clearAllData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
