import { FlatList, Image, StyleSheet, Text, View } from 'react-native';

const notifications = [
  {
    id: '1',
    icon: require('../..//assets/images/bell-red.png'), // hình chuông có chấm đỏ
    text: 'Này Quân! Đơn hàng của bạn đã được đặt thành công! Nhấn vào để xem chi t...',
  },
  {
    id: '2',
    icon: require('../../assets/images/bell-gray.png'), // chuông bình thường
    text: 'Chào Quân! Đơn hàng #56868 đã được huỷ thành công.',
  },
  {
    id: '3',
    icon: require('../../assets/images/bell-gray.png'),
    text: 'Này Quân! Đơn hàng #85659 của bạn sẽ được giao vào ngày mai. Nhớ hãy ki...',
  },
];

const NotificationItem = ({ item }) => (
  <View style={styles.card}>
    <Image source={item.icon} style={styles.icon} resizeMode="contain" />
    <Text style={styles.text}>{item.text}</Text>
  </View>
);

export default function Notifications() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Thông báo</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NotificationItem item={item} />}
        contentContainerStyle={{ gap: 12 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#F6F6F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  text: {
    flex: 1,
    color: '#333',
    fontSize: 14,
  },
});
