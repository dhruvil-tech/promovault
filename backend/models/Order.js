const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  name:  { type: String, required: true },
  price: { type: Number, required: true },
  qty:   { type: Number, default: 1 },
});

const OrderSchema = new mongoose.Schema({
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items:      [OrderItemSchema],
  subtotal:   { type: Number, required: true },
  coupon:     { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', default: null },
  couponCode: { type: String, default: null },
  discount:   { type: Number, default: 0 },
  total:      { type: Number, required: true },
  status:     { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'confirmed' },
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
