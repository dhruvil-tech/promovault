const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Coupon = require('./models/Coupon');
const Product = require('./models/Product');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB...');

  // Clear
  await User.deleteMany();
  await Coupon.deleteMany();
  await Product.deleteMany();

  // Create users — plain text password, model's pre('save') will hash it
  const admin = await User.create({ name: 'Carol Admin', email: 'admin@demo.com', password: 'pass123', role: 'admin' });
  const manager = await User.create({ name: 'Bob Martinez', email: 'manager@demo.com', password: 'pass123', role: 'manager' });
  await User.create({ name: 'Alice Johnson', email: 'customer@demo.com', password: 'pass123', role: 'customer' });

  // Create coupons
  await Coupon.insertMany([
    { code: 'SAVE20', type: 'percent', value: 20, minOrder: 500, description: '20% off on orders above ₹500', expiryDate: '2026-06-30', usageLimit: 100, usedCount: 0, isActive: true, createdBy: manager._id },
    { code: 'FLAT100', type: 'flat', value: 100, minOrder: 800, description: '₹100 flat discount above ₹800', expiryDate: '2026-12-31', usageLimit: 50, usedCount: 0, isActive: true, createdBy: manager._id },
    { code: 'WELCOME10', type: 'percent', value: 10, minOrder: 0, description: '10% off for new customers', expiryDate: '2026-12-31', usageLimit: 500, usedCount: 0, isActive: true, createdBy: manager._id },
    { code: 'BIGBUY30', type: 'percent', value: 30, minOrder: 1500, description: '30% off on orders above ₹1500', expiryDate: '2026-05-01', usageLimit: 30, usedCount: 0, isActive: true, createdBy: admin._id },
  ]);

  // Create products
  await Product.insertMany([
    // Electronics
    { name: 'Wireless Headphones', description: 'Premium noise-cancelling headphones', price: 2499, category: 'Electronics', stock: 50 },
    { name: 'USB-C Hub', description: '7-in-1 USB-C hub with HDMI & card reader', price: 999, category: 'Electronics', stock: 80 },
    { name: 'Mechanical Keyboard', description: 'RGB backlit mechanical gaming keyboard', price: 3499, category: 'Electronics', stock: 30 },
    { name: 'Webcam HD 1080p', description: 'Full HD webcam with built-in mic', price: 1799, category: 'Electronics', stock: 60 },
    { name: 'Phone Stand', description: 'Adjustable aluminium phone/tablet stand', price: 499, category: 'Electronics', stock: 120 },

    // Accessories
    { name: 'Laptop Bag 15"', description: 'Water-resistant laptop backpack', price: 1299, category: 'Accessories', stock: 45 },
    { name: 'Mouse Pad XL', description: 'Extra-large gaming mouse pad', price: 399, category: 'Accessories', stock: 200 },
    { name: 'Cable Organizer', description: 'Set of 10 magnetic cable clips', price: 199, category: 'Accessories', stock: 300 },
    { name: 'Screen Cleaner Kit', description: 'Microfibre cloth + spray solution', price: 249, category: 'Accessories', stock: 150 },

    // Stationery
    { name: 'Notebook A5', description: 'Premium hardcover dot-grid notebook', price: 349, category: 'Stationery', stock: 100 },
    { name: 'Pen Set (10pcs)', description: 'Smooth gel ink pens, assorted colors', price: 299, category: 'Stationery', stock: 200 },
    { name: 'Sticky Notes Pack', description: '200 sticky notes in 4 colors', price: 149, category: 'Stationery', stock: 250 },
  ]);

  console.log('✅ Seed complete!');
  console.log('  admin@demo.com    / pass123');
  console.log('  manager@demo.com  / pass123');
  console.log('  customer@demo.com / pass123');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
