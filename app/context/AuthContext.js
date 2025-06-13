import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    // Kiểm tra token đã lưu
    checkLoginState();
  }, []);

  const checkLoginState = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const user = await AsyncStorage.getItem("userInfo");
      if (token) {
        setUserToken(token);
        setUserInfo(JSON.parse(user));
      }
    } catch (error) {
      console.log("Error checking login state:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (token, user) => {
    try {
      await AsyncStorage.setItem("userToken", token);
      await AsyncStorage.setItem("userInfo", JSON.stringify(user));
      setUserToken(token);
      setUserInfo(user);
    } catch (error) {
      console.log("Error storing auth data:", error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("userInfo");
      setUserToken(null);
      setUserInfo(null);
    } catch (error) {
      console.log("Error removing auth data:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        userToken,
        userInfo,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
