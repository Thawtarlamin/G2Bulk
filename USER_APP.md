# User App - React + Vite + Tailwind CSS

## 🎯 Project Setup

```bash
npm create vite@latest user-app -- --template react
cd user-app
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install axios react-router-dom socket.io-client date-fns
npm install lucide-react react-hot-toast
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
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
    },
  },
  plugins: [],
}
```

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .btn-primary {
    @apply bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors font-medium;
  }
  
  .btn-secondary {
    @apply bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-md p-6;
  }
  
  .input {
    @apply w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent;
  }
}
```

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Layout/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   └── Layout.jsx
│   ├── Home/
│   │   ├── Hero.jsx
│   │   ├── GameCard.jsx
│   │   └── Features.jsx
│   ├── Products/
│   │   ├── ProductCard.jsx
│   │   ├── ProductFilter.jsx
│   │   └── ItemSelector.jsx
│   ├── Order/
│   │   ├── OrderForm.jsx
│   │   ├── OrderSummary.jsx
│   │   └── PaymentInfo.jsx
│   ├── Profile/
│   │   ├── UserInfo.jsx
│   │   ├── BalanceCard.jsx
│   │   └── OrderHistory.jsx
│   ├── Topup/
│   │   ├── TopupForm.jsx
│   │   ├── TopupHistory.jsx
│   │   └── PaymentMethodCard.jsx
│   └── Chat/
│       ├── ChatButton.jsx
│       ├── ChatWindow.jsx
│       └── MessageBubble.jsx
├── pages/
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Products.jsx
│   ├── ProductDetail.jsx
│   ├── Order.jsx
│   ├── OrderSuccess.jsx
│   ├── Profile.jsx
│   ├── Topup.jsx
│   └── NotFound.jsx
├── utils/
│   ├── api.js
│   ├── socket.js
│   └── constants.js
├── context/
│   ├── AuthContext.jsx
│   └── CartContext.jsx
├── hooks/
│   ├── useAuth.js
│   └── useSocket.js
├── App.jsx
└── main.jsx
```

---

## 🔐 Authentication Setup

### API Client

```javascript
// src/utils/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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
import toast from 'react-hot-toast';

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
        setUser(data);
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  };

  const register = async (userData) => {
    try {
      const { data } = await api.post('/auth/register', userData);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      toast.success('Account created successfully!');
      return data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      setUser(data.user);
      toast.success('Login successful!');
      return data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateProfile = async (profileData) => {
    try {
      const { data } = await api.put('/auth/profile', profileData);
      setUser(data);
      toast.success('Profile updated successfully!');
      return data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      register, 
      login, 
      logout, 
      updateProfile,
      refreshUser: checkAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### Socket.io Setup

```javascript
// src/utils/socket.js
import { io } from 'socket.io-client';

let socket = null;

export const initSocket = (userId) => {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000', {
      auth: { token: localStorage.getItem('token') },
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('Socket connected');
      if (userId) {
        socket.emit('join_user_room', userId);
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
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

export const joinUserRoom = (userId) => {
  if (socket && userId) {
    socket.emit('join_user_room', userId);
  }
};
```

---

## 🎨 Layout Components

### Navbar

```javascript
// src/components/Layout/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { User, ShoppingCart, LogOut, Wallet, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">SL</span>
            </div>
            <span className="text-xl font-bold text-gray-800">Gaming Shop</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary-500 transition">
              Home
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-primary-500 transition">
              Products
            </Link>
            {user && (
              <>
                <Link to="/topup" className="text-gray-700 hover:text-primary-500 transition">
                  Top Up
                </Link>
                <Link to="/profile" className="text-gray-700 hover:text-primary-500 transition">
                  Orders
                </Link>
              </>
            )}
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-primary-50 rounded-lg">
                  <Wallet className="w-5 h-5 text-primary-600" />
                  <span className="font-semibold text-primary-700">
                    {user.balance?.toLocaleString()} MMK
                  </span>
                </div>
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <User className="w-5 h-5" />
                  <span className="hidden md:inline">{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {user && (
          <div className="md:hidden flex items-center justify-around py-3 border-t">
            <Link to="/" className="flex flex-col items-center text-gray-600 hover:text-primary-500">
              <ShoppingCart className="w-5 h-5" />
              <span className="text-xs mt-1">Shop</span>
            </Link>
            <Link to="/topup" className="flex flex-col items-center text-gray-600 hover:text-primary-500">
              <Wallet className="w-5 h-5" />
              <span className="text-xs mt-1">Top Up</span>
            </Link>
            <Link to="/profile" className="flex flex-col items-center text-gray-600 hover:text-primary-500">
              <User className="w-5 h-5" />
              <span className="text-xs mt-1">Profile</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
```

### Footer

```javascript
// src/components/Layout/Footer.jsx
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4">SL Gaming Shop</h3>
            <p className="text-gray-400">
              Your trusted source for game top-ups and digital gaming products.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/products" className="text-gray-400 hover:text-white transition">Products</a></li>
              <li><a href="/topup" className="text-gray-400 hover:text-white transition">Top Up</a></li>
              <li><a href="/profile" className="text-gray-400 hover:text-white transition">My Orders</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition">How to Order</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Payment Methods</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">FAQ</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Contact Us</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Email: support@slgaming.com</li>
              <li>Phone: +95 9 123 456 789</li>
              <li>Hours: 9 AM - 9 PM</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 SL Gaming Shop. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
```

### Main Layout

```javascript
// src/components/Layout/Layout.jsx
import Navbar from './Navbar';
import Footer from './Footer';
import ChatButton from '../Chat/ChatButton';
import { Toaster } from 'react-hot-toast';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <ChatButton />
      <Toaster position="top-right" />
    </div>
  );
};

export default Layout;
```

---

## 🏠 Home Page

```javascript
// src/pages/Home.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Zap, Shield, Clock } from 'lucide-react';
import api from '../utils/api';

const Home = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products?status=active');
      setProducts(data.slice(0, 6)); // Show first 6 products
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Welcome to SL Gaming Shop
            </h1>
            <p className="text-xl mb-8 text-primary-100">
              Fast, secure, and reliable game top-ups for all your favorite games
            </p>
            <Link to="/products" className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-50 transition inline-block">
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Instant Delivery</h3>
              <p className="text-gray-600">Get your items within minutes</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Secure Payment</h3>
              <p className="text-gray-600">Safe and encrypted transactions</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">24/7 Support</h3>
              <p className="text-gray-600">Always here to help you</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gamepad2 className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">All Games</h3>
              <p className="text-gray-600">Support for popular games</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Games</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <Link
                key={product._id}
                to={`/products/${product._id}`}
                className="card hover:shadow-xl transition-shadow cursor-pointer"
              >
                {product.game_image && (
                  <img
                    src={`http://localhost:3000${product.game_image}`}
                    alt={product.game}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <h3 className="text-xl font-bold mb-2">{product.game}</h3>
                <p className="text-gray-600 mb-4">
                  {product.items?.length || 0} items available
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Starting from
                  </span>
                  <span className="text-primary-600 font-bold">
                    {Math.min(...(product.items?.map(i => i.price_mmk) || [0])).toLocaleString()} MMK
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/products" className="btn-primary">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">Choose Your Game</h3>
              <p className="text-gray-600">Select from our wide range of supported games</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">Enter Game ID</h3>
              <p className="text-gray-600">Provide your game account details</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">Get Your Items</h3>
              <p className="text-gray-600">Receive items instantly in your account</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
```

---

## 🎮 Products Page

```javascript
// src/pages/Products.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import api from '../utils/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products?status=active');
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.game.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">All Products</h1>

      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search games..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <Link
            key={product._id}
            to={`/products/${product._id}`}
            className="card hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            {product.game_image ? (
              <img
                src={`http://localhost:3000${product.game_image}`}
                alt={product.game}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            ) : (
              <div className="w-full h-48 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-white text-4xl font-bold">
                  {product.game.charAt(0)}
                </span>
              </div>
            )}
            <h3 className="text-xl font-bold mb-2">{product.game}</h3>
            <p className="text-gray-600 text-sm mb-4">
              {product.items?.length || 0} items available
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Starting from</span>
              <span className="text-primary-600 font-bold">
                {Math.min(...(product.items?.map(i => i.price_mmk) || [0])).toLocaleString()} MMK
              </span>
            </div>
          </Link>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No products found</p>
        </div>
      )}
    </div>
  );
};

export default Products;
```

---

## 📦 Product Detail Page

```javascript
// src/pages/ProductDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [gameId, setGameId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data } = await api.get(`/products/${id}`);
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = () => {
    if (!user) {
      toast.error('Please login to continue');
      navigate('/login');
      return;
    }

    if (!selectedItem) {
      toast.error('Please select an item');
      return;
    }

    if (!gameId.trim()) {
      toast.error('Please enter your game ID');
      return;
    }

    // Navigate to order page with data
    navigate('/order', {
      state: {
        product: product,
        item: selectedItem,
        gameId: gameId
      }
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-gray-500">Product not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image */}
        <div>
          {product.game_image ? (
            <img
              src={`http://localhost:3000${product.game_image}`}
              alt={product.game}
              className="w-full rounded-lg shadow-lg"
            />
          ) : (
            <div className="w-full h-96 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-6xl font-bold">
                {product.game.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-4xl font-bold mb-4">{product.game}</h1>
          <p className="text-gray-600 mb-8">
            Choose your desired amount and enter your game ID to get instant top-up
          </p>

          {/* Game ID Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Game ID / User ID
            </label>
            <input
              type="text"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              placeholder="Enter your game ID"
              className="input"
            />
            <p className="text-xs text-gray-500 mt-1">
              Make sure your game ID is correct
            </p>
          </div>

          {/* Item Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Package
            </label>
            <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {product.items?.map((item, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedItem(item)}
                  className={`p-4 border-2 rounded-lg text-left transition ${
                    selectedItem?.sku === item.sku
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300'
                  }`}
                >
                  <div className="font-semibold mb-2">{item.name}</div>
                  <div className="text-primary-600 font-bold">
                    {item.price_mmk.toLocaleString()} MMK
                  </div>
                  {item.markup_percentage && (
                    <div className="text-xs text-gray-500 mt-1">
                      +{item.markup_percentage}% markup
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          {selectedItem && (
            <div className="card bg-gray-50 mb-6">
              <h3 className="font-semibold mb-3">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Item:</span>
                  <span className="font-medium">{selectedItem.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Game ID:</span>
                  <span className="font-medium">{gameId || '-'}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                  <span>Total:</span>
                  <span className="text-primary-600">
                    {selectedItem.price_mmk.toLocaleString()} MMK
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Order Button */}
          <button
            onClick={handleOrder}
            disabled={!selectedItem || !gameId}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Order Now</span>
          </button>

          {/* Balance Info */}
          {user && (
            <div className="mt-4 text-center">
              <span className="text-sm text-gray-600">Your balance: </span>
              <span className="text-sm font-semibold text-primary-600">
                {user.balance?.toLocaleString()} MMK
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
```

---

## 🛒 Order Page

```javascript
// src/pages/Order.jsx
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Order = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const { product, item, gameId } = location.state || {};

  if (!product || !item || !gameId) {
    navigate('/products');
    return null;
  }

  const handleConfirmOrder = async () => {
    if (user.balance < item.price_mmk) {
      toast.error('Insufficient balance. Please top up first.');
      navigate('/topup');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/orders', {
        product_key: product.key,
        item_sku: item.sku,
        input: gameId,
        amount: item.price_mmk
      });

      toast.success('Order placed successfully!');
      await refreshUser(); // Refresh user balance
      navigate('/order-success', { state: { order: data } });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Order failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

      <h1 className="text-3xl font-bold mb-8">Confirm Order</h1>

      {/* Order Details */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">Order Details</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Game:</span>
            <span className="font-medium">{product.game}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Package:</span>
            <span className="font-medium">{item.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Game ID:</span>
            <span className="font-medium font-mono">{gameId}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-3 mt-3">
            <span>Total Amount:</span>
            <span className="text-primary-600">
              {item.price_mmk.toLocaleString()} MMK
            </span>
          </div>
        </div>
      </div>

      {/* Balance Info */}
      <div className="card mb-6 bg-gray-50">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Your Current Balance:</span>
          <span className="text-2xl font-bold text-primary-600">
            {user.balance?.toLocaleString()} MMK
          </span>
        </div>
        {user.balance < item.price_mmk && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">
              ⚠️ Insufficient balance. Please top up your account first.
            </p>
          </div>
        )}
      </div>

      {/* Confirm Button */}
      <button
        onClick={handleConfirmOrder}
        disabled={loading || user.balance < item.price_mmk}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : 'Confirm Order'}
      </button>

      {/* Important Notice */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Important:</strong> Please make sure your game ID is correct. 
          We are not responsible for wrong game IDs entered by users.
        </p>
      </div>
    </div>
  );
};

export default Order;
```

---

## ✅ Order Success Page

```javascript
// src/pages/OrderSuccess.jsx
import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Home, User } from 'lucide-react';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { order } = location.state || {};

  useEffect(() => {
    if (!order) {
      navigate('/products');
    }
  }, [order, navigate]);

  if (!order) return null;

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Order Placed Successfully!
        </h1>
        <p className="text-gray-600">
          Your order is being processed
        </p>
      </div>

      {/* Order Info */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">Order Information</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Order ID:</span>
            <span className="font-mono font-medium">{order._id?.slice(-8)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Product:</span>
            <span className="font-medium">{order.product_key}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Game ID:</span>
            <span className="font-mono font-medium">{order.input}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Status:</span>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
              {order.status}
            </span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-3 mt-3">
            <span>Amount Paid:</span>
            <span className="text-primary-600">
              {order.amount?.toLocaleString()} MMK
            </span>
          </div>
        </div>
      </div>

      {/* Status Info */}
      <div className="card mb-6 bg-blue-50 border border-blue-200">
        <p className="text-blue-800 text-sm">
          ℹ️ Your order will be processed automatically. 
          You will receive your items within a few minutes.
          You can track your order status in your profile.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Link to="/" className="btn-secondary flex items-center justify-center space-x-2">
          <Home className="w-5 h-5" />
          <span>Back to Home</span>
        </Link>
        <Link to="/profile" className="btn-primary flex items-center justify-center space-x-2">
          <User className="w-5 h-5" />
          <span>View Orders</span>
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
```

---

_Continued in next message..._
