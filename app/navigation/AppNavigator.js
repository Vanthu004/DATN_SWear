import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import LoadingScreen from "../Screens/LoadingScreen";
import RefundRequestScreen from "../Screens/RefundRequestScreen"; // 👈 thêm dòng này
import WriteReviewScreen from "../Screens/WriteReviewScreen";
import { useAuth } from "../context/AuthContext";
import AuthNavigator from "./AuthNavigator";
import TabNavigator from "./TabNavigator";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isLoading, userToken } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userToken ? (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
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
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
