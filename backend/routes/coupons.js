const express = require('express');
const router  = express.Router();
const {
  getCoupons, getCoupon, createCoupon, updateCoupon,
  deleteCoupon, validateCoupon, toggleCoupon
} = require('../controllers/couponController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/',                getCoupons);
router.post('/validate',       validateCoupon);
router.post('/',               authorize('manager','admin'), createCoupon);
router.get('/:id',             getCoupon);
router.put('/:id',             authorize('manager','admin'), updateCoupon);
router.delete('/:id',          authorize('admin'),           deleteCoupon);
router.patch('/:id/toggle',    authorize('manager','admin'), toggleCoupon);

module.exports = router;
