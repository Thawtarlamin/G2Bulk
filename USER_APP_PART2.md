# User App - Part 2 (Profile, Topup, Chat)

## 👤 Profile Page

```javascript
// src/pages/Profile.jsx
import { useEffect, useState } from 'react';
import { Wallet, Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get(`/orders/user/${user._id}`);
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async (orderId) => {
    try {
      const { data } = await api.get(`/orders/${orderId}/check-status`);
      toast.success(`Status: ${data.status}`);
      fetchOrders(); // Refresh orders
    } catch (error) {
      toast.error('Failed to check status');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
      case 'refunded':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending':
      case 'processing':
      case 'confirming':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'confirming':
        return 'bg-indigo-100 text-indigo-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* User Info */}
      <div className="card mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">{user.name}</h1>
            <p className="text-gray-600">{user.email}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">Balance</p>
            <p className="text-3xl font-bold text-primary-600">
              {user.balance?.toLocaleString()} MMK
            </p>
          </div>
        </div>
        <a href="/topup" className="btn-primary w-full sm:w-auto">
          <Wallet className="w-5 h-5 inline mr-2" />
          Top Up Balance
        </a>
      </div>

      {/* Order History */}
      <div className="card">
        <h2 className="text-xl font-bold mb-6">Order History</h2>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No orders yet</p>
            <a href="/products" className="btn-primary mt-4 inline-block">
              Start Shopping
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3">
                    {getStatusIcon(order.status)}
                    <div>
                      <h3 className="font-semibold">{order.product_key}</h3>
                      <p className="text-sm text-gray-600">
                        Order ID: {order._id.slice(-8)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Game ID: {order.input}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <div>
                    <p className="text-sm text-gray-600">
                      {format(new Date(order.createdAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                    <p className="text-lg font-bold text-primary-600">
                      {order.amount?.toLocaleString()} MMK
                    </p>
                  </div>
                  {(order.status === 'pending' || order.status === 'processing') && (
                    <button
                      onClick={() => handleCheckStatus(order._id)}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Check Status
                    </button>
                  )}
                </div>

                {order.external_id && (
                  <p className="text-xs text-gray-500 mt-2">
                    Transaction ID: {order.external_id}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
```

---

## 💰 Top Up Page

```javascript
// src/pages/Topup.jsx
import { useState, useEffect } from 'react';
import { Upload, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Topup = () => {
  const { user, refreshUser } = useAuth();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('kbz');
  const [lastSixDigit, setLastSixDigit] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [topups, setTopups] = useState([]);

  const paymentMethods = [
    { value: 'kbz', label: 'KBZ Pay', number: '09123456789' },
    { value: 'wave', label: 'Wave Money', number: '09123456789' },
    { value: 'aya', label: 'AYA Pay', number: '09123456789' },
  ];

  useEffect(() => {
    fetchTopups();
  }, []);

  const fetchTopups = async () => {
    try {
      const { data } = await api.get('/topups/my-topups');
      setTopups(data);
    } catch (error) {
      console.error('Error fetching topups:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setScreenshot(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || !lastSixDigit || !transactionId || !screenshot) {
      toast.error('Please fill all fields');
      return;
    }

    if (parseInt(amount) < 1000) {
      toast.error('Minimum top-up amount is 1,000 MMK');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('amount', amount);
      formData.append('method', method);
      formData.append('last_six_digit', lastSixDigit);
      formData.append('transaction_id', transactionId);
      formData.append('screenshot', screenshot);

      await api.post('/topups', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Top-up request submitted successfully!');
      
      // Reset form
      setAmount('');
      setLastSixDigit('');
      setTransactionId('');
      setScreenshot(null);
      
      fetchTopups(); // Refresh topup history
    } catch (error) {
      toast.error(error.response?.data?.message || 'Top-up request failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Top Up Balance</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Up Form */}
          <div>
            <div className="card mb-6 bg-primary-50 border border-primary-200">
              <h3 className="font-semibold mb-2">Current Balance</h3>
              <p className="text-3xl font-bold text-primary-600">
                {user.balance?.toLocaleString()} MMK
              </p>
            </div>

            <div className="card">
              <h2 className="text-xl font-bold mb-6">Submit Top-Up Request</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <div className="space-y-2">
                    {paymentMethods.map((pm) => (
                      <label
                        key={pm.value}
                        className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition ${
                          method === pm.value
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-primary-300'
                        }`}
                      >
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="method"
                            value={pm.value}
                            checked={method === pm.value}
                            onChange={(e) => setMethod(e.target.value)}
                            className="mr-3"
                          />
                          <span className="font-medium">{pm.label}</span>
                        </div>
                        <span className="text-sm text-gray-600">{pm.number}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (MMK)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    min="1000"
                    step="1000"
                    className="input"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum: 1,000 MMK
                  </p>
                </div>

                {/* Last 6 Digits */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last 6 Digits of Your Phone Number
                  </label>
                  <input
                    type="text"
                    value={lastSixDigit}
                    onChange={(e) => setLastSixDigit(e.target.value)}
                    placeholder="123456"
                    maxLength="6"
                    pattern="\d{6}"
                    className="input"
                  />
                </div>

                {/* Transaction ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction ID
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter transaction ID"
                    className="input"
                  />
                </div>

                {/* Screenshot */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Screenshot
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="screenshot"
                    />
                    <label htmlFor="screenshot" className="cursor-pointer">
                      <span className="text-primary-600 hover:text-primary-700 font-medium">
                        Click to upload
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG up to 5MB
                      </p>
                    </label>
                    {screenshot && (
                      <p className="text-sm text-green-600 mt-2">
                        ✓ {screenshot.name}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
              </form>
            </div>
          </div>

          {/* Top Up History */}
          <div>
            <div className="card">
              <h2 className="text-xl font-bold mb-6">Top-Up History</h2>

              {topups.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No top-up requests yet</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {topups.map((topup) => (
                    <div
                      key={topup._id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start space-x-3">
                          {getStatusIcon(topup.status)}
                          <div>
                            <p className="font-semibold uppercase">{topup.method}</p>
                            <p className="text-sm text-gray-600">
                              {format(new Date(topup.createdAt), 'MMM dd, yyyy HH:mm')}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(topup.status)}`}>
                          {topup.status}
                        </span>
                      </div>

                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Amount:</span>
                          <span className="font-bold text-primary-600">
                            {topup.amount.toLocaleString()} MMK
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last 6 digits:</span>
                          <span className="font-mono">{topup.last_six_digit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Transaction ID:</span>
                          <span className="font-mono text-xs">{topup.transaction_id}</span>
                        </div>
                      </div>

                      {topup.admin_note && (
                        <div className="mt-3 p-2 bg-gray-100 rounded text-sm">
                          <p className="text-gray-600">Admin Note:</p>
                          <p className="text-gray-800">{topup.admin_note}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topup;
```

---

## 💬 Chat Component

```javascript
// src/components/Chat/ChatButton.jsx
import { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import ChatWindow from './ChatWindow';
import { useAuth } from '../../context/AuthContext';

const ChatButton = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary-500 text-white rounded-full shadow-lg hover:bg-primary-600 transition-all hover:scale-110 flex items-center justify-center z-50"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && <ChatWindow onClose={() => setIsOpen(false)} />}
    </>
  );
};

export default ChatButton;
```

```javascript
// src/components/Chat/ChatWindow.jsx
import { useState, useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { initSocket, getSocket } from '../../utils/socket';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const ChatWindow = ({ onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatId, setChatId] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    initializeChat();
    return () => {
      if (socket) {
        socket.off('new_message');
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = async () => {
    try {
      // Initialize socket
      const socketInstance = initSocket(user._id);
      setSocket(socketInstance);

      // Get or create chat
      const { data } = await api.post('/chats/start');
      setChatId(data._id);
      setMessages(data.messages || []);

      // Join chat room
      socketInstance.emit('join_chat', data._id);

      // Listen for new messages
      socketInstance.on('new_message', (messageData) => {
        if (messageData.chatId === data._id) {
          const newMsg = messageData.message;
          
          // Check if message already exists to prevent duplicates
          setMessages(prev => {
            const exists = prev.some(msg => 
              msg.timestamp === newMsg.timestamp && 
              msg.message === newMsg.message
            );
            if (!exists) {
              return [...prev, newMsg];
            }
            return prev;
          });
        }
      });
    } catch (error) {
      console.error('Error initializing chat:', error);
      toast.error('Failed to load chat');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatId) return;

    const messageText = newMessage.trim();
    setNewMessage(''); // Clear input immediately

    try {
      const { data } = await api.post(`/chats/${chatId}/messages`, {
        message: messageText,
      });

      // Add message to local state
      setMessages(prev => [...prev, data]);

      // Emit via socket for real-time delivery to admin
      if (socket) {
        socket.emit('send_message', {
          chatId: chatId,
          message: data,
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setNewMessage(messageText); // Restore message on error
    }
  };

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50">
      {/* Header */}
      <div className="bg-primary-500 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div>
          <h3 className="font-bold">Customer Support</h3>
          <p className="text-xs text-primary-100">We usually reply within minutes</p>
        </div>
        <button
          onClick={onClose}
          className="hover:bg-primary-600 p-1 rounded transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No messages yet</p>
            <p className="text-sm mt-2">Send a message to start chatting</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-lg p-3 ${
                  msg.sender === 'user'
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-gray-800 border border-gray-200'
                }`}
              >
                <p className="break-words">{msg.message}</p>
                <p
                  className={`text-xs mt-1 ${
                    msg.sender === 'user' ? 'text-primary-100' : 'text-gray-500'
                  }`}
                >
                  {format(new Date(msg.timestamp), 'HH:mm')}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-white rounded-b-lg">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
```

---

## 🔐 Auth Pages

```javascript
// src/pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (error) {
      // Error handled by AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Login to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
```

```javascript
// src/pages/Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      navigate('/');
    } catch (error) {
      // Error handled by AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
          <p className="text-gray-600">Join us today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input"
              required
              minLength="6"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
```

---

## 🚀 Main App & Router

```javascript
// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Order from './pages/Order';
import OrderSuccess from './pages/OrderSuccess';
import Profile from './pages/Profile';
import Topup from './pages/Topup';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return user ? <Navigate to="/" /> : children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          {/* Protected Routes */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/products" element={<Layout><Products /></Layout>} />
          <Route path="/products/:id" element={<Layout><ProductDetail /></Layout>} />
          <Route path="/order" element={<PrivateRoute><Order /></PrivateRoute>} />
          <Route path="/order-success" element={<PrivateRoute><OrderSuccess /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/topup" element={<PrivateRoute><Topup /></PrivateRoute>} />

          {/* 404 */}
          <Route path="*" element={<Layout><NotFound /></Layout>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
```

```javascript
// src/pages/NotFound.jsx
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">Page not found</p>
      <Link to="/" className="btn-primary inline-flex items-center space-x-2">
        <Home className="w-5 h-5" />
        <span>Back to Home</span>
      </Link>
    </div>
  );
};

export default NotFound;
```

---

## 🎨 Main Entry Point

```javascript
// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## 📝 Environment Variables

```env
# .env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

---

## ✅ Features Summary

- ✅ User authentication (Login/Register)
- ✅ Product browsing with search
- ✅ Product detail with item selection
- ✅ Order placement with balance check
- ✅ Order history with status tracking
- ✅ Real-time order status updates via Socket.io
- ✅ Balance top-up with screenshot upload
- ✅ Top-up history with admin approval status
- ✅ Real-time chat with admin support
- ✅ Chat with duplicate message prevention
- ✅ Responsive design (mobile-first)
- ✅ Toast notifications
- ✅ Loading states
- ✅ Error handling
- ✅ Protected routes
- ✅ Auto-logout on token expiry

---

## 🚀 Running the App

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```
