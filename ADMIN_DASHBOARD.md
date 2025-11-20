# Admin Dashboard - React + Vite + Tailwind CSS

## 🎯 Project Setup

```bash
npm create vite@latest admin-dashboard -- --template react
cd admin-dashboard
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install axios react-router-dom recharts lucide-react
npm install socket.io-client date-fns
```

### Tailwind Configuration

```js
// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Layout/
│   │   ├── Sidebar.jsx
│   │   ├── Header.jsx
│   │   └── Layout.jsx
│   ├── Dashboard/
│   │   ├── StatCard.jsx
│   │   ├── RevenueChart.jsx
│   │   └── RecentActivity.jsx
│   ├── Users/
│   │   ├── UserList.jsx
│   │   └── UserDetail.jsx
│   ├── Orders/
│   │   ├── OrderList.jsx
│   │   └── OrderDetail.jsx
│   ├── Topups/
│   │   ├── TopupList.jsx
│   │   └── TopupApproval.jsx
│   ├── Products/
│   │   ├── ProductList.jsx
│   │   └── ProductSync.jsx
│   ├── Settings/
│   │   ├── SystemConfig.jsx
│   │   └── PaymentAccounts.jsx
│   └── Chat/
│       ├── ChatList.jsx
│       └── ChatWindow.jsx
├── pages/
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Users.jsx
│   ├── Orders.jsx
│   ├── Topups.jsx
│   ├── Products.jsx
│   ├── Chat.jsx
│   └── Settings.jsx
├── utils/
│   ├── api.js
│   ├── socket.js
│   └── constants.js
├── context/
│   └── AuthContext.jsx
├── App.jsx
└── main.jsx
```

---

## 🔐 Authentication Setup

### Socket.io Client Setup

```javascript
// src/utils/socket.js
import { io } from 'socket.io-client';

let socket = null;

export const initSocket = () => {
  if (!socket) {
    socket = io('http://localhost:3000', {
      auth: { token: localStorage.getItem('token') },
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('Socket connected');
      socket.emit('join_admin_room');
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    // Listen for order status updates
    socket.on('orderStatusUpdate', (data) => {
      console.log('Order status updated:', data);
      // Handle order status update notification
    });

    // Listen for new messages
    socket.on('new_message', (data) => {
      console.log('New message:', data);
      // Handle new message notification
    });
  }
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
```

### API Client

```javascript
// src/utils/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Auth Context

```javascript
// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { initSocket, disconnectSocket } from '../utils/socket';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const { data } = await api.get('/auth/profile');
        if (data.role === 'admin') {
          setUser(data);
          initSocket(); // Initialize socket on successful auth
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.user.role !== 'admin') {
      throw new Error('Access denied. Admin only.');
    }
    localStorage.setItem('token', data.token);
    setUser(data.user);
    initSocket(); // Initialize socket after login
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    disconnectSocket(); // Disconnect socket on logout
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

---

## 🎨 Layout Components

### Sidebar

```javascript
// src/components/Layout/Sidebar.jsx
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, ShoppingCart, CreditCard, 
  Package, MessageSquare, Settings, LogOut 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/users', icon: Users, label: 'Users' },
    { path: '/orders', icon: ShoppingCart, label: 'Orders' },
    { path: '/topups', icon: CreditCard, label: 'Topups' },
    { path: '/products', icon: Package, label: 'Products' },
    { path: '/chat', icon: MessageSquare, label: 'Chat' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold">SL Gaming</h1>
        <p className="text-gray-400 text-sm">Admin Panel</p>
      </div>

      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-6 py-3 hover:bg-gray-800 transition ${
                isActive ? 'bg-gray-800 border-l-4 border-blue-500' : ''
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <button
        onClick={logout}
        className="absolute bottom-6 left-6 right-6 flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition"
      >
        <LogOut className="w-5 h-5 mr-2" />
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
```

### Header

```javascript
// src/components/Layout/Header.jsx
import { Bell, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6">
      <h2 className="text-xl font-semibold">Admin Dashboard</h2>
      
      <div className="flex items-center space-x-4">
        <button className="relative p-2 hover:bg-gray-100 rounded-full">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <span className="font-medium">{user?.name}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
```

### Main Layout

```javascript
// src/components/Layout/Layout.jsx
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 flex-1">
        <Header />
        <main className="p-6 bg-gray-50 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
```

---

## 📊 Dashboard Page

```javascript
// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import api from '../utils/api';
import { DollarSign, ShoppingCart, Users, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [yearlyData, setYearlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, yearlyRes] = await Promise.all([
        api.get('/stats/dashboard'),
        api.get('/stats/yearly'),
      ]);
      setStats(statsRes.data);
      setYearlyData(yearlyRes.data.monthly);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={`${stats.revenue.total.toLocaleString()} MMK`}
          icon={DollarSign}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Orders"
          value={stats.orders.total}
          icon={ShoppingCart}
          color="bg-green-500"
        />
        <StatCard
          title="Total Users"
          value={stats.users.total}
          icon={Users}
          color="bg-purple-500"
        />
        <StatCard
          title="Total Profit"
          value={`${stats.revenue.profit.toLocaleString()} MMK`}
          icon={TrendingUp}
          color="bg-yellow-500"
        />
      </div>

      {/* Revenue Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Monthly Revenue</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={yearlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="monthName" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="orders.revenue" stroke="#3b82f6" name="Revenue" />
            <Line type="monotone" dataKey="profit" stroke="#10b981" name="Profit" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-2xl font-bold mt-2">{value}</p>
      </div>
      <div className={`${color} p-3 rounded-lg`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

export default Dashboard;
```

---

## 👥 Users Management

```javascript
// src/pages/Users.jsx
import { useEffect, useState } from 'react';
import api from '../utils/api';
import { Search, Ban, UserCog } from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId) => {
    const reason = prompt('Ban reason:');
    if (!reason) return;

    try {
      await api.patch(`/users/${userId}/ban`, { reason });
      fetchUsers();
    } catch (error) {
      alert('Error banning user: ' + error.response?.data?.message);
    }
  };

  const handleUnbanUser = async (userId) => {
    try {
      await api.patch(`/users/${userId}/unban`);
      fetchUsers();
    } catch (error) {
      alert('Error unbanning user: ' + error.response?.data?.message);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await api.patch(`/users/${userId}/role`, { role: newRole });
      fetchUsers();
    } catch (error) {
      alert('Error changing role: ' + error.response?.data?.message);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users Management</h1>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user._id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.balance.toLocaleString()} MMK</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={user.role}
                    onChange={(e) => handleChangeRole(user._id, e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.isBanned ? (
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Banned</span>
                  ) : (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    {user.isBanned ? (
                      <button
                        onClick={() => handleUnbanUser(user._id)}
                        className="text-green-600 hover:text-green-800"
                      >
                        Unban
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBanUser(user._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
```

---

## 🛍️ Orders Management

```javascript
// src/pages/Orders.jsx
import { useEffect, useState } from 'react';
import api from '../utils/api';
import { format } from 'date-fns';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders');
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
      alert(`Order Status: ${data.status}\nExternal Status: ${data.external_status}`);
      fetchOrders();
    } catch (error) {
      alert('Error checking status: ' + error.response?.data?.message);
    }
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'confirming': return 'bg-indigo-100 text-indigo-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orders Management</h1>
      </div>

      {/* Filter */}
      <div className="mb-6 flex space-x-2">
        {['all', 'pending', 'processing', 'confirming', 'completed', 'failed', 'refunded'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg ${
              filter === status
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <tr key={order._id}>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">
                  {order._id.slice(-8)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {order.user?.name || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{order.product_key}</td>
                <td className="px-6 py-4 whitespace-nowrap">{order.amount?.toLocaleString()} MMK</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(order.createdAt), 'MMM dd, yyyy HH:mm')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleCheckStatus(order._id)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Check Status
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;
```

---

## 💳 Topups Management

```javascript
// src/pages/Topups.jsx
import { useEffect, useState } from 'react';
import api from '../utils/api';
import { format } from 'date-fns';
import { ExternalLink } from 'lucide-react';

const Topups = () => {
  const [topups, setTopups] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopups();
  }, [filter]);

  const fetchTopups = async () => {
    try {
      const { data } = await api.get(`/topups/status/${filter}`);
      setTopups(data);
    } catch (error) {
      console.error('Error fetching topups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (topupId) => {
    try {
      await api.patch(`/topups/${topupId}/approve`);
      fetchTopups();
      alert('Topup approved successfully!');
    } catch (error) {
      alert('Error approving topup: ' + error.response?.data?.message);
    }
  };

  const handleReject = async (topupId) => {
    const note = prompt('Rejection reason:');
    if (!note) return;

    try {
      await api.patch(`/topups/${topupId}/reject`, { admin_note: note });
      fetchTopups();
      alert('Topup rejected!');
    } catch (error) {
      alert('Error rejecting topup: ' + error.response?.data?.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Topup Requests</h1>

      {/* Filter */}
      <div className="mb-6 flex space-x-2">
        {['pending', 'approved', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg ${
              filter === status
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Topups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topups.map((topup) => (
          <div key={topup._id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-semibold">{topup.user?.name}</p>
                <p className="text-sm text-gray-500">{topup.user?.email}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(topup.status)}`}>
                {topup.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-bold">{topup.amount.toLocaleString()} MMK</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Method:</span>
                <span className="uppercase">{topup.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last 6 Digits:</span>
                <span className="font-mono">{topup.last_six_digit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-mono text-sm">{topup.transaction_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="text-sm">{format(new Date(topup.createdAt), 'MMM dd, HH:mm')}</span>
              </div>
            </div>

            {topup.screenshot_url && (
              <a
                href={`http://localhost:3000${topup.screenshot_url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-800 mb-4"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View Screenshot</span>
              </a>
            )}

            {topup.status === 'pending' && (
              <div className="flex space-x-2">
                <button
                  onClick={() => handleApprove(topup._id)}
                  className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(topup._id)}
                  className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600"
                >
                  Reject
                </button>
              </div>
            )}

            {topup.admin_note && (
              <div className="mt-4 p-3 bg-gray-100 rounded">
                <p className="text-sm text-gray-600">Admin Note:</p>
                <p className="text-sm">{topup.admin_note}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Topups;
```

---

## 💬 Chat Management

```javascript
// src/pages/Chat.jsx
import { useEffect, useState } from 'react';
import api from '../utils/api';
import { io } from 'socket.io-client';
import { Send, X } from 'lucide-react';
import { format } from 'date-fns';

const Chat = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    fetchChats();
    
    // Initialize Socket.io
    const newSocket = io('http://localhost:3000', {
      auth: { token: localStorage.getItem('token') }
    });
    
    setSocket(newSocket);

    // Join admin room
    newSocket.emit('join_admin_room');

    // Listen for new messages
    newSocket.on('new_message', (data) => {
      if (selectedChat?._id === data.chatId) {
        setMessages(prev => [...prev, data.message]);
      }
      fetchChats(); // Update chat list with new unread count
    });

    return () => newSocket.close();
  }, []);

  const fetchChats = async () => {
    try {
      const { data } = await api.get('/chats/all');
      setChats(data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const handleSelectChat = async (chat) => {
    setSelectedChat(chat);
    try {
      const { data } = await api.get(`/chats/${chat._id}`);
      setMessages(data.messages);
      
      // Join chat room
      socket?.emit('join_chat', chat._id);
      
      // Mark as read
      await api.patch(`/chats/${chat._id}/read`);
      fetchChats(); // Refresh to update unread counts
    } catch (error) {
      console.error('Error loading chat:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const { data } = await api.post(`/chats/${selectedChat._id}/messages`, {
        message: newMessage,
      });
      
      setMessages(prev => [...prev, data]);
      setNewMessage('');
      
      // Emit via socket for real-time delivery
      socket?.emit('send_message', {
        chatId: selectedChat._id,
        message: data,
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleCloseChat = async (chatId) => {
    try {
      await api.patch(`/chats/${chatId}/close`);
      fetchChats();
      if (selectedChat?._id === chatId) {
        setSelectedChat(null);
        setMessages([]);
      }
    } catch (error) {
      alert('Error closing chat: ' + error.response?.data?.message);
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)]">
      {/* Chat List */}
      <div className="w-1/3 bg-white border-r overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Chats</h2>
        </div>
        <div className="divide-y">
          {chats.map((chat) => (
            <div
              key={chat._id}
              onClick={() => handleSelectChat(chat)}
              className={`p-4 cursor-pointer hover:bg-gray-50 ${
                selectedChat?._id === chat._id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold">{chat.user?.name}</p>
                  <p className="text-sm text-gray-500">{chat.user?.email}</p>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    chat.status === 'open' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {chat.status}
                  </span>
                  {chat.unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
              </div>
              {chat.lastMessage && (
                <p className="text-sm text-gray-600 truncate">
                  {chat.lastMessage.message}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {format(new Date(chat.updatedAt), 'MMM dd, HH:mm')}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      {selectedChat ? (
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat Header */}
          <div className="p-4 border-b flex justify-between items-center">
            <div>
              <h3 className="font-bold">{selectedChat.user?.name}</h3>
              <p className="text-sm text-gray-500">{selectedChat.user?.email}</p>
            </div>
            <button
              onClick={() => handleCloseChat(selectedChat._id)}
              className="text-red-600 hover:text-red-800 flex items-center space-x-1"
            >
              <X className="w-4 h-4" />
              <span>Close Chat</span>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    msg.sender === 'admin'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  <p>{msg.message}</p>
                  <p className={`text-xs mt-1 ${
                    msg.sender === 'admin' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {format(new Date(msg.timestamp), 'HH:mm')}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <p className="text-gray-500">Select a chat to start messaging</p>
        </div>
      )}
    </div>
  );
};

export default Chat;
```

---

## 📦 Products & Settings

```javascript
// src/pages/Products.jsx
import { useEffect, useState } from 'react';
import api from '../utils/api';
import { RefreshCw } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const { data } = await api.post('/products/sync');
      alert(data.message);
      fetchProducts();
    } catch (error) {
      alert('Error syncing products: ' + error.response?.data?.message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? 'Syncing...' : 'Sync Products'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product._id} className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-lg mb-2">{product.game}</h3>
            <p className="text-sm text-gray-500 mb-4">{product.key}</p>
            <p className="text-sm text-gray-600 mb-2">Items: {product.items?.length || 0}</p>
            <span className={`px-2 py-1 rounded-full text-xs ${
              product.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {product.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
```

```javascript
// src/pages/Settings.jsx
import { useEffect, useState } from 'react';
import api from '../utils/api';

const Settings = () => {
  const [configs, setConfigs] = useState([]);
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const { data } = await api.get('/system-config');
      setConfigs(data);
    } catch (error) {
      console.error('Error fetching configs:', error);
    }
  };

  const handleInitialize = async () => {
    try {
      await api.post('/system-config/init');
      alert('Configs initialized!');
      fetchConfigs();
    } catch (error) {
      alert('Error: ' + error.response?.data?.message);
    }
  };

  const handleEdit = (config) => {
    setEditingKey(config.key);
    setEditValue(config.value);
  };

  const handleSave = async (key) => {
    try {
      await api.put(`/system-config/${key}`, { value: parseFloat(editValue) });
      setEditingKey(null);
      fetchConfigs();
      alert('Config updated!');
    } catch (error) {
      alert('Error: ' + error.response?.data?.message);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">System Settings</h1>
        <button
          onClick={handleInitialize}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Initialize Defaults
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {configs.map((config) => (
              <tr key={config._id}>
                <td className="px-6 py-4 whitespace-nowrap font-mono">{config.key}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingKey === config.key ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="border rounded px-2 py-1 w-32"
                    />
                  ) : (
                    <span className="font-semibold">{config.value}</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{config.description}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingKey === config.key ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSave(config.key)}
                        className="text-green-600 hover:text-green-800"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingKey(null)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEdit(config)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Settings;
```

---

## 🚀 Main App & Router

```javascript
// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Orders from './pages/Orders';
import Topups from './pages/Topups';
import Products from './pages/Products';
import Chat from './pages/Chat';
import Settings from './pages/Settings';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/users" element={<PrivateRoute><Users /></PrivateRoute>} />
          <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
          <Route path="/topups" element={<PrivateRoute><Topups /></PrivateRoute>} />
          <Route path="/products" element={<PrivateRoute><Products /></PrivateRoute>} />
          <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
```

```javascript
// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2">SL Gaming</h1>
        <p className="text-gray-600 text-center mb-8">Admin Dashboard</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
```

---

## 🎨 Additional Features

### Constants

```javascript
// src/utils/constants.js
export const API_URL = 'http://localhost:3000/api';
export const SOCKET_URL = 'http://localhost:3000';

export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  CONFIRMING: 'confirming',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

export const TOPUP_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};
```

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

---

## 📝 Environment Variables

Create `.env` file:

```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

Update `api.js`:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
```

---

## ✅ Features Included

- ✅ JWT Authentication with auto-logout
- ✅ Real-time Socket.io connection for admin
- ✅ Dashboard with statistics and charts
- ✅ User management (ban, unban, role change, balance update)
- ✅ Order tracking and status checking (auto-updates via cron)
- ✅ Order status filters: pending, processing, confirming, completed, failed, refunded
- ✅ Topup approval system with screenshots
- ✅ Product sync from 24payseller API
- ✅ System configuration management (exchange rates, markup)
- ✅ Real-time chat with Socket.io
- ✅ Chat status management (open/closed)
- ✅ Unread message counts
- ✅ Responsive design with Tailwind CSS
- ✅ Loading states and error handling
- ✅ Date formatting with date-fns
- ✅ Charts with Recharts
- ✅ Icons with Lucide React

---

## 🔔 Real-time Features

### Order Status Updates
- Cron job checks pending orders every minute
- Socket.io emits `orderStatusUpdate` event when status changes
- Admin dashboard receives real-time order updates

### Chat Notifications
- Socket.io emits `new_message` event for new chat messages
- Admin receives real-time notifications with unread counts
- Chat list updates automatically when new messages arrive

### Socket Events

**Client → Server:**
- `join_admin_room` - Join admin room for broadcasts
- `join_chat` - Join specific chat room
- `send_message` - Send message to user

**Server → Client:**
- `orderStatusUpdate` - Order status changed
  ```javascript
  {
    orderId: string,
    status: string,
    transactionId: string
  }
  ```
- `new_message` - New chat message received
  ```javascript
  {
    chatId: string,
    message: object,
    unreadCount: number
  }
  ```

---

## 🔧 Next Steps

1. ✅ Chat interface with Socket.io (Completed)
2. ✅ Real-time notifications (Completed)
3. Add export to Excel functionality
4. Add date range filters for orders/topups
5. Add pagination for large datasets
6. Add profile management
7. Add dark mode toggle
8. Add file upload progress indicators
9. Add advanced search filters
10. Add activity logs and audit trail

---

## 🌐 API Endpoints Reference

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/profile` - Get current user profile

### Dashboard & Statistics
- `GET /api/stats/dashboard` - Dashboard overview stats
- `GET /api/stats/yearly` - Monthly revenue data

### Users
- `GET /api/users` - Get all users
- `PATCH /api/users/:id/ban` - Ban user
- `PATCH /api/users/:id/unban` - Unban user
- `PATCH /api/users/:id/role` - Change user role
- `PATCH /api/users/:id/balance` - Update user balance
- `PATCH /api/users/:id/reset-password` - Reset user password

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order details
- `GET /api/orders/:id/check-status` - Check order status with 24payseller
- `PATCH /api/orders/:id/status` - Update order status

### Topups
- `GET /api/topups` - Get all topups
- `GET /api/topups/status/:status` - Get topups by status
- `PATCH /api/topups/:id/approve` - Approve topup request
- `PATCH /api/topups/:id/reject` - Reject topup request

### Products
- `GET /api/products` - Get all products
- `POST /api/products/sync` - Sync products from 24payseller

### System Config
- `GET /api/system-config` - Get all configurations
- `POST /api/system-config/init` - Initialize default configs
- `PUT /api/system-config/:key` - Update specific config

### Chats
- `GET /api/chats/all` - Get all chats (admin)
- `GET /api/chats/:id` - Get chat with messages
- `POST /api/chats/:id/messages` - Send message
- `PATCH /api/chats/:id/read` - Mark chat as read
- `PATCH /api/chats/:id/close` - Close chat
- `PATCH /api/chats/:id/reopen` - Reopen chat

