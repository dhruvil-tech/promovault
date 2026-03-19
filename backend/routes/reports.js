const express = require('express');
const router  = express.Router();
const { getSummary, getCouponPerformance, getMonthlyReport } = require('../controllers/reportsController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin','manager'));

router.get('/summary',            getSummary);
router.get('/coupon-performance', getCouponPerformance);
router.get('/monthly',            getMonthlyReport);

module.exports = router;
