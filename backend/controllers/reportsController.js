const Order  = require('../models/Order');
const Coupon = require('../models/Coupon');
const User   = require('../models/User');

// @route GET /api/reports/summary  (admin/manager)
exports.getSummary = async (req, res) => {
  try {
    const [totalUsers, totalCoupons, totalOrders, ordersAgg] = await Promise.all([
      User.countDocuments(),
      Coupon.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([{ $group: { _id: null, totalRevenue: { $sum: '$total' }, totalDiscount: { $sum: '$discount' } } }])
    ]);
    const { totalRevenue = 0, totalDiscount = 0 } = ordersAgg[0] || {};
    res.json({ success: true, data: { totalUsers, totalCoupons, totalOrders, totalRevenue, totalDiscount } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/reports/coupon-performance  (manager/admin)
exports.getCouponPerformance = async (req, res) => {
  try {
    const coupons = await Coupon.find().populate('createdBy', 'name');
    const performance = coupons.map(c => ({
      _id: c._id, code: c.code, type: c.type, value: c.value,
      usedCount: c.usedCount, usageLimit: c.usageLimit,
      usageRate: Math.round((c.usedCount / c.usageLimit) * 100),
      isActive: c.isActive, isExpired: c.isExpired,
      expiryDate: c.expiryDate, createdBy: c.createdBy
    }));
    res.json({ success: true, data: performance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/reports/monthly  (admin/manager)
exports.getMonthlyReport = async (req, res) => {
  try {
    const data = await Order.aggregate([
      { $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          orders: { $sum: 1 }, revenue: { $sum: '$total' }, discounts: { $sum: '$discount' }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
