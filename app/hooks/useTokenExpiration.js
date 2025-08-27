import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

export const useTokenExpiration = () => {
  const { logout } = useAuth();

  useEffect(() => {
    const checkTokenExpiration = async () => {
      try {
        const shouldLogout = await AsyncStorage.getItem("shouldLogout");
        const tokenExpiredMessage = await AsyncStorage.getItem("tokenExpiredMessage");
        
        if (shouldLogout === "true") {
         // console.log("useTokenExpiration: Token expired, showing alert and logging out");
          
          // Xóa các flag
          await AsyncStorage.multiRemove(["shouldLogout", "tokenExpiredMessage"]);
          
          // Hiển thị thông báo token hết hạn
          Alert.alert(
            "Phiên đăng nhập hết hạn",
            tokenExpiredMessage || "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
            [
              {
                text: "OK",
                onPress: async () => {
              //    console.log("useTokenExpiration: Token expired alert OK pressed, logging out");
                  await logout();
                },
              },
            ]
          );
        }
      } catch (error) {
      //  console.log("Error checking token expiration:", error);
      }
    };

    // Kiểm tra ngay lập tức
    checkTokenExpiration();
    
    // Kiểm tra định kỳ mỗi 10 giây
    const interval = setInterval(checkTokenExpiration, 10000);
    
    return () => clearInterval(interval);
  }, [logout]);

  return null;
};
