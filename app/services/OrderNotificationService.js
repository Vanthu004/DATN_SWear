import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

/**
 * Service xử lý thông báo đơn hàng
 */
export class OrderNotificationService {
  static instance = null;

  constructor() {
    this.isInitialized = false;
  }

  static getInstance() {
    if (!OrderNotificationService.instance) {
      OrderNotificationService.instance = new OrderNotificationService();
    }
    return OrderNotificationService.instance;
  }

  /**
   * Khởi tạo service
   */
  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Cấu hình notification handler cho đơn hàng
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });

      this.isInitialized = true;
      console.log('[OrderNotification] Service initialized successfully');
    } catch (error) {
      console.error('[OrderNotification] Error initializing service:', error);
    }
  }

  /**
   * Lấy cấu hình thông báo theo trạng thái đơn hàng
   */
  getOrderStatusConfig(orderStatus, previousStatus) {
    const statusMap = {
      'pending': {
        title: '⏳ Đơn hàng đang chờ xử lý',
        body: 'Đơn hàng của bạn đã được tiếp nhận và đang chờ xử lý',
        priority: 'normal',
        actionRequired: false,
        icon: '⏳'
      },
      'confirmed': {
        title: '✅ Đơn hàng đã được xác nhận',
        body: 'Đơn hàng của bạn đã được xác nhận và sẽ được xử lý sớm nhất',
        priority: 'high',
        actionRequired: false,
        icon: '✅'
      },
      'processing': {
        title: '🔧 Đơn hàng đang được xử lý',
        body: 'Đơn hàng của bạn đang được đóng gói và chuẩn bị giao hàng',
        priority: 'normal',
        actionRequired: false,
        icon: '🔧'
      },
      'shipping': {
        title: '🚚 Đơn hàng đang giao',
        body: 'Đơn hàng của bạn đang được giao. Dự kiến nhận hàng trong 1-3 ngày',
        priority: 'high',
        actionRequired: false,
        icon: '🚚'
      },
      'delivered': {
        title: '🎉 Đơn hàng đã giao thành công',
        body: 'Đơn hàng của bạn đã được giao thành công. Cảm ơn bạn đã mua hàng!',
        priority: 'normal',
        actionRequired: true,
        icon: '🎉'
      },
      'cancelled': {
        title: '❌ Đơn hàng đã bị hủy',
        body: 'Đơn hàng của bạn đã bị hủy. Liên hệ hỗ trợ để biết thêm chi tiết',
        priority: 'high',
        actionRequired: true,
        icon: '❌'
      },
      'refunded': {
        title: '💰 Đơn hàng đã được hoàn tiền',
        body: 'Đơn hàng của bạn đã được hoàn tiền. Tiền sẽ được chuyển về tài khoản trong 3-5 ngày',
        priority: 'high',
        actionRequired: false,
        icon: '💰'
      },
      'returned': {
        title: '📦 Đơn hàng đã được trả lại',
        body: 'Đơn hàng của bạn đã được trả lại thành công. Chúng tôi sẽ xử lý hoàn tiền sớm nhất',
        priority: 'normal',
        actionRequired: false,
        icon: '📦'
      },
      'delayed': {
        title: '⏰ Đơn hàng bị chậm trễ',
        body: 'Đơn hàng của bạn bị chậm trễ do một số lý do khách quan. Xin lỗi vì sự bất tiện!',
        priority: 'high',
        actionRequired: false,
        icon: '⏰'
      },
      'out_for_delivery': {
        title: '🚛 Đơn hàng đang giao đến bạn',
        body: 'Đơn hàng của bạn đang được giao đến địa chỉ. Hãy chuẩn bị nhận hàng!',
        priority: 'high',
        actionRequired: false,
        icon: '🚛'
      },
      'ready_for_pickup': {
        title: '📦 Đơn hàng sẵn sàng nhận',
        body: 'Đơn hàng của bạn đã sẵn sàng để nhận tại cửa hàng',
        priority: 'high',
        actionRequired: true,
        icon: '📦'
      },
      'payment_pending': {
        title: '💳 Chờ thanh toán',
        body: 'Đơn hàng của bạn đang chờ thanh toán. Vui lòng hoàn tất thanh toán để tiếp tục',
        priority: 'high',
        actionRequired: true,
        icon: '💳'
      },
      'payment_failed': {
        title: '❌ Thanh toán thất bại',
        body: 'Thanh toán đơn hàng thất bại. Vui lòng thử lại hoặc liên hệ hỗ trợ',
        priority: 'high',
        actionRequired: true,
        icon: '❌'
      }
    };

    const config = statusMap[orderStatus] || {
      title: '📋 Cập nhật đơn hàng',
      body: `Trạng thái đơn hàng đã thay đổi từ "${previousStatus}" thành "${orderStatus}"`,
      priority: 'normal',
      actionRequired: false,
      icon: '📋'
    };

    return config;
  }

  /**
   * Tạo thông báo đơn hàng
   */
  createOrderNotification(orderData) {
    const { 
      orderId, 
      orderStatus, 
      previousStatus, 
      estimatedDelivery, 
      trackingNumber, 
      adminNote,
      orderAmount,
      paymentMethod,
      deliveryAddress,
      items
    } = orderData;
    
    // Lấy cấu hình theo trạng thái
    const statusConfig = this.getOrderStatusConfig(orderStatus, previousStatus);
    
    // Tạo nội dung thông báo
    let body = statusConfig.body;
    
    // Thêm thông tin bổ sung
    if (estimatedDelivery) {
      body += `\n⏰ Dự kiến giao hàng: ${estimatedDelivery}`;
    }
    
    if (trackingNumber) {
      body += `\n📋 Mã tracking: ${trackingNumber}`;
    }

    if (adminNote) {
      body += `\n📝 Ghi chú: ${adminNote}`;
    }

    if (orderAmount) {
      body += `\n💰 Tổng tiền: ${orderAmount}`;
    }

    if (paymentMethod) {
      body += `\n💳 Phương thức thanh toán: ${paymentMethod}`;
    }

    if (deliveryAddress) {
      body += `\n📍 Địa chỉ giao hàng: ${deliveryAddress}`;
    }

    if (items && items.length > 0) {
      const itemNames = items.slice(0, 3).map(item => item.name).join(', ');
      body += `\n🛍️ Sản phẩm: ${itemNames}${items.length > 3 ? '...' : ''}`;
    }

    return {
      title: statusConfig.title,
      body: body,
      category: 'order_status_change',
      priority: statusConfig.priority,
      orderId: orderId,
      icon: statusConfig.icon,
      additionalData: {
        orderStatus: orderStatus,
        previousStatus: previousStatus,
        estimatedDelivery: estimatedDelivery,
        trackingNumber: trackingNumber,
        adminNote: adminNote,
        orderAmount: orderAmount,
        paymentMethod: paymentMethod,
        deliveryAddress: deliveryAddress,
        items: items,
        statusChangeTime: new Date().toISOString(),
        actionRequired: statusConfig.actionRequired
      }
    };
  }

  /**
   * Lưu thông báo đơn hàng vào storage
   */
  async saveOrderNotificationToStorage(notificationData) {
    try {
      const existingNotificationsRaw = await AsyncStorage.getItem('userNotifications');
      let notifications = existingNotificationsRaw ? JSON.parse(existingNotificationsRaw) : [];

      // Tạo notification object
      const newNotification = {
        id: `order_${notificationData.orderId}_${Date.now()}`,
        title: notificationData.title,
        text: notificationData.body,
        type: 'order_status_change',
        orderId: notificationData.orderId,
        category: notificationData.category,
        priority: notificationData.priority,
        icon: notificationData.icon,
        timestamp: new Date().toISOString(),
        isRead: false,
        source: 'backend',
        additionalData: notificationData.additionalData
      };

      // Thêm vào đầu danh sách
      notifications.unshift(newNotification);

      // Giới hạn số lượng thông báo (giữ 100 thông báo gần nhất)
      if (notifications.length > 100) {
        notifications = notifications.slice(0, 100);
      }

      // Lưu vào storage
      await AsyncStorage.setItem('userNotifications', JSON.stringify(notifications));
      
      console.log('[OrderNotification] Order notification saved to storage:', newNotification);
      return newNotification;
    } catch (error) {
      console.error('[OrderNotification] Error saving order notification to storage:', error);
      throw error;
    }
  }

  /**
   * Xử lý thông báo đơn hàng từ backend
   */
  async handleOrderNotificationFromBackend(notificationData) {
    try {
      // Lưu vào storage
      const savedNotification = await this.saveOrderNotificationToStorage(notificationData);
      
      // Hiển thị thông báo local nếu app đang mở
      if (notificationData.priority === 'high') {
        await this.showLocalOrderNotification(savedNotification);
      }
      
      return savedNotification;
    } catch (error) {
      console.error('[OrderNotification] Error handling order notification from backend:', error);
      throw error;
    }
  }

  /**
   * Hiển thị thông báo local cho đơn hàng
   */
  async showLocalOrderNotification(notificationData) {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      
      if (status === 'granted') {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: notificationData.title,
            body: notificationData.text,
            data: {
              type: 'order_status_change',
              orderId: notificationData.orderId,
              category: notificationData.category,
              priority: notificationData.priority,
              ...notificationData.additionalData
            },
            sound: 'default',
            priority: 'high',
          },
          trigger: null, // Gửi ngay lập tức
        });
        
        console.log('[OrderNotification] Local order notification scheduled');
      }
    } catch (error) {
      console.error('[OrderNotification] Error showing local order notification:', error);
    }
  }

  /**
   * Lấy thông báo đơn hàng từ storage
   */
  async getOrderNotificationsFromStorage() {
    try {
      const existingNotificationsRaw = await AsyncStorage.getItem('userNotifications');
      if (!existingNotificationsRaw) return [];
      
      const notifications = JSON.parse(existingNotificationsRaw);
      return notifications.filter(n => n.type === 'order_status_change');
    } catch (error) {
      console.error('[OrderNotification] Error getting order notifications from storage:', error);
      return [];
    }
  }

  /**
   * Xóa thông báo đơn hàng cũ
   */
  async cleanupOldOrderNotifications(daysToKeep = 30) {
    try {
      const existingNotificationsRaw = await AsyncStorage.getItem('userNotifications');
      if (!existingNotificationsRaw) return;
      
      const notifications = JSON.parse(existingNotificationsRaw);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      const filteredNotifications = notifications.filter(n => {
        if (n.type === 'order_status_change') {
          const notificationDate = new Date(n.timestamp);
          return notificationDate > cutoffDate;
        }
        return true; // Giữ lại các loại thông báo khác
      });
      
      await AsyncStorage.setItem('userNotifications', JSON.stringify(filteredNotifications));
      console.log('[OrderNotification] Cleaned up old order notifications');
    } catch (error) {
      console.error('[OrderNotification] Error cleaning up old order notifications:', error);
    }
  }
}

// Export singleton instance
export const orderNotificationService = OrderNotificationService.getInstance();
