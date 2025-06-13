import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PaymentScreen = ({ navigation }) => {
  const paymentMethods = [
    {
      id: "1",
      type: "Thẻ tín dụng",
      number: "**** **** **** 1234",
      icon: "card-outline",
    },
    {
      id: "2",
      type: "Thẻ ATM",
      number: "**** **** **** 5678",
      icon: "card-outline",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <View style={styles.customHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <View style={styles.backIconWrap}>
            <Ionicons name="arrow-back" size={22} color="#222" />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán</Text>
      </View>

      <FlatList
        data={paymentMethods}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.paymentCard}>
            <View style={styles.paymentInfo}>
              <Ionicons name={item.icon} size={24} color="#007AFF" />
              <View style={styles.paymentDetails}>
                <Text style={styles.paymentType}>{item.type}</Text>
                <Text style={styles.cardNumber}>{item.number}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="pencil" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.listContainer}
      />

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
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backBtn: {
    padding: 5,
  },
  backIconWrap: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  listContainer: {
    padding: 15,
  },
  paymentCard: {
    flexDirection: "row",
    backgroundColor: "#f8f8f8",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  paymentInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  paymentDetails: {
    marginLeft: 15,
  },
  paymentType: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
  },
  cardNumber: {
    fontSize: 14,
    color: "#666",
  },
  editButton: {
    padding: 10,
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
    fontWeight: "600",
  },
});

export default PaymentScreen;
