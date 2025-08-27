import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { checkNotificationPermission } from '../services/notificationService';

const NotificationSettingsScreen = ({ navigation }) => {
  const { userInfo } = useAuth();
  const [hasPermission, setHasPermission] = useState(false);
  const [settings, setSettings] = useState({
    orderSuccess: true,
    orderConfirmed: true,
    orderShipping: true,
    orderDelivered: true,
    orderCancelled: true,
    orderIssue: true,
    promotions: true,
    news: false,
  });

  useEffect(() => {
    checkPermissions();
    loadSettings();
  }, []);

  const checkPermissions = async () => {
    const permission = await checkNotificationPermission();
    setHasPermission(permission);
  };

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('notificationSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  };

  const toggleSetting = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    saveSettings(newSettings);
  };

  const requestPermission = async () => {
    Alert.alert(
      'Quyền thông báo',
      'Để nhận thông báo về đơn hàng, bạn cần cấp quyền thông báo cho ứng dụng.',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Cài đặt',
          onPress: () => {
            // Navigate to app settings
            // You can use Linking.openSettings() here
          },
        },
      ]
    );
  };

  const renderSettingItem = (title, description, key, icon) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={24} color="#2196F3" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
      </View>
      <Switch
        value={settings[key]}
        onValueChange={() => toggleSetting(key)}
        trackColor={{ false: '#767577', true: '#81c784' }}
        thumbColor={settings[key] ? '#4caf50' : '#f4f3f4'}
        disabled={!hasPermission}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cài đặt thông báo</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {!hasPermission && (
          <View style={styles.permissionWarning}>
            <Ionicons name="warning" size={24} color="#FF9800" />
            <Text style={styles.permissionText}>
              Bạn cần cấp quyền thông báo để nhận thông báo về đơn hàng
            </Text>
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={requestPermission}
            >
              <Text style={styles.permissionButtonText}>Cấp quyền</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông báo đơn hàng</Text>
          
          {renderSettingItem(
            'Đặt hàng thành công',
            'Thông báo khi đơn hàng được đặt thành công',
            'orderSuccess',
            'checkmark-circle'
          )}
          
          {renderSettingItem(
            'Đơn hàng được xác nhận',
            'Thông báo khi đơn hàng được xác nhận',
            'orderConfirmed',
            'checkmark-done-circle'
          )}
          
          {renderSettingItem(
            'Đơn hàng đang giao',
            'Thông báo khi shipper nhận đơn hàng',
            'orderShipping',
            'car'
          )}
          
          {renderSettingItem(
            'Giao hàng thành công',
            'Thông báo khi đơn hàng được giao thành công',
            'orderDelivered',
            'bag-check'
          )}
          
          {renderSettingItem(
            'Đơn hàng bị hủy',
            'Thông báo khi đơn hàng bị hủy',
            'orderCancelled',
            'close-circle'
          )}
          
          {renderSettingItem(
            'Vấn đề với đơn hàng',
            'Thông báo khi đơn hàng gặp vấn đề',
            'orderIssue',
            'warning'
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông báo khác</Text>
          
          {renderSettingItem(
            'Khuyến mãi',
            'Thông báo về các chương trình khuyến mãi',
            'promotions',
            'pricetag'
          )}
          
          {renderSettingItem(
            'Tin tức',
            'Thông báo về tin tức và cập nhật',
            'news',
            'newspaper'
          )}
        </View>

        <View style={styles.infoSection}>
          <Ionicons name="information-circle" size={20} color="#666" />
          <Text style={styles.infoText}>
            Bạn có thể tùy chỉnh các loại thông báo mà bạn muốn nhận. 
            Các thông báo quan trọng về đơn hàng sẽ luôn được gửi.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  permissionWarning: {
    backgroundColor: '#fff3cd',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    alignItems: 'center',
  },
  permissionText: {
    color: '#856404',
    textAlign: 'center',
    marginVertical: 8,
    fontSize: 14,
  },
  permissionButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginVertical: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e3f2fd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  infoSection: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    lineHeight: 20,
  },
});

export default NotificationSettingsScreen;
