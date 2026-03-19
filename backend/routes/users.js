const express = require('express');
const router  = express.Router();
const { getAllUsers, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/',      getAllUsers);
router.post('/',     createUser);
router.put('/:id',   updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
