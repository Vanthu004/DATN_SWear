import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const DATA = [
  { id: "1", name: "Áo", image: require("../../assets/images/shirt.png") },
  { id: "2", name: "Phụ kiện", image: require("../../assets/images/accessory.png") },
  { id: "3", name: "Quần", image: require("../../assets/images/pants.png") },
  { id: "4", name: "Giày", image: require("../../assets/images/shoes.png") },
  { id: "5", name: "Túi", image: require("../../assets/images/bag.png") },
];

const CategorySearchScreen = () => {
  const [searchText, setSearchText] = useState("");
  const navigation = useNavigation();

  const defaultFilters = {
    onSale: true,
    price: "all",
    gender: "all",
    sort: "suggested",
  };

  const filteredData = DATA.filter((item) =>
    item.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() =>
        navigation.navigate("ProductList", {
          category: item.name,
          filters: defaultFilters,
        })
      }
    >
      <Image source={item.image} style={styles.icon} />
      <Text style={styles.itemText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Tìm kiếm"
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchInput}
        />
      </View>

      <Text style={styles.title}>Tìm kiếm theo Danh mục</Text>

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  item: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  icon: {
    width: 40,
    height: 40,
    marginRight: 15,
    resizeMode: "contain",
  },
  itemText: {
    fontSize: 16,
  },
});

export default CategorySearchScreen;
