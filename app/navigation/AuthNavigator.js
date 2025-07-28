import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

// Import các màn hình auth
import EmailSupportScreen from "../Screens/EmailSupportScreen";
import EmailVerificationScreen from "../Screens/EmailVerificationScreen";
import EmailVerificationSuccessScreen from "../Screens/EmailVerificationSuccessScreen";
import ForgotPasswordScreen from "../Screens/ForgotPasswordScreen";
import LoginScreen from "../Screens/LoginScreen";
import PrivacyPolicyScreen from "../Screens/PrivacyPolicyScreen";
import RegisterScreen from "../Screens/RegisterScreen";
import resetPassword from "../Screens/ResetPasswordScreen";
import WelcomeScreen from "../Screens/WelcomeScreen";

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: "#ffffff",
        },
        headerTintColor: "#000000",
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ title: "Đăng ký" }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ title: "Quên mật khẩu" }}
      />
       <Stack.Screen
        name="ResetPassword"
        component={resetPassword}
        options={{ title: "Đặt lại mật khẩu" }}
      />
      <Stack.Screen
        name="EmailVerification"
        component={EmailVerificationScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EmailVerificationSuccess"
        component={EmailVerificationSuccessScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EmailSupport"
        component={EmailSupportScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen name="PrivacyPolicyScreen" component={PrivacyPolicyScreen} options={{ headerShown: false }}/>

    </Stack.Navigator>
  );
}
