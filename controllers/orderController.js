const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const axios = require('axios');

const PAYSELLER_API_KEY = process.env.PAYSELLER_API_KEY || '081647fc48d0fcf06588665c01989944';
const PAYSELLER_BASE_URL = 'https://x.24payseller.com';

// @desc    Get all orders
// @route   GET /api/orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get orders by user
// @route   GET /api/orders/user/:userId
exports.getOrdersByUser = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.userId }).populate('user', 'name email');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new order
// @route   POST /api/orders
exports.createOrder = async (req, res) => {
  try {
    const { product_key, item_sku, input } = req.body;

    // Get user from authenticated request
    const user = req.user._id;
    const userExists = await User.findById(user);
    
    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find product and item to get price
    const product = await Product.findOne({ key: product_key });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const item = product.items.find(i => i.sku === item_sku);
    if (!item) {
      return res.status(404).json({ message: 'Item not found in product' });
    }

    const orderAmount = item.price_mmk;

    // Check if user has sufficient balance
    if (userExists.balance < orderAmount) {
      return res.status(400).json({ 
        message: 'Insufficient balance',
        required: orderAmount,
        current: userExists.balance,
        shortage: orderAmount - userExists.balance
      });
    }

    // Deduct balance from user
    userExists.balance -= orderAmount;
    await userExists.save();

    // Log request details for debugging
    console.log('Creating order with 24payseller:', {
      url: `${PAYSELLER_BASE_URL}/agent/orders/create`,
      product_key,
      item_sku,
      input,
      apiKey: PAYSELLER_API_KEY ? 'Present' : 'Missing'
    });

    // Create order in 24payseller (no webhook needed - they return response directly)
    const paysellerResponse = await axios.post(
      `${PAYSELLER_BASE_URL}/agent/orders/create`,
      {
        product_key,
        item_sku,
        input
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': PAYSELLER_API_KEY
        }
      }
    );
    
    console.log('24payseller response:', paysellerResponse.data);
    
    const { order: paysellerOrder } = paysellerResponse.data;

    // Save order to database
    const order = await Order.create({
      user,
      product_key,
      item_sku,
      input,
      amount: orderAmount,
      external_id: paysellerOrder.transactionId,
      status: paysellerOrder.state // pending, completed, failed
    });

    const populatedOrder = await Order.findById(order._id).populate('user', 'name email');
    
    res.status(201).json({
      ...populatedOrder.toObject(),
      payseller_response: paysellerResponse.data
    });
  } catch (error) {
    // Log detailed error information
    console.error('Order creation error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data
      }
    });

    // Refund balance if order creation failed
    if (error.response && req.user) {
      const user = await User.findById(req.user._id);
      if (user && req.body.product_key) {
        const product = await Product.findOne({ key: req.body.product_key });
        if (product) {
          const item = product.items.find(i => i.sku === req.body.item_sku);
          if (item) {
            user.balance += item.price_mmk;
            await user.save();
            console.log(`Refunded ${item.price_mmk} MMK to user ${user.email}`);
          }
        }
      }
    }

    if (error.response) {
      console.error('24payseller API error response:', error.response.data);
      return res.status(error.response.status).json({ 
        message: 'Failed to create order with payment provider',
        error: error.response.data,
        details: {
          status: error.response.status,
          statusText: error.response.statusText
        }
      });
    }
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update order
// @route   PUT /api/orders/:id
exports.updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('user', 'name email');

    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    const updatedOrder = await Order.findById(order._id).populate('user', 'name email');
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check order status from 24payseller
// @route   GET /api/orders/:id/check-status
exports.checkOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!order.external_id) {
      return res.status(400).json({ message: 'Order has no external transaction ID' });
    }

    // Get order status from 24payseller
    const statusResponse = await axios.get(
      `${PAYSELLER_BASE_URL}/agent/orders/${order.external_id}`,
      {
        headers: {
          'X-Api-Key': PAYSELLER_API_KEY
        }
      }
    );

    console.log('24payseller status check:', statusResponse.data);

    // Update local order status if different
    const externalOrder = statusResponse.data.order || statusResponse.data;
    const externalStatus = externalOrder.state || externalOrder.status;
    
    if (externalStatus && order.status !== externalStatus) {
      order.status = externalStatus;
      await order.save();
      console.log(`Order ${order._id} status updated from ${order.status} to ${externalStatus}`);
    }

    const populatedOrder = await Order.findById(order._id).populate('user', 'name email');

    res.json({
      order: populatedOrder,
      external_status: statusResponse.data
    });
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json({ 
        message: 'Failed to check order status',
        error: error.response.data 
      });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Webhook callback for order updates
// @route   POST /api/orders/callback
exports.orderCallback = async (req, res) => {
  try {
    console.log('Webhook callback received:', req.body);
    
    const { transactionId, state, status, message } = req.body;
    const orderStatus = state || status;

    // Find order by external_id
    const order = await Order.findOne({ external_id: transactionId });
    
    if (!order) {
      console.log(`Order not found for transactionId: ${transactionId}`);
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update order status
    const oldStatus = order.status;
    order.status = orderStatus || order.status;
    await order.save();

    console.log(`Order ${order._id} updated via webhook. Status: ${oldStatus} -> ${orderStatus}`);

    res.json({ 
      success: true,
      message: 'Order updated successfully',
      orderId: order._id
    });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ message: error.message });
  }
};
