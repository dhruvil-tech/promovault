const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// @route POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (await User.findOne({ email }))
      return res.status(400).json({ success: false, message: 'Email already registered' });

    // Only allow customer/manager self-registration; admin created manually
    const allowedRoles = ['customer', 'manager'];
    const assignedRole = allowedRoles.includes(role) ? role : 'customer';

    const user = await User.create({ name, email, password, role: assignedRole });
    res.status(201).json({ success: true, token: signToken(user._id), user: sanitize(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    if (!user.isActive)
      return res.status(403).json({ success: false, message: 'Account deactivated' });

    res.json({ success: true, token: signToken(user._id), user: sanitize(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({ success: true, user: sanitize(req.user) });
};

const sanitize = (u) => ({
  _id: u._id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt
});
