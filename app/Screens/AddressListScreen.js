import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { deleteAddress, getAddressList } from "../utils/api"; // Đường dẫn tùy dự án của bạn

const AddressListScreen = ({ navigation }) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleDelete = (id) => {
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc chắn muốn xóa địa chỉ này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAddress(id);
              fetchAddresses(); // Cập nhật danh sách
            } catch (error) {
              console.error("Lỗi khi xóa địa chỉ:", error);
              Alert.alert("Lỗi", "Không thể xóa địa chỉ.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };


  const fetchAddresses = async () => {
    try {
      const data = await getAddressList();
      setAddresses(data);
    } catch (error) {
      console.error("Lỗi khi lấy địa chỉ:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", fetchAddresses);
    return unsubscribe;
  }, [navigation]);

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
        <Text style={styles.headerTitle}>Địa chỉ</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (

            // Hiển thị địa chỉ

            <View style={styles.addressCard}>
              <View style={styles.addressInfo}>
                <Text style={styles.addressName}>{item.name}</Text>
                <Text style={styles.addressText}>
                  {item.street}, {item.ward}, {item.district}, {item.province}
                </Text>
                <Text style={styles.phoneText}>{item.phone}</Text>
                {item.is_default && (
                  <Text style={{ color: "green", marginTop: 4 }}>(Mặc định)</Text>
                )}
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => navigation.navigate("AddAddress", { address: item })}
                >
                  <Ionicons name="pencil" size={20} color="#007AFF" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(item._id)}
                >
                  <Ionicons name="trash" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>


          )}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("AddAddress")}
      >
        <Text style={styles.addButtonText}>Thêm địa chỉ mới</Text>
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
  addressCard: {
    flexDirection: "row",
    backgroundColor: "#f8f8f8",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  addressInfo: {
    flex: 1,
  },
  addressName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
  },
  addressText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 3,
  },
  phoneText: {
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
  actionButtons: {
  flexDirection: "row",
  alignItems: "center",
},
deleteButton: {
  padding: 10,
},

});

export default AddressListScreen;
