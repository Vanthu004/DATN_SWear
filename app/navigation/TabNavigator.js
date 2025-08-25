import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { createRef } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

// Import các màn hình chính
import AddAddressScreen from "../Screens/AddAddressScreen";
import AddBankCardScreen from "../Screens/AddBankCardScreen";
import AddressListScreen from "../Screens/AddressListScreen";
import CartScreen from "../Screens/CartScreen";
import CategoryScreen from "../Screens/CategoryScreen";
import ChangePasswordScreen from "../Screens/ChangePasswordScreen";
import ChatListScreen from "../Screens/ChatListScreen";
import ChatScreen from "../Screens/ChatScreen";
import CheckoutScreen from "../Screens/CheckoutScreen";
import EditProfileScreen from "../Screens/EditProfileScreen";
import HelpScreen from "../Screens/HelpScreen";
import HomeScreen from "../Screens/HomeScreen";
import NotificationsScreen from "../Screens/NotificationsScreen";
import OrderDetailScreen from "../Screens/OrderDetailScreen";
import OrderHistoryScreen from "../Screens/OrderHistoryScreen";
import OrdersEmptyScreen from "../Screens/OrdersEmptyScreen";
import OrderStatusScreen from "../Screens/OrderStatusScreen";
import OrderSuccessScreen from "../Screens/OrderSuccessScreen";
import PaymentScreen from "../Screens/PaymentScreen";
import PolicyScreen from "../Screens/PrivacyPolicyScreen";
import ProductDetailScreen from "../Screens/ProductDetailScreen";
import ProductScreen from "../Screens/ProductScreen";
import ProfileScreen from "../Screens/ProfileScreen";
import SearchSc from '../Screens/SearchSc';
import SupportScreen from "../Screens/SupportScreen";
import TermsScreen from "../Screens/TermsScreen";
import UserInfoScreen from "../Screens/UserInfoScreen";
import WishlistScreen from "../Screens/WishlistScreen.js";
import ZaloPayQRScreen from '../Screens/ZaloPayQRScreen';

// Tạo navigationRef để truy cập navigation từ bất kỳ đâu
export const navigationRef = createRef();

// Hàm resetNavigation để chuyển hướng về màn hình bất kỳ
export const resetNavigation = (screenName) => {
  //console.log("resetNavigation called with screen:", screenName);
  //console.log("navigationRef.current:", navigationRef.current);
  if (navigationRef.current) {
    navigationRef.current.reset({
      index: 0,
      routes: [{ name: "Auth", params: { screen: screenName } }],
    });
  } else {
    console.warn("navigationRef is not initialized");
  }
};

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
      <Stack.Screen
        name="ZaloPayQRScreen"
        component={ZaloPayQRScreen}
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
        options={{ headerShown: false }}
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
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OrderHistory"
        component={OrderHistoryScreen}
        options={{ headerShown: false }}
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
      <Stack.Screen
        name="SupportScreen"
        component={SupportScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Help"
        component={HelpScreen}
        options={{ title: "Trợ giúp" }}
      />
      <Stack.Screen
        name="ChatScreen"
        component={ChatScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ChatListScreen"
        component={ChatListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TermsScreen"
        component={TermsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PolicyScreen"
        component={PolicyScreen}
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
    </Stack.Navigator>
  );
}

const CustomTabBar = ({ state, descriptors, navigation }) => {
  // Get the current route name from the nested stack navigator
  const currentRoute = state.routes[state.index];
  const nestedState = currentRoute.state;
  const currentScreen = nestedState?.routes?.[nestedState.index]?.name;

  // Hide the tab bar if the current screen is ChatScreen
  if (currentScreen === "ChatScreen" || currentScreen === "SupportScreen" || currentScreen === "AddAddress" || currentScreen ==="AddressList") {
    return null;
  }

 
  return (
    <View style={customStyles.tabBar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        let iconName;
        if (route.name === "Home") iconName = "home-outline";
        else if (route.name === "Notifications") iconName = "notifications-outline";
        else if (route.name === "Wishlist") iconName = "heart-outline";
        else if (route.name === "Profile") iconName = "person-outline";
        const onPress = () => {
          if (!isFocused) navigation.navigate(route.name);
        };
        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            style={customStyles.tabButton}
            activeOpacity={0.8}
          >
            <Ionicons
              name={iconName}
              size={28}
              color={isFocused ? "#2979FF" : "#B0B0B0"}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
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

const customStyles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 100,
    margin: 10,
    height: 64,
    alignItems: "center",
    justifyContent: "space-around",
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});