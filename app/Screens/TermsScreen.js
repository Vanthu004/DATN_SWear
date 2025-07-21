// VD: app/Screens/TermsScreen.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";

const TermsScreen = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Điều khoản sử dụng...</Text>
  </View>
);

export default TermsScreen;

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
