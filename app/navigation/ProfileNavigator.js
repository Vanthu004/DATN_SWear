import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ROUTES } from "../constants/routes";

import AddAddressScreen from "../Screens/AddAddressScreen";
import AddBankCardScreen from "../Screens/AddBankCardScreen";
import AddressListScreen from "../Screens/AddressListScreen";
import ChangePasswordScreen from "../Screens/ChangePasswordScreen";
import EditProfileScreen from "../Screens/EditProfileScreen";
import PaymentScreen from "../Screens/PaymentScreen";
import ProfileScreen from "../Screens/ProfileScreen";
import UserInfoScreen from "../Screens/UserInfoScreen";

const ProfileStack = createNativeStackNavigator();

export default function ProfileNavigator() {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <ProfileStack.Screen name={ROUTES.PROFILE} component={ProfileScreen} />
      <ProfileStack.Screen
        name={ROUTES.EDIT_PROFILE}
        component={EditProfileScreen}
      />
      <ProfileStack.Screen name={ROUTES.USER_INFO} component={UserInfoScreen} />
      <ProfileStack.Screen
        name={ROUTES.ADDRESS_LIST}
        component={AddressListScreen}
      />
      <ProfileStack.Screen
        name={ROUTES.ADD_ADDRESS}
        component={AddAddressScreen}
      />
      <ProfileStack.Screen name={ROUTES.PAYMENT} component={PaymentScreen} />
      <ProfileStack.Screen
        name={ROUTES.ADD_BANK_CARD}
        component={AddBankCardScreen}
      />
      <ProfileStack.Screen
        name={ROUTES.CHANGE_PASSWORD}
        component={ChangePasswordScreen}
      />
    </ProfileStack.Navigator>
  );
}
