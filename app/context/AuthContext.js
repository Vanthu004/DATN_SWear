// app/context/AuthContext.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import { io } from "socket.io-client";
import { navigationRef } from "../navigation/TabNavigator";
import { api, WEBSOCKET_URL } from "../utils/api";



const socket = io(WEBSOCKET_URL, {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export let logoutGlobal = async () => {};
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isBanned, setIsBanned] = useState(false);

  useEffect(() => {
    logoutGlobal = logout;
    checkLoginState();

    socket.on("connect", () => {
      console.log("WebSocket connected");
    });

    socket.on("disconnect", () => {
      console.log("WebSocket disconnected");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("banned");
    };
  }, []);

  useEffect(() => {
    if (!userInfo) return;

    socket.emit("join", userInfo._id);
    console.log("WebSocket: Joined room", userInfo._id);

    socket.on("banned", async (data) => {
      console.log("WebSocket: Received banned event", data);
      if (!isBanned) {
        setIsBanned(true);
        await logout();
        Alert.alert("Tài khoản bị khóa", data.message, [
          {
            text: "OK",
            onPress: () => {
              console.log("WebSocket: Alert OK pressed, navigation handled by logout");
            },
          },
        ]);
      }
    });

    return () => {
      socket.off("banned");
    };
  }, [userInfo, isBanned]);

  useEffect(() => {
    if (!userToken) return;

    const checkBanStatus = async () => {
      try {
        await refreshUserData();
      } catch (error) {
        console.log("Ban check error:", error.message);
      }
    };

    checkBanStatus();
    const interval = setInterval(checkBanStatus, 30000); // Tăng từ 10s lên 30s
    return () => clearInterval(interval);
  }, [userToken]);

  const checkLoginState = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const user = await AsyncStorage.getItem("userInfo");
      const emailVerified = await AsyncStorage.getItem("isEmailVerified");
      const banMessage = await AsyncStorage.getItem("banMessage");

      console.log("Checking login state:", {
        hasToken: !!token,
        hasUser: !!user,
        emailVerified: emailVerified,
        banMessage: banMessage,
      });

      if (banMessage && !isBanned) {
        console.log("Ban message found in AsyncStorage:", banMessage);
        setIsBanned(true);
        await logout();
        Alert.alert("Tài khoản bị khóa", banMessage, [
          {
            text: "OK",
            onPress: () => {
              console.log("AuthContext: Alert OK pressed, navigation handled by logout");
            },
          },
        ]);
        await AsyncStorage.removeItem("banMessage");
        return;
      }

      if (token && user) {
        const userData = JSON.parse(user);
        const isVerified = emailVerified === "true" || userData.email_verified === true;

        console.log("User data:", userData);
        console.log("Email verified status:", isVerified);

        const now = new Date();
        const bannedUntil = userData.ban?.bannedUntil ? new Date(userData.ban.bannedUntil) : null;

        if (bannedUntil && bannedUntil > now && !isBanned) {
          console.log("Tài khoản bị ban đến:", bannedUntil);
          setIsBanned(true);
          await clearAllData();
          Alert.alert(
            "Tài khoản bị khóa",
            `Tài khoản của bạn đã bị khóa${
              bannedUntil ? ` đến ${bannedUntil.toLocaleString("vi-VN")}` : " vĩnh viễn"
            }${userData.ban.reason ? ` vì: ${userData.ban.reason}` : ""}`,
            [
              {
                text: "OK",
                onPress: () => {
                  console.log("AuthContext: Alert OK pressed, navigation handled by logout");
                },
              },
            ]
          );
          return;
        }

        setUserToken(token);
        setUserInfo(userData);
        setIsEmailVerified(isVerified);
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
      await AsyncStorage.multiRemove(["userToken", "userInfo", "isEmailVerified"]);
      setUserToken(null);
      setUserInfo(null);
      setIsEmailVerified(false);
      setIsBanned(false);
      console.log("Logged out successfully");
      if (navigationRef.current) {
        console.log("Resetting to Auth/Login");
        navigationRef.current.resetRoot({
          index: 0,
          routes: [{ name: "Auth", params: { screen: "Login" } }],
        });
      } else {
        console.warn("navigationRef is not initialized in logout");
      }
    } catch (error) {
      console.log("Error removing auth data:", error);
    }
  };

  const updateEmailVerificationStatus = async (verified) => {
    try {
      await AsyncStorage.setItem("isEmailVerified", verified.toString());
      setIsEmailVerified(verified);

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
      console.log("AuthContext: Updating user info from:", userInfo);
      console.log("AuthContext: Updating user info to:", newUserInfo);

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
      console.log("Refreshing user data from server...");
      const response = await api.get("/users/me");
      if (response.data) {
        const freshUser = response.data;
        console.log("Fresh user data from server:", freshUser);

        const now = new Date();
        const bannedUntil = freshUser.ban?.bannedUntil ? new Date(freshUser.ban.bannedUntil) : null;

        if (bannedUntil && bannedUntil > now && !isBanned) {
          console.log("Tài khoản bị ban đến:", bannedUntil);
          setIsBanned(true);
          await logout();
          const banMessage = await AsyncStorage.getItem("banMessage") || 
            `Tài khoản của bạn đã bị khóa${
              bannedUntil ? ` đến ${bannedUntil.toLocaleString("vi-VN")}` : " vĩnh viễn"
            }${freshUser.ban.reason ? ` vì: ${freshUser.ban.reason}` : ""}`;
          Alert.alert("Tài khoản bị khóa", banMessage, [
            {
              text: "OK",
              onPress: () => {
                console.log("AuthContext: Alert OK pressed, navigation handled by logout");
              },
            },
          ]);
          await AsyncStorage.removeItem("banMessage");
          return;
        }

        await updateUserInfo(freshUser);
        return freshUser;
      }
    } catch (error) {
      console.log("Error refreshing user data:", error.message);
      if (error.response?.status === 401 && error.response?.data?.message === 'Token đã hết hạn') {
        await logout();
        Alert.alert('Phiên hết hạn', 'Vui lòng đăng nhập lại.');
        return;
      }
      if (error.response?.status === 403 && error.response?.data?.message?.includes("bị khóa")) {
        console.log("Handling 403 ban error in refreshUserData");
        if (!isBanned) {
          setIsBanned(true);
          await logout();
          const banMessage = await AsyncStorage.getItem("banMessage") || error.response.data.message;
          Alert.alert("Tài khoản bị khóa", banMessage, [
            {
              text: "OK",
              onPress: () => {
                console.log("AuthContext: Alert OK pressed, navigation handled by logout");
              },
            },
          ]);
          await AsyncStorage.removeItem("banMessage");
        }
      }
      throw error;
    }
  };

  const clearAllData = async () => {
    try {
      await AsyncStorage.multiRemove(["userToken", "userInfo", "isEmailVerified"]);
      setUserToken(null);
      setUserInfo(null);
      setIsEmailVerified(false);
      setIsBanned(false);
      console.log("All auth data cleared");
      if (navigationRef.current) {
        console.log("Resetting to Auth/Login from clearAllData");
        navigationRef.current.resetRoot({
          index: 0,
          routes: [{ name: "Auth", params: { screen: "Login" } }],
        });
      } else {
        console.warn("navigationRef is not initialized in clearAllData");
      }
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
        isBanned,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};