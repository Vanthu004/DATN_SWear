import { useNavigation } from "@react-navigation/native";

export function useAppNavigation() {
  const navigation = useNavigation();

  return {
    // Auth
    goToLogin: () => navigation.navigate("Login"),
    goToRegister: () => navigation.navigate("Register"),
    goToForgotPassword: () => navigation.navigate("ForgotPassword"),
    goToResetPassword: (email) => navigation.navigate("ResetPassword", { email }),
    goToEmailVerification: (email, name) => navigation.navigate("EmailVerification", { email, name }),
    goToEmailSupport: (email) => navigation.navigate("EmailSupport", { email }),

    // Shop
    goToHome: () => navigation.navigate("HomeScreen"),
    goToProductDetail: (product) =>
      navigation.navigate("ProductDetail", { product }),
    goToCart: () => navigation.navigate("Cart"),
    goToCheckout: () => navigation.navigate("Checkout"),

    // Profile
    goToProfile: () => navigation.navigate("ProfileScreen"),
    goToEditProfile: () => navigation.navigate("EditProfile"),
    goToUserInfo: () => navigation.navigate("UserInfo"),
    goToAddressList: () => navigation.navigate("AddressList"),
    goToAddAddress: () => navigation.navigate("AddAddress"),
    goToPayment: () => navigation.navigate("Payment"),
    goToAddBankCard: () => navigation.navigate("AddBankCard"),

    // Orders
    goToOrderHistory: () => navigation.navigate("OrderHistory"),
    goToOrderStatus: (orderId) =>
      navigation.navigate("OrderStatus", { orderId }),

    // Utils
    goBack: () => navigation.goBack(),
    reset: (routeName) =>
      navigation.reset({
        index: 0,
        routes: [{ name: routeName }],
      }),
  };
}
