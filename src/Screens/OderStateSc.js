import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const STATUS_TABS = ['Đang xử lý', 'Đang vận chuyển', 'Đã nhận', 'Đã huỷ'];

const MOCK_ORDERS = [
  { id: '456765', products: 4 },
  { id: '454569', products: 2 },
  { id: '454809', products: 1 },
];

export default function Orders() {
  const [activeStatus, setActiveStatus] = useState('Đang xử lý');
  const router = useRouter();

  const renderTab = (tab) => {
    return (
      <TouchableOpacity
        key={tab}
        style={[styles.tab, activeStatus === tab && styles.activeTab]}
        onPress={() => setActiveStatus(tab)}
      >
        <Text style={[styles.tabText, activeStatus === tab && styles.activeTabText]}>
          {tab}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/orders/${item.id}`)}>
      <View style={styles.cardLeft}>
        <Image
          source={require('../../assets/images/box-icon.png')} // thay bằng icon hộp bạn có
          style={styles.icon}
        />
        <View>
          <Text style={styles.orderText}>Đơn hàng #{item.id}</Text>
          <Text style={styles.subText}>{item.products} sản phẩm</Text>
        </View>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Đơn hàng</Text>

      <View style={styles.tabsContainer}>
        {STATUS_TABS.map(renderTab)}
      </View>

      <FlatList
        data={MOCK_ORDERS}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginBottom: 8,
  },
  activeTab: {
    backgroundColor: '#007bff',
  },
  tabText: {
    fontSize: 13,
    color: '#333',
  },
  activeTabText: {
    color: 'white',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6f6f6',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 28,
    height: 28,
    marginRight: 12,
  },
  orderText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  subText: {
    fontSize: 12,
    color: '#666',
  },
  arrow: {
    fontSize: 20,
    color: '#999',
    marginRight: 4,
  },
});
