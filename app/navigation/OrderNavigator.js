import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ROUTES } from "../constants/routes";
import { navigationConfig } from "./config";

import OrderHistoryScreen from "../Screens/OrderHistoryScreen";
import OrderStatusScreen from "../Screens/OrderStatusScreen";
import OrdersEmptyScreen from "../Screens/OrdersEmptyScreen";

const OrderStack = createNativeStackNavigator();

export default function OrderNavigator() {
  return (
    <OrderStack.Navigator screenOptions={navigationConfig.screenOptions}>
      <OrderStack.Screen
        name={ROUTES.ORDER_HISTORY}
        component={OrderHistoryScreen}
        options={{ title: "Lịch sử đơn hàng" }}
      />
      <OrderStack.Screen
        name={ROUTES.ORDER_STATUS}
        component={OrderStatusScreen}
        options={{ headerShown: false }}
      />
      <OrderStack.Screen
        name={ROUTES.ORDERS_EMPTY}
        component={OrdersEmptyScreen}
        options={{ headerShown: false }}
      />
    </OrderStack.Navigator>
  );
}
