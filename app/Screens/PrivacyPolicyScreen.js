// VD: app/Screens/TermsScreen.js
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const PrivacyPolicyScreen = () => (
  <View style={styles.container}>
    <Text style={styles.text}>PrivacyPolicyScreen</Text>
  </View>
);

export default PrivacyPolicyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  text: {
    fontSize: 16,
    color: "#333",
  },
});
