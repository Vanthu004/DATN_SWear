// VD: app/Screens/TermsScreen.js
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const DeactivateScreen = () => (
  <View style={styles.container}>
    <Text style={styles.text}>DeactivateScreen</Text>
  </View>
);

export default DeactivateScreen;

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
