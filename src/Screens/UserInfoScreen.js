import { useState } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import { Picker as RNPickerSelect } from '@react-native-picker/picker';

const UserInfoScreen = () => {
  const [gender, setGender] = useState(null);
  const [age, setAge] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cho chúng tôi biết về bạn</Text>

      <Text style={styles.label}>Bạn mua đồ cho ai?</Text>
      <View style={styles.genderContainer}>
        <TouchableOpacity
          style={[
            styles.genderButton,
            gender === 'Nam' && styles.selectedButton,
          ]}
          onPress={() => setGender('Nam')}
        >
          <Text
            style={[
              styles.genderText,
              gender === 'Nam' && styles.selectedText,
            ]}
          >
            Nam
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.genderButton,
            gender === 'Nữ' && styles.selectedButton,
          ]}
          onPress={() => setGender('Nữ')}
        >
          <Text
            style={[
              styles.genderText,
              gender === 'Nữ' && styles.selectedText,
            ]}
          >
            Nữ
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Bạn bao nhiêu tuổi?</Text>
      <View style={styles.pickerWrapper}>
        <RNPickerSelect
          selectedValue={age}
          onValueChange={(value) => setAge(value)}
          style={Platform.OS === 'android' ? styles.picker : {}}
        >
          <RNPickerSelect.Item label="Độ tuổi" value="" />
          <RNPickerSelect.Item label="Dưới 18" value="under18" />
          <RNPickerSelect.Item label="18 - 24" value="18-24" />
          <RNPickerSelect.Item label="25 - 34" value="25-34" />
          <RNPickerSelect.Item label="35 - 44" value="35-44" />
          <RNPickerSelect.Item label="45+" value="45plus" />
        </RNPickerSelect>
      </View>

      <TouchableOpacity style={styles.doneButton}>
        <Text style={styles.doneText}>Xong!</Text>
      </TouchableOpacity>
    </View>
  );
};

export default UserInfoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    marginBottom: 12,
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  selectedButton: {
    backgroundColor: '#007bff',
  },
  genderText: {
    fontSize: 16,
    color: '#000',
  },
  selectedText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  pickerWrapper: {
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 40,
  },
  picker: {
    height: 50,
    color: '#000',
    paddingHorizontal: 10,
  },
  doneButton: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
  },
  doneText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
