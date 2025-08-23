//app/navigation/ProfileNavigator.js
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ROUTES } from "../constants/routes";

import AddAddressScreen from "../Screens/AddAddressScreen";
import AddBankCardScreen from "../Screens/AddBankCardScreen";
import AddressListScreen from "../Screens/AddressListScreen";
import ChangePasswordScreen from "../Screens/ChangePasswordScreen";
import EditProfileScreen from "../Screens/EditProfileScreen";
import HelpScreen from "../Screens/HelpScreen";
import ChatListScreen from "../Screens/ChatListScreen";
import ChatScreen from "../Screens/ChatScreen";
import PaymentScreen from "../Screens/PaymentScreen";
import PrivacyPolicyScreen from "../Screens/PrivacyPolicyScreen";
import ProfileScreen from "../Screens/ProfileScreen";
import TermsScreen from "../Screens/TermsScreen";
import UserInfoScreen from "../Screens/UserInfoScreen";
import SupportScreen from "../Screens/SupportScreen";

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
      {/* <ProfileStack.Screen name={ROUTES.PAYMENT} component={PaymentScreen} /> */}
      {/* <ProfileStack.Screen
        name={ROUTES.ADD_BANK_CARD}
        component={AddBankCardScreen}
      /> */}
      <ProfileStack.Screen name={ROUTES.SUPPORT} component={SupportScreen} />
      <ProfileStack.Screen name={ROUTES.CHATLIST} component={ChatListScreen} />
      <ProfileStack.Screen name={ROUTES.CHAT} component={ChatScreen} />
      <ProfileStack.Screen
        name={ROUTES.CHANGE_PASSWORD}
        component={ChangePasswordScreen}
      />
      <ProfileStack.Screen name={ROUTES.HELP} component={HelpScreen} />

      <ProfileStack.Screen name={ROUTES.TERMS} component={TermsScreen} options={{ headerShown: false }} />
      <ProfileStack.Screen name={ROUTES.PRIVACY_POLICY} component={PrivacyPolicyScreen} options={{ headerShown: false }} />


    </ProfileStack.Navigator>
  );
}
