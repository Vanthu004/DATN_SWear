import { createNativeStackNavigator } from "@react-navigation/native-stack";

import CategorySearchScreen from "../search/CategorySearchScreen";
import ProductListScreen from "../search/ProductListScreen";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CategorySearch" component={CategorySearchScreen} />
      <Stack.Screen name="ProductList" component={ProductListScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
