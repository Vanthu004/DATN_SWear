import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PaymentScreen = ({ navigation }) => {
  const paymentMethods = [
    {
      id: "1",
      type: "BIDV Bank",
      number: "**** **** **** 5547",
      icon: require("../../assets/images/bank-icon.png"),
    },
    {
      id: "2",
      type: "MB Bank",
      number: "**** **** **** 5619",
      icon: require("../../assets/images/bank-icon.png"),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>

        {paymentMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={styles.paymentMethod}
            onPress={() => {}}
          >
            <Image source={method.icon} style={styles.bankIcon} />
            <View style={styles.methodInfo}>
              <Text style={styles.bankName}>{method.type}</Text>
              <Text style={styles.cardNumber}>{method.number}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("AddBankCard")}
      >
        <Text style={styles.addButtonText}>Thêm phương thức thanh toán</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  bankIcon: {
    width: 40,
    height: 40,
    marginRight: 15,
  },
  methodInfo: {
    flex: 1,
  },
  bankName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  cardNumber: {
    fontSize: 14,
    color: "#666",
  },
  addButton: {
    margin: 15,
    padding: 15,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PaymentScreen;
