// app/redux/chatSlice.js
import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';
import { chatAPI } from '../../app/services/chatService.js';

export const fetchChatRooms = createAsyncThunk(
  'chat/fetchChatRooms',
  async (_, { rejectWithValue }) => {
    try {
      const response = await chatAPI.getMyChatRooms();

     // console.log('🌐 fetchChatRooms Response:', response);
      return response;
    } catch (error) {
     // console.error('🌐 fetchChatRooms Error:', error);
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tải phòng chat');
    }
  }
);

export const createChatRoom = createAsyncThunk(
  'chat/createChatRoom',
  async (roomData, { rejectWithValue }) => {
    try {
      const response = await chatAPI.createChatRoom(roomData);

    //  console.log('Thunk response:', response);
      if (!response || !response.chatRoom) {
        return rejectWithValue('No chatRoom data in response');
      }
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Lỗi tạo phòng chat không xác định';
      if (typeof errorMessage === 'string' && errorMessage.includes('Dữ liệu không hợp lệ')) {
        return rejectWithValue({ message: errorMessage, response: error.response?.data || {} });
      }
      console.error('Thunk createChatRoom error:', { message: errorMessage, response: error.response?.data });
      return rejectWithValue({ message: errorMessage, existingRoom: error.response?.data?.existingRoom });
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async ({ roomId, page }, { rejectWithValue }) => {
    try {
      const response = await chatAPI.getMessages(roomId, page);

    //  console.log('🌐 fetchMessages Response:', response);
      return { roomId, ...response };
    } catch (error) {
      console.error('fetchMessages Error:', error);
      return rejectWithValue(error.response?.data?.message || 'Lỗi lấy tin nhắn');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (messageData, { rejectWithValue }) => {
    try {
      const response = await chatAPI.sendMessage(messageData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi gửi tin nhắn');
    }
  }
);

const initialState = {
  chatRooms: [],
  currentRoom: null,
  messages: {},
  currentMessages: [],
  isLoadingRooms: false,
  isLoadingMessages: false,
  isSendingMessage: false,
  isConnected: false,
  onlineUsers: [],
  error: null,
  typingUsers: [],
  hasMoreMessages: true,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setConnectionStatus: (state, action) => {
      state.isConnected = action.payload;
    },
    setCurrentRoom: (state, action) => {
      state.currentRoom = action.payload;
      state.currentMessages = state.messages[action.payload?.roomId] || [];
      state.hasMoreMessages = true;
    },
    clearCurrentRoom: (state) => {
      state.currentRoom = null;
      state.currentMessages = [];
      state.hasMoreMessages = true;
    },
    addMessage: (state, action) => {
      const message = action.payload;
      const roomId = message.room_id;

      if (!state.messages[roomId]) {
        state.messages[roomId] = [];
      }

      const messageExists = state.messages[roomId].some(m => m.id === message.id);
      if (!messageExists) {
        state.messages[roomId].push(message);

        if (state.currentRoom?.roomId === roomId) {
          state.currentMessages = [...state.messages[roomId]];
        }

        const roomIndex = state.chatRooms.findIndex(room => room.roomId === roomId);
        if (roomIndex !== -1) {
          state.chatRooms[roomIndex].lastMessageAt = message.created_at;
          const room = state.chatRooms.splice(roomIndex, 1)[0];
          state.chatRooms.unshift(room);
        }
      }
    },
    updateRoomStatus: (state, action) => {
      const { roomId, status } = action.payload;
      const roomIndex = state.chatRooms.findIndex(room => room.roomId === roomId);
      if (roomIndex !== -1) {
        state.chatRooms = [
          ...state.chatRooms.slice(0, roomIndex),
          { ...state.chatRooms[roomIndex], status, updatedAt: new Date().toISOString() },
          ...state.chatRooms.slice(roomIndex + 1)
        ];
      }
      if (state.currentRoom?.roomId === roomId) {
        state.currentRoom = { ...state.currentRoom, status, updatedAt: new Date().toISOString() };
      }
    },
    setTypingUsers: (state, action) => {
      state.typingUsers = action.payload;
    },
    addTypingUser: (state, action) => {
      const { userId, userName, roomId } = action.payload;
      if (state.currentRoom?.roomId === roomId) {
        const exists = state.typingUsers.some(user => user.userId === userId);
        if (!exists) {
          state.typingUsers.push({ userId, userName });
        }
      }
    },
    removeTypingUser: (state, action) => {
      const { userId } = action.payload;
      state.typingUsers = state.typingUsers.filter(user => user.userId !== userId);
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetChat: (state) => {
      return { ...initialState };
    },
    setChatRooms: (state, action) => {
      state.chatRooms = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChatRooms.pending, (state) => {
        state.isLoadingRooms = true;
        state.error = null;
      })
      .addCase(fetchChatRooms.fulfilled, (state, action) => {
        state.isLoadingRooms = false;
        const newRooms = action.payload.chatRooms || action.payload.rooms || [];
        const roomMap = new Map(state.chatRooms.map(room => [room.roomId, room]));
        newRooms.forEach(room => {
          roomMap.set(room.roomId, { ...roomMap.get(room.roomId), ...room });
        });
        state.chatRooms = Array.from(roomMap.values()).sort(
          (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
        );

      //  console.log('🚀 Updated chatRooms:', state.chatRooms.map(r => ({ roomId: r.roomId, status: r.status })));
      })
      .addCase(fetchChatRooms.rejected, (state, action) => {
        state.isLoadingRooms = false;
        state.error = action.payload || 'Lỗi không xác định khi tải phòng chat';
        console.error('fetchChatRooms Failed:', action.payload);
      })
      .addCase(createChatRoom.pending, (state) => {
        state.isLoadingRooms = true;
        state.error = null;
      })
      .addCase(createChatRoom.fulfilled, (state, action) => {
        state.isLoadingRooms = false;
        const newRoom = action.payload.chatRoom;
        state.chatRooms.unshift(newRoom);
        state.currentRoom = newRoom;
        state.currentMessages = [];
      })
      .addCase(createChatRoom.rejected, (state, action) => {
        state.isLoadingRooms = false;
        state.error = action.payload;
      })
      .addCase(fetchMessages.pending, (state) => {
        state.isLoadingMessages = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoadingMessages = false;
        const { roomId, messages, pagination } = action.payload;
        if (!state.messages[roomId]) {
          state.messages[roomId] = [];
        }
        // Lọc tin nhắn trùng lặp dựa trên id
        const uniqueMessages = messages.filter(
          (msg) => !state.messages[roomId].some((existingMsg) => existingMsg.id === msg.id)
        );
        state.messages[roomId] = [...state.messages[roomId], ...uniqueMessages];
        // Cập nhật currentMessages nếu đang ở phòng hiện tại
        if (state.currentRoom?.roomId === roomId) {
          state.currentMessages = [...state.messages[roomId]];
        }
        state.hasMoreMessages = pagination?.hasMore || false;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoadingMessages = false;
        state.error = action.payload;
      })
      .addCase(sendMessage.pending, (state) => {
        state.isSendingMessage = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state) => {
        state.isSendingMessage = false;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isSendingMessage = false;
        state.error = action.payload;
      });
  },
});

export const selectChatRooms = createSelector(
  [state => state.chat.chatRooms],
  chatRooms => chatRooms
);

export const {
  setConnectionStatus,
  setCurrentRoom,
  clearCurrentRoom,
  addMessage,
  updateRoomStatus,
  setTypingUsers,
  addTypingUser,
  removeTypingUser,
  setOnlineUsers,
  clearError,
  resetChat,
  setChatRooms,
} = chatSlice.actions;

export default chatSlice.reducer;