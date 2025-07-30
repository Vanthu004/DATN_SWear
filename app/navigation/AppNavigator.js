import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
<<<<<<< HEAD
=======

import AllReviewsScreen from "../Screens/AllReviewsScreen"; // 👈 Đã thêm đúng
>>>>>>> 7b88f06dfea874c86f237acdb1778c32ce3b3a91
import LoadingScreen from "../Screens/LoadingScreen";
import RefundRequestScreen from "../Screens/RefundRequestScreen";
import WriteReviewScreen from "../Screens/WriteReviewScreen";

import { useAuth } from "../context/AuthContext";
import AuthNavigator from "./AuthNavigator";
import TabNavigator, { navigationRef } from "./TabNavigator";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isLoading, userToken, isBanned } = useAuth();

  console.log("AppNavigator: userToken:", userToken, "isBanned:", isBanned);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
<<<<<<< HEAD
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userToken && !isBanned ? (
          <Stack.Screen name="Main" component={TabNavigator} />
=======
    <NavigationContainer>
      <Stack.Navigator>
        {userToken ? (
          <>
            <Stack.Screen
              name="Main"
              component={TabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="WriteReview"
              component={WriteReviewScreen}
              options={{ headerShown: true, title: "Viết đánh giá" }}
            />
            <Stack.Screen
              name="RefundRequest"
              component={RefundRequestScreen}
              options={{ headerShown: true, title: "Yêu cầu hoàn tiền" }}
            />
            <Stack.Screen
              name="AllReviews"
              component={AllReviewsScreen}
              options={{ headerShown: true, title: "Tất cả đánh giá" }}
            />
          </>
>>>>>>> 7b88f06dfea874c86f237acdb1778c32ce3b3a91
        ) : (
          <Stack.Screen
            name="Auth"
            component={AuthNavigator}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}