const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const { placeOrder, getOrderStatus: getG2BulkOrderStatus } = require('../utils/g2bulk');

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
    res.json(orders.reverse());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new order
// @route   POST /api/orders
exports.createOrder = async (req, res) => {
  try {
    const { product_code, catalogue_name, player_id, server_id, remark } = req.body;

    // Get user from authenticated request
    const user = req.user._id;
    const userExists = await User.findById(user);
    
    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find product and catalogue to get price
    const product = await Product.findOne({ 'game.code': product_code });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const catalogue = product.catalogues.find(c => c.name === catalogue_name);
    if (!catalogue) {
      return res.status(404).json({ message: 'Catalogue not found in product' });
    }

    const orderAmount = catalogue.amount;

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
    console.log('Creating order with G2Bulk:', {
      game: product_code,
      catalogue_name,
      player_id,
      server_id
    });

    // Create order with G2Bulk
    const g2bulkResponse = await placeOrder(product_code, {
      catalogue_name,
      player_id,
      server_id,
      remark: remark || `Order by ${userExists.email}`,
      callback_url: process.env.G2BULK_CALLBACK_URL || ''
    });
    
    console.log('G2Bulk response:', g2bulkResponse);
    
    const { order: g2bulkOrder } = g2bulkResponse;

    // Save order to database
    const order = await Order.create({
      user,
      product_code,
      catalogue_name,
      remark: remark || `Order by ${userExists.email}`,
      input: { player_id, server_id },
      amount: orderAmount,
      external_id: g2bulkOrder.order_id.toString(),
      status: g2bulkOrder.status.toLowerCase() // PENDING, PROCESSING, COMPLETED, FAILED
    });

    const populatedOrder = await Order.findById(order._id).populate('user', 'name email');
    
    res.status(201).json({
      ...populatedOrder.toObject(),
      g2bulk_response: g2bulkResponse
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
      if (user && req.body.product_code && req.body.catalogue_name) {
        const product = await Product.findOne({ 'game.code': req.body.product_code });
        if (product) {
          const catalogue = product.catalogues.find(c => c.name === req.body.catalogue_name);
          if (catalogue) {
            user.balance += catalogue.amount;
            await user.save();
            console.log(`Refunded ${catalogue.amount} MMK to user ${user.email}`);
          }
        }
      }
    }

    if (error.response) {
      console.error('G2Bulk API error response:', error.response);
      return res.status(error.status || 500).json({ 
        message: 'Failed to create order with G2Bulk',
        error: error.response
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

// @desc    Check order status from G2Bulk
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

    // Get order status from G2Bulk
    const statusResponse = await getG2BulkOrderStatus({
      order_id: parseInt(order.external_id),
      game: order.product_code
    });

    console.log('G2Bulk status check:', statusResponse);

    // Update local order status if different
    const externalStatus = statusResponse.status ? statusResponse.status.toLowerCase() : null;
    
    if (externalStatus && order.status !== externalStatus) {
      order.status = externalStatus;
      await order.save();
      console.log(`Order ${order._id} status updated to ${externalStatus}`);
    }

    const populatedOrder = await Order.findById(order._id).populate('user', 'name email');

    res.json({
      order: populatedOrder,
      external_status: statusResponse
    });
  } catch (error) {
    if (error.response) {
      return res.status(error.status || 500).json({ 
        message: 'Failed to check order status',
        error: error.response
      });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Handle G2Bulk callback webhook
// @route   POST /api/orders/callback
exports.handleCallback = async (req, res) => {
  try {
    console.log('G2Bulk callback received:', req.body);

    const { order_id, status, game, message } = req.body;

    if (!order_id) {
      return res.status(400).json({ message: 'Missing order_id in callback' });
    }

    // Find order by external_id
    const order = await Order.findOne({ external_id: order_id.toString() });

    if (!order) {
      console.log(`Order not found for external_id: ${order_id}`);
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update order status
    const oldStatus = order.status;
    const newStatus = status ? status.toLowerCase() : oldStatus;

    if (oldStatus !== newStatus) {
      order.status = newStatus;
      
      // Add callback message to remark if exists
      if (message) {
        order.remark = order.remark ? `${order.remark}\nCallback: ${message}` : `Callback: ${message}`;
      }

      await order.save();
      
      console.log(`Order ${order._id} status updated: ${oldStatus} -> ${newStatus}`);

      // If order completed, emit socket event (if socket.io is set up)
      if (newStatus === 'completed' && global.io) {
        global.io.to(order.user.toString()).emit('order_completed', {
          order_id: order._id,
          external_id: order.external_id,
          status: newStatus
        });
      }
    }

    res.status(200).json({ 
      success: true, 
      message: 'Callback processed successfully',
      order_id: order._id
    });

  } catch (error) {
    console.error('Callback error:', error);
    res.status(500).json({ message: error.message });
  }
};
