import { Image, StyleSheet, View } from 'react-native'

const Test = () => {
  return (
    <View style={styles.header}>
      <Image source={require('../../assets/images/LogoSwear.png')}
      style={styles.image}
      />
    </View>
  )
}

export default Test

const styles = StyleSheet.create({
    header: {
      flex:1,
      justifyContent:'center',
      alignItems:'center'
    },
      image: {
    width: 200,
    height: 200,
    resizeMode: 'contain', 
  },
})