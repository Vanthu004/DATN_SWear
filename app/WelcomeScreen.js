import { StyleSheet, Text, View } from 'react-native'

const Test = () => {
  return (
    <View>
      <Text>Tes</Text>
      <Text style={styles.header}>Tôi tên là thư</Text>
    </View>
  )
}

export default Test

const styles = StyleSheet.create({
    header: {
    }
})