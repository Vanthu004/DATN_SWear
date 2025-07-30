import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

// Import các màn hình chính
import AddAddressScreen from "../Screens/AddAddressScreen";
import AddBankCardScreen from "../Screens/AddBankCardScreen";
import AddressListScreen from "../Screens/AddressListScreen";
import CartScreen from "../Screens/CartScreen";
import CategoryScreen from "../Screens/CategoryScreen";
import ChangePasswordScreen from "../Screens/ChangePasswordScreen";
import CheckoutScreen from "../Screens/CheckoutScreen";
import EditProfileScreen from "../Screens/EditProfileScreen";
import HomeScreen from "../Screens/HomeScreen";
import NotificationsScreen from "../Screens/NotificationsScreen";
import OrderDetailScreen from "../Screens/OrderDetailScreen";
import OrderHistoryScreen from "../Screens/OrderHistoryScreen";
import OrdersEmptyScreen from "../Screens/OrdersEmptyScreen";
import OrderStatusScreen from "../Screens/OrderStatusScreen";
import OrderSuccessScreen from "../Screens/OrderSuccessScreen";
import PaymentScreen from "../Screens/PaymentScreen";
import ProductDetailScreen from "../Screens/ProductDetailScreen";
import ProductScreen from "../Screens/ProductScreen";
import ProfileScreen from "../Screens/ProfileScreen";
import SearchSc from '../Screens/SearchSc';
import UserInfoScreen from "../Screens/UserInfoScreen";
import WishlistScreen from "../Screens/WishlistScreen.js";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack Navigator cho Home
function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Cart"
        component={CartScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SearchSc"
        component={SearchSc}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CategoryScreen"
        component={CategoryScreen}
        options={{ title: "Danh mục" }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddressList"
        component={AddressListScreen}
        options={{ title: "Địa chỉ" }}
      />
      <Stack.Screen
        name="AddAddress"
        component={AddAddressScreen}
        options={{ title: "Thêm địa chỉ" }}
      />
      <Stack.Screen
        name="Payment"
        component={PaymentScreen}
        options={{ title: "Phương thức thanh toán" }}
      />
      <Stack.Screen
        name="AddBankCard"
        component={AddBankCardScreen}
        options={{ title: "Thêm thẻ" }}
      />
      <Stack.Screen
        name="OrderSuccess"
        component={OrderSuccessScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

// Stack Navigator cho Products
function ProductStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProductScreen"
        component={ProductScreen}
        options={{ title: "Sản phẩm" }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: "Chi tiết sản phẩm" }}
      />
      <Stack.Screen
        name="CategoryScreen"
        component={CategoryScreen}
        options={{ title: "Danh mục" }}
      />
    </Stack.Navigator>
  );
}

// Stack Navigator cho Orders
function OrderStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="OrderHistory"
        component={OrderHistoryScreen}
        options={{  headerShown: false  }}
      />
      <Stack.Screen
        name="OrderStatus"
        component={OrderStatusScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OrdersEmpty"
        component={OrdersEmptyScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

// Stack Navigator cho Profile
function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
        <Stack.Screen
  name="ProductDetail"
  component={ProductDetailScreen}
  options={{ headerShown: false }}
/>

      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UserInfo"
        component={UserInfoScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddressList"
        component={AddressListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddAddress"
        component={AddAddressScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Payment"
        component={PaymentScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddBankCard"
        component={AddBankCardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OrderHistory"
        component={OrderHistoryScreen}
        options={{  headerShown: false  }}
      />
      <Stack.Screen
        name="OrderStatus"
        component={OrderStatusScreen}
        options={{ title: "Trạng thái đơn hàng" }}
      />
      <Stack.Screen
        name="OrdersEmpty"
        component={OrdersEmptyScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CartScreen"
        component={CartScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

// Stack Navigator cho Notifications
function NotificationsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="NotificationsScreen"
        component={NotificationsScreen}
        options={{ headerShown: false }}
      />
      {/* Nếu có màn hình chi tiết thông báo, thêm ở đây */}
    </Stack.Navigator>
  );
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          let iconColor = focused ? "#007AFF" : "#8e8e93";
          let iconSize = 24;

          switch (route.name) {
            case "Home":
              iconName = "home-outline";
              break;
            case "Wishlist":
              iconName = "heart-outline";
              break;
            case "Notifications":
              iconName = "notifications-outline";
              break;
            case "Profile":
              iconName = "person-outline";
              break;
          }

          return <Ionicons name={iconName} size={iconSize} color={iconColor} />;
        },
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#8e8e93",
        tabBarShowLabel: true,
        headerShown: false,
        tabBarStyle: {
          paddingTop: 20,
          height: 70,
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          borderTopWidth: 0.5,
          borderTopColor: "#eee",
          backgroundColor: "#fff",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginTop: 4,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{ title: "Trang chủ" }}
      />

      <Tab.Screen
        name="Notifications"
        component={NotificationsStack}
        options={{ title: "Thông báo" }}
      />
            <Tab.Screen
        name="Wishlist"
        component={WishlistScreen}
        options={{ title: "Yêu thích" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{ title: "Cá nhân" }}
      />
    </Tab.Navigator>
  );
}