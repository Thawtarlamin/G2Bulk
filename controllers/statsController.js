const Order = require('../models/Order');
const Topup = require('../models/Topup');
const User = require('../models/User');

// @desc    Get dashboard statistics
// @route   GET /api/stats/dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    // Total users
    const totalUsers = await User.countDocuments();
    
    // Total orders
    const totalOrders = await Order.countDocuments();
    const successOrders = await Order.countDocuments({ status: 'completed' });
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    
    // Total revenue from orders (all time)
    const orderRevenue = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // Total topups
    const totalTopups = await Topup.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Calculate profit (topups - orders)
    const totalRevenue = orderRevenue[0]?.total || 0;
    const totalTopupAmount = totalTopups[0]?.total || 0;
    const totalProfit = totalTopupAmount - totalRevenue;

    res.json({
      users: {
        total: totalUsers
      },
      orders: {
        total: totalOrders,
        success: successOrders,
        pending: pendingOrders
      },
      revenue: {
        total: totalRevenue,
        topups: totalTopupAmount,
        profit: totalProfit
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get monthly statistics
// @route   GET /api/stats/monthly
exports.getMonthlyStats = async (req, res) => {
  try {
    const { year, month } = req.query;
    
    // Default to current month if not provided
    const currentDate = new Date();
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();
    const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    
    // Create date range for the month
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    // Monthly orders revenue
    const monthlyOrders = await Order.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Monthly topups
    const monthlyTopups = await Topup.aggregate([
      {
        $match: {
          status: 'approved',
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const revenue = monthlyOrders[0]?.totalRevenue || 0;
    const topupAmount = monthlyTopups[0]?.totalAmount || 0;
    const profit = topupAmount - revenue;

    res.json({
      period: {
        year: targetYear,
        month: targetMonth,
        monthName: new Date(targetYear, targetMonth - 1).toLocaleString('default', { month: 'long' })
      },
      orders: {
        count: monthlyOrders[0]?.count || 0,
        revenue: revenue
      },
      topups: {
        count: monthlyTopups[0]?.count || 0,
        amount: topupAmount
      },
      profit: profit
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get monthly breakdown for the year
// @route   GET /api/stats/yearly
exports.getYearlyStats = async (req, res) => {
  try {
    const { year } = req.query;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();

    // Get orders by month
    const ordersbyMonth = await Order.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: {
            $gte: new Date(targetYear, 0, 1),
            $lte: new Date(targetYear, 11, 31, 23, 59, 59)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get topups by month
    const topupsByMonth = await Topup.aggregate([
      {
        $match: {
          status: 'approved',
          createdAt: {
            $gte: new Date(targetYear, 0, 1),
            $lte: new Date(targetYear, 11, 31, 23, 59, 59)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Create monthly breakdown
    const monthlyBreakdown = [];
    for (let month = 1; month <= 12; month++) {
      const orderData = ordersbyMonth.find(o => o._id === month);
      const topupData = topupsByMonth.find(t => t._id === month);
      
      const revenue = orderData?.revenue || 0;
      const topupAmount = topupData?.amount || 0;
      
      monthlyBreakdown.push({
        month: month,
        monthName: new Date(targetYear, month - 1).toLocaleString('default', { month: 'short' }),
        orders: {
          count: orderData?.count || 0,
          revenue: revenue
        },
        topups: {
          count: topupData?.count || 0,
          amount: topupAmount
        },
        profit: topupAmount - revenue
      });
    }

    // Calculate yearly totals
    const yearlyTotals = monthlyBreakdown.reduce((acc, month) => ({
      orders: acc.orders + month.orders.count,
      revenue: acc.revenue + month.orders.revenue,
      topups: acc.topups + month.topups.count,
      topupAmount: acc.topupAmount + month.topups.amount,
      profit: acc.profit + month.profit
    }), { orders: 0, revenue: 0, topups: 0, topupAmount: 0, profit: 0 });

    res.json({
      year: targetYear,
      monthly: monthlyBreakdown,
      totals: yearlyTotals
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get top products by revenue
// @route   GET /api/stats/top-products
exports.getTopProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topProducts = await Order.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$product_code',
          totalRevenue: { $sum: '$amount' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: parseInt(limit) }
    ]);

    res.json(topProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get recent activities with pagination
// @route   GET /api/stats/recent-activities
exports.getRecentActivities = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Recent orders with pagination
    const ordersTotal = await Order.countDocuments();
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    // Recent topups with pagination
    const topupsTotal = await Topup.countDocuments();
    const recentTopups = await Topup.find()
      .populate('user', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    res.json({
      orders: {
        data: recentOrders,
        pagination: {
          total: ordersTotal,
          page: page,
          limit: limit,
          pages: Math.ceil(ordersTotal / limit)
        }
      },
      topups: {
        data: recentTopups,
        pagination: {
          total: topupsTotal,
          page: page,
          limit: limit,
          pages: Math.ceil(topupsTotal / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
