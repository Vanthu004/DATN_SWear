import { api } from './api';
// Payment Methods API
export const getPaymentMethods = async () => {
  try {
    const response = await api.get('/payment-methods');
    return response.data;
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return [];
  }
};

export const createPaymentMethod = async (paymentData) => {
  try {
    const response = await api.post('/payment-methods', paymentData);
    const result = response.data;
    if (result && result._id) {
      return { success: true, paymentMethod: result };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error('Error creating payment method:', error);
    return { success: false };
  }
};

export const deletePaymentMethod = async (methodId) => {
  try {
    const response = await api.delete(`/payment-methods/${methodId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting payment method:', error);
    return { success: false };
  }
};

export const selectPaymentMethod = async (methodId) => {
  return { success: true };
};

// Payment Processing API
export const processPayment = async (orderData, paymentMethodId) => {
  return { success: true };
};

export const checkPaymentStatus = async (paymentId) => {
  return { success: true };
};

// Order API
export const createOrder = async (orderData) => {
  return { success: true };
};

export const getOrderStatus = async (orderId) => {
  return { success: true };
};

// Utility functions
export const validatePaymentMethod = (paymentData) => {
  const errors = [];
  if (!paymentData.fullName || paymentData.fullName.trim().length < 2) {
    errors.push('Họ tên phải có ít nhất 2 ký tự');
  }
  if (!paymentData.identityNumber || paymentData.identityNumber.length < 8) {
    errors.push('Số CCCD/Căn cước phải có ít nhất 8 ký tự');
  }
  if (!paymentData.bankName || paymentData.bankName.trim().length < 2) {
    errors.push('Tên ngân hàng phải có ít nhất 2 ký tự');
  }
  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

export const formatCardNumber = (cardNumber) => {
  if (!cardNumber) return '';
  const cleaned = cardNumber.replace(/\s/g, '');
  const match = cleaned.match(/(\d{1,4})/g);
  return match ? match.join(' ') : cleaned;
};

export const maskCardNumber = (cardNumber) => {
  if (!cardNumber) return '';
  const cleaned = cardNumber.replace(/\s/g, '');
  if (cleaned.length <= 4) return cleaned;
  return '**** **** **** ' + cleaned.slice(-4);
};

export const updatePaymentMethod = async (id, paymentData) => {
  try {
    const response = await api.put(`/payment-methods/${id}`, paymentData);
    const result = response.data;
    if (result && result._id) {
      return { success: true, paymentMethod: result };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error('Error updating payment method:', error);
    return { success: false };
  }
};