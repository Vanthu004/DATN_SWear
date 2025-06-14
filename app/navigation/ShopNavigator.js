import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ROUTES } from "../constants/routes";
import { navigationConfig } from "./config";

import CartScreen from "../Screens/CartScreen";
import CheckoutScreen from "../Screens/CheckoutScreen";
import HomeScreen from "../Screens/HomeScreen";
import ProductDetailScreen from "../Screens/ProductDetailScreen";

const ShopStack = createNativeStackNavigator();

export default function ShopNavigator() {
  return (
    <ShopStack.Navigator screenOptions={navigationConfig.screenOptions}>
      <ShopStack.Screen
        name={ROUTES.HOME}
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <ShopStack.Screen
        name={ROUTES.PRODUCT_DETAIL}
        component={ProductDetailScreen}
        options={{ title: "Chi tiết sản phẩm" }}
      />
      <ShopStack.Screen
        name={ROUTES.CART}
        component={CartScreen}
        options={{ headerShown: false }}
      />
      <ShopStack.Screen
        name={ROUTES.CHECKOUT}
        component={CheckoutScreen}
        options={{ headerShown: false }}
      />
    </ShopStack.Navigator>
  );
}
