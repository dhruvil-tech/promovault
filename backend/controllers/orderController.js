const Order  = require('../models/Order');
const Coupon = require('../models/Coupon');

// @route POST /api/orders  (customer)
exports.createOrder = async (req, res) => {
  try {
    const { items, couponCode } = req.body;
    const subtotal = items.reduce((s, i) => s + i.price * (i.qty || 1), 0);
    let discount = 0, couponDoc = null;

    if (couponCode) {
      couponDoc = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (!couponDoc || !couponDoc.isActive || couponDoc.isExpired || couponDoc.isExhausted)
        return res.status(400).json({ success: false, message: 'Invalid or expired coupon' });
      if (subtotal < couponDoc.minOrder)
        return res.status(400).json({ success: false, message: `Min order ₹${couponDoc.minOrder}` });

      discount = couponDoc.type === 'percent'
        ? Math.round(subtotal * couponDoc.value / 100)
        : couponDoc.value;

      couponDoc.usedCount += 1;
      await couponDoc.save();
    }

    const order = await Order.create({
      user: req.user._id, items, subtotal,
      coupon: couponDoc?._id || null,
      couponCode: couponDoc?.code || null,
      discount, total: subtotal - discount
    });

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/orders/my  (customer)
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('coupon', 'code type value')
      .sort('-createdAt');
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/orders  (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('coupon', 'code type value')
      .sort('-createdAt');
    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
