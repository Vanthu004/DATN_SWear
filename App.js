import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Provider } from "react-redux";
import { AuthProvider } from "./app/context/AuthContext";
import AppNavigator from "./app/navigation/AppNavigator";
import store from "./app/reudx/store";

export default function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <SafeAreaProvider>
          <AppNavigator />
          <Toast />
        </SafeAreaProvider>
      </AuthProvider>
    </Provider>
  );
}
