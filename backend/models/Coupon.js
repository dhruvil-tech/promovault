const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
  code:        { type: String, required: true, unique: true, uppercase: true, trim: true },
  description: { type: String, required: true },
  type:        { type: String, enum: ['percent', 'flat'], required: true },
  value:       { type: Number, required: true, min: 1 },
  minOrder:    { type: Number, default: 0 },
  usageLimit:  { type: Number, required: true, min: 1 },
  usedCount:   { type: Number, default: 0 },
  expiryDate:  { type: Date, required: true },
  isActive:    { type: Boolean, default: true },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

// Virtual: is expired
CouponSchema.virtual('isExpired').get(function () {
  return new Date() > this.expiryDate;
});

// Virtual: is exhausted
CouponSchema.virtual('isExhausted').get(function () {
  return this.usedCount >= this.usageLimit;
});

CouponSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Coupon', CouponSchema);
