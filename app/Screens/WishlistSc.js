import { Ionicons } from '@expo/vector-icons';
import {
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const products = [
  {
    id: '1',
    name: 'Áo thun Nam U.S Cotton',
    price: '362.000 VND',
    image: 'https://example.com/image1.jpg',
  },
  {
    id: '2',
    name: 'Áo thể thao Nam',
    price: '509.000 VND',
    image: 'https://example.com/image2.jpg',
  },
  {
    id: '3',
    name: 'Áo thun thể thao Nam',
    price: '367.000 VND',
    image: 'https://example.com/image3.jpg',
  },
  {
    id: '4',
    name: 'Áo thun Nam Delta',
    price: '469.000 VND',
    image: 'https://example.com/image4.jpg',
  },
];

export default function FavoriteScreen() {
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <TouchableOpacity style={styles.heartIcon}>
        <Ionicons name="heart" size={20} color="#f87171" />
      </TouchableOpacity>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.price}>{item.price}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn}>
        <Ionicons name="chevron-back" size={24} />
      </TouchableOpacity>
      <Text style={styles.title}>Sản phẩm Yêu thích (12)</Text>
      <FlatList
        data={products}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
      />
    </View>
  );
}

const CARD_WIDTH = (Dimensions.get('window').width - 48) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 40,
    backgroundColor: '#fff',
  },
  backBtn: {
    position: 'absolute',
    top: 40,
    left: 16,
    zIndex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 16,
  },
  list: {
    paddingBottom: 16,
  },
  card: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginBottom: 16,
    width: CARD_WIDTH,
    paddingBottom: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  heartIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 999,
    padding: 4,
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    paddingHorizontal: 8,
  },
  price: {
    fontSize: 13,
    color: '#6b7280',
    paddingHorizontal: 8,
    marginTop: 4,
  },
});
