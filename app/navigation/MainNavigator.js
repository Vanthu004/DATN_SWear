import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ROUTES } from "../constants/routes";
import { navigationConfig } from "./config";

import NotificationsScreen from "../Screens/NotificationsScreen";
import OrderDetailScreen from "../Screens/OrderDetailScreen";
import OrderSuccessScreen from "../Screens/OrderSuccessScreen";
import OrderNavigator from "./OrderNavigator";
import ProfileNavigator from "./ProfileNavigator";
import ShopNavigator from "./ShopNavigator";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        ...navigationConfig.screenOptions,
        ...navigationConfig.tabBarOptions,
      }}
    >
      <Tab.Screen
        name={ROUTES.HOME_TAB}
        component={ShopNavigator}
        options={{
          headerShown: false,
          tabBarLabel: "Trang chủ",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={ROUTES.NOTIFICATIONS_TAB}
        component={NotificationsScreen}
        options={{
          title: "Thông báo",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={ROUTES.ORDERS_TAB}
        component={OrderNavigator}
        options={{
          headerShown: false,
          tabBarLabel: "Đơn hàng",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={ROUTES.PROFILE_TAB}
        component={ProfileNavigator}
        options={{
          headerShown: false,
          tabBarLabel: "Tài khoản",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={navigationConfig.screenOptions}>
      <Stack.Screen
        name="TabNavigator"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={ROUTES.ORDER_SUCCESS}
        component={OrderSuccessScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={ROUTES.ORDER_DETAIL}
        component={OrderDetailScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
