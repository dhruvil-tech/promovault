const Coupon = require('../models/Coupon');

// @route GET /api/coupons  (admin/manager: all | customer: active only)
exports.getCoupons = async (req, res) => {
  try {
    const filter = req.user.role === 'customer'
      ? { isActive: true, expiryDate: { $gte: new Date() } }
      : {};
    const coupons = await Coupon.find(filter).populate('createdBy', 'name email').sort('-createdAt');
    res.json({ success: true, count: coupons.length, data: coupons });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/coupons/:id
exports.getCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id).populate('createdBy', 'name email');
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.json({ success: true, data: coupon });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/coupons  (manager/admin)
exports.createCoupon = async (req, res) => {
  try {
    const { code, description, type, value, minOrder, usageLimit, expiryDate } = req.body;
    if (await Coupon.findOne({ code: code.toUpperCase() }))
      return res.status(400).json({ success: false, message: 'Coupon code already exists' });

    const coupon = await Coupon.create({
      code, description, type, value, minOrder, usageLimit, expiryDate,
      createdBy: req.user._id
    });
    res.status(201).json({ success: true, data: coupon });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route PUT /api/coupons/:id  (manager/admin)
exports.updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.json({ success: true, data: coupon });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route DELETE /api/coupons/:id  (admin only)
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/coupons/validate  (customer)
exports.validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon)        return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    if (!coupon.isActive) return res.status(400).json({ success: false, message: 'Coupon is inactive' });
    if (coupon.isExpired) return res.status(400).json({ success: false, message: 'Coupon has expired' });
    if (coupon.isExhausted) return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    if (orderAmount < coupon.minOrder)
      return res.status(400).json({ success: false, message: `Minimum order amount is ₹${coupon.minOrder}` });

    const discount = coupon.type === 'percent'
      ? Math.round(orderAmount * coupon.value / 100)
      : coupon.value;

    res.json({ success: true, data: { coupon, discount, finalAmount: orderAmount - discount } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route PATCH /api/coupons/:id/toggle  (manager/admin)
exports.toggleCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    coupon.isActive = !coupon.isActive;
    await coupon.save();
    res.json({ success: true, data: coupon });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
