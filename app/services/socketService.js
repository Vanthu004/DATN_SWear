import AsyncStorage from '@react-native-async-storage/async-storage';
import { io } from 'socket.io-client';
import { store } from '../reudx/store';
import { chatAPI } from './chatService';
import { WEBSOCKET_URL } from '@env';  // Import từ .env


class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.callbacks = new Map();
  }

  async connect(dispatch) {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.error('No token found for socket connection');
        return false;
      }

      // Disconnect existing connection
      this.disconnect();

      this.socket = io(`${WEBSOCKET_URL}/chat`, {
        auth: { token },
        transports: ['websocket'],
        upgrade: true,
        timeout: 5000,
        forceNew: true,
      });

      this.setupEventListeners(dispatch);

      return new Promise((resolve) => {
        this.socket.on('connect', () => {
          console.log('✅ Socket connected to chat namespace');
          this.isConnected = true;
          this.reconnectAttempts = 0;

          // Import actions here to avoid circular dependency
          import('../reudx/chatSlice').then(({ setConnectionStatus }) => {
            dispatch(setConnectionStatus(true));
          });

          // Join user rooms automatically
          this.joinUserRooms();
          resolve(true);
        });

        this.socket.on('connect_error', (error) => {
          console.error('❌ Socket connection error:', error.message);
          this.isConnected = false;

          import('../reudx/chatSlice').then(({ setConnectionStatus }) => {
            dispatch(setConnectionStatus(false));
          });

          resolve(false);
        });
      });
    } catch (error) {
      console.error('Socket connection setup error:', error);
      return false;
    }
  }

  setupEventListeners(dispatch) {
    if (!this.socket) return;

    // Connection events
    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      this.isConnected = false;

      import('../reudx/chatSlice').then(({ setConnectionStatus }) => {
        dispatch(setConnectionStatus(false));
      });

      // Auto reconnect if not manual disconnect
      if (reason !== 'io client disconnect' && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.scheduleReconnect(dispatch);
      }
    });

    this.socket.on('reconnect', () => {
      console.log('🔄 Socket reconnected');
      this.isConnected = true;
      this.reconnectAttempts = 0;

      import('../reudx/chatSlice').then(({ setConnectionStatus }) => {
        dispatch(setConnectionStatus(true));
      });

      this.joinUserRooms();
    });

    // Room events
    this.socket.on('rooms_joined', async (data) => {
      console.log('🏠 Joined rooms:', data);
      try {
        const { setChatRooms, selectChatRooms } = await import('../reudx/chatSlice');
        if (!store || !store.getState) {
          console.error('Redux store is not initialized');
          return;
        }
        const currentChatRooms = selectChatRooms(store.getState());

        const missingRoomIds = data.rooms.filter(
          roomId => !currentChatRooms.some(room => room.roomId === roomId)
        );

        if (missingRoomIds.length > 0) {
          const roomDetails = await Promise.all(
            missingRoomIds.map(async (roomId) => {
              try {
                const response = await chatAPI.getChatRoomById(roomId);
                return response.room || response;
              } catch (error) {
                console.error(`Failed to fetch room ${roomId}:`, error);
                return null;
              }
            })
          );
          const validRooms = roomDetails.filter(room => room !== null);
          dispatch(setChatRooms([...currentChatRooms, ...validRooms]));
        }
      } catch (error) {
        console.error('Failed to process joined rooms:', error);
      }
    });

    this.socket.on('room_joined', (data) => {
      console.log('🚪 Joined room:', data.roomId);
      this.executeCallback('room_joined', data);
    });

    this.socket.on('user_joined', (data) => {
      console.log('👋 User joined room:', data);
      this.executeCallback('user_joined', data);
    });

    // Message events
    this.socket.on('new_message', (message) => {
      console.log('💬 New message received:', message);

      import('../reudx/chatSlice').then(({ addMessage }) => {
        dispatch(addMessage(message));
      });

      this.executeCallback('new_message', message);
    });

    this.socket.on('room_updated', (data) => {
      console.log('🔄 Room updated:', data);
      this.executeCallback('room_updated', data);
    });

    this.socket.on('room_status_updated', (data) => {
      console.log('🔄 Received room_status_updated from socket:', data);
      import('../reudx/chatSlice').then(({ updateRoomStatus, fetchChatRooms }) => {
        dispatch(updateRoomStatus({ roomId: data.roomId, status: data.status }));
        // Force fetch để sync
        setTimeout(() => {
          dispatch(fetchChatRooms());
        }, 500);
      });
    });

    // Typing events
    this.socket.on('user_typing', (data) => {
      import('../reudx/chatSlice').then(({ addTypingUser }) => {
        dispatch(addTypingUser(data));
      });
    });

    this.socket.on('user_stopped_typing', (data) => {
      import('../reudx/chatSlice').then(({ removeTypingUser }) => {
        dispatch(removeTypingUser(data));
      });
    });

    // Error events
    this.socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
      this.executeCallback('error', error);
    });
  }

  scheduleReconnect(dispatch) {
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);

    console.log(`🔄 Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);

    setTimeout(() => {
      if (!this.isConnected) {
        this.connect(dispatch);
      }
    }, delay);
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Room operations
  joinUserRooms() {
    if (this.socket && this.isConnected) {
      console.log('Joining user rooms...');
      import('../reudx/chatSlice').then(async ({ fetchChatRooms }) => {
        try {
          // ✅ dùng store.dispatch thay vì dispatch
          const result = await store.dispatch(fetchChatRooms()).unwrap();
          const rooms = result.chatRooms || [];
          rooms.forEach(room => {
            console.log('Joining room:', room.roomId);
            this.socket.emit('join_room', { roomId: room.roomId });
          });
        } catch (error) {
          console.error('Failed to fetch rooms for joining:', error);
        }
      });
    }
  }
  joinRoom(roomId) {
    if (this.socket && this.isConnected) {
      console.log('🚪 Joining room:', roomId);
      this.socket.emit('join_room', { roomId });
    }
  }

  leaveRoom(roomId) {
    if (this.socket && this.isConnected) {
      console.log('🚪 Leaving room:', roomId);
      this.socket.emit('leave_room', { roomId });
    }
  }

  // Message operations
  sendMessage(messageData) {
    if (this.socket && this.isConnected) {
      console.log('📤 Sending message via socket:', messageData);
      this.socket.emit('send_message', messageData);
      return true;
    } else {
      console.warn('⚠️ Socket not connected, cannot send message');
      return false;
    }
  }

  // Typing indicators
  startTyping(roomId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_start', { roomId });
    }
  }

  stopTyping(roomId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_stop', { roomId });
    }
  }

  // Status updates
  updateOnlineStatus(status) {
    if (this.socket && this.isConnected) {
      this.socket.emit('update_online_status', status);
    }
  }

  // Callback management
  on(event, callback) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event).push(callback);
  }

  off(event, callback) {
    if (this.callbacks.has(event)) {
      const callbacks = this.callbacks.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  executeCallback(event, data) {
    if (this.callbacks.has(event)) {
      this.callbacks.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error executing callback for ${event}:`, error);
        }
      });
    }
  }

  // Getters
  getConnectionStatus() {
    return this.isConnected;
  }

  getSocket() {
    return this.socket;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;