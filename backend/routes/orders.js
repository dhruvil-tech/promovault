const express = require('express');
const router  = express.Router();
const { createOrder, getMyOrders, getAllOrders } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/',     authorize('customer'),      createOrder);
router.get('/my',    authorize('customer'),      getMyOrders);
router.get('/',      authorize('admin','manager'), getAllOrders);

module.exports = router;
