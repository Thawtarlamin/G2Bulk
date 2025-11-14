# Socket.io Real-Time Chat Documentation

## Connection

Connect to the server using Socket.io client with JWT authentication:

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: 'your_jwt_token'
  }
});
```

## Events

### Client → Server

#### Join Chat Room
```javascript
socket.emit('join_chat', chatId);
```

#### Typing Indicator
```javascript
socket.emit('typing', { chatId: 'chat_id' });
```

#### Stop Typing
```javascript
socket.emit('stop_typing', { chatId: 'chat_id' });
```

### Server → Client

#### New Message
```javascript
socket.on('new_message', (data) => {
  console.log('New message:', data);
  // data = {
  //   chatId: 'chat_id',
  //   message: {
  //     sender: 'user' | 'admin',
  //     senderName: 'John Doe',
  //     message: 'Hello',
  //     timestamp: '2025-11-13T10:30:00.000Z',
  //     isRead: false
  //   },
  //   unreadCount: { user: 0, admin: 1 }
  // }
});
```

#### Messages Read
```javascript
socket.on('messages_read', (data) => {
  console.log('Messages marked as read:', data);
  // data = {
  //   chatId: 'chat_id',
  //   unreadCount: { user: 0, admin: 0 }
  // }
});
```

#### Typing Indicator (Received)
```javascript
socket.on('typing', (data) => {
  console.log('User is typing:', data);
  // data = {
  //   sender: 'admin',
  //   senderName: 'Admin'
  // }
});
```

#### Stop Typing (Received)
```javascript
socket.on('stop_typing', () => {
  console.log('User stopped typing');
});
```

## User Rooms

- **User Room**: `user_{userId}` - Each user joins their personal room
- **Admin Room**: `admin_room` - All admins join this room to receive notifications
- **Chat Room**: `chat_{chatId}` - Specific chat room (use `join_chat` event)

## Example Usage

### User Side
```javascript
const socket = io('http://localhost:3000', {
  auth: { token: userToken }
});

// Get or create chat
const response = await fetch('/api/chat/my-chat', {
  headers: { Authorization: `Bearer ${userToken}` }
});
const chat = await response.json();

// Join chat room
socket.emit('join_chat', chat._id);

// Listen for new messages
socket.on('new_message', (data) => {
  if (data.chatId === chat._id) {
    displayMessage(data.message);
  }
});

// Send typing indicator
inputField.addEventListener('input', () => {
  socket.emit('typing', { chatId: chat._id });
});

// Send message via REST API (socket event emitted automatically)
await fetch(`/api/chat/${chat._id}/message`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${userToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ message: 'Hello' })
});
```

### Admin Side
```javascript
const socket = io('http://localhost:3000', {
  auth: { token: adminToken }
});

// Get all chats
const response = await fetch('/api/chat/all', {
  headers: { Authorization: `Bearer ${adminToken}` }
});
const chats = await response.json();

// Listen for new messages from all users
socket.on('new_message', (data) => {
  console.log(`New message in chat ${data.chatId}`);
  updateChatList(data);
});

// Join specific chat when viewing
function viewChat(chatId) {
  socket.emit('join_chat', chatId);
}

// Send message to user
await fetch(`/api/chat/${chatId}/message`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ message: 'How can I help?' })
});
```

## Error Handling

```javascript
socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
  // Possible errors:
  // - 'Authentication error' (invalid/missing token)
  // - 'User not found'
  // - 'Account banned'
});
```

## Notes

- Messages are sent via REST API endpoints, socket.io handles real-time notifications
- Authentication required for socket connection using JWT token
- Banned users cannot connect to socket.io
- Typing indicators are optional and handled separately from messages
- Unread count automatically updated on both sides
