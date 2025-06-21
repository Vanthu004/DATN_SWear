import { useNavigation } from "@react-navigation/native";
import { ROUTES } from "../constants/routes";

export function useAppNavigation() {
  const navigation = useNavigation();

  return {
    // Auth
    goToLogin: () => navigation.navigate(ROUTES.LOGIN),
    goToRegister: () => navigation.navigate(ROUTES.REGISTER),
    goToForgotPassword: () => navigation.navigate(ROUTES.FORGOT_PASSWORD),
    goToResetPassword: (email) => navigation.navigate(ROUTES.RESET_PASSWORD, { email }),
    goToEmailVerification: (email, name) => navigation.navigate(ROUTES.EMAIL_VERIFICATION, { email, name }),
    goToEmailSupport: (email) => navigation.navigate(ROUTES.EMAIL_SUPPORT, { email }),

    // Shop
    goToHome: () => navigation.navigate(ROUTES.HOME),
    goToProductDetail: (product) =>
      navigation.navigate(ROUTES.PRODUCT_DETAIL, { product }),
    goToCart: () => navigation.navigate(ROUTES.CART),
    goToCheckout: () => navigation.navigate(ROUTES.CHECKOUT),

    // Profile
    goToProfile: () => navigation.navigate(ROUTES.PROFILE),
    goToEditProfile: () => navigation.navigate(ROUTES.EDIT_PROFILE),
    goToUserInfo: () => navigation.navigate(ROUTES.USER_INFO),
    goToAddressList: () => navigation.navigate(ROUTES.ADDRESS_LIST),
    goToAddAddress: () => navigation.navigate(ROUTES.ADD_ADDRESS),
    goToPayment: () => navigation.navigate(ROUTES.PAYMENT),
    goToAddBankCard: () => navigation.navigate(ROUTES.ADD_BANK_CARD),

    // Orders
    goToOrderHistory: () => navigation.navigate(ROUTES.ORDER_HISTORY),
    goToOrderStatus: (orderId) =>
      navigation.navigate(ROUTES.ORDER_STATUS, { orderId }),

    // Utils
    goBack: () => navigation.goBack(),
    reset: (routeName) =>
      navigation.reset({
        index: 0,
        routes: [{ name: routeName }],
      }),
  };
}
