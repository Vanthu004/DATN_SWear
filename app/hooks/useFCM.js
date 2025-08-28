import { useCallback, useEffect, useState } from 'react';
import { fcmService } from '../services/fcmService';

/**
 * Hook để sử dụng FCM service
 */
export const useFCM = (userId) => {
  const [token, setToken] = useState(null);
  const [tokenType, setTokenType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Khởi tạo FCM service
  const initialize = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await fcmService.initialize();
      
      // Lấy token hiện tại nếu có
      const currentToken = fcmService.getCurrentToken();
      if (currentToken.token) {
        setToken(currentToken.token);
        setTokenType(currentToken.tokenType);
      }
    } catch (err) {
      setError(err.message);
      console.error('[useFCM] Error initializing:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Đăng ký push notifications
  const register = useCallback(async () => {
    if (!userId) {
      setError('User ID is required');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const tokenObj = await fcmService.registerForPushNotifications(userId);
      
      if (tokenObj) {
        setToken(tokenObj.token);
        setTokenType(tokenObj.tokenType);
        return tokenObj;
      }
      
      return null;
    } catch (err) {
      setError(err.message);
      console.error('[useFCM] Error registering:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Cleanup
  const cleanup = useCallback(async () => {
    try {
      await fcmService.cleanup(userId);
      setToken(null);
      setTokenType(null);
    } catch (err) {
      setError(err.message);
      console.error('[useFCM] Error cleaning up:', err);
    }
  }, [userId]);

  // Kiểm tra xem có token không
  const hasToken = useCallback(() => {
    return fcmService.hasToken();
  }, []);

  // Lấy token hiện tại
  const getCurrentToken = useCallback(() => {
    return fcmService.getCurrentToken();
  }, []);

  // Khởi tạo khi component mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    token,
    tokenType,
    isLoading,
    error,
    register,
    cleanup,
    hasToken,
    getCurrentToken,
    initialize,
  };
};
