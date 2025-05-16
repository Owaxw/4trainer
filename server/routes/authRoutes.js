const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const authController = require('../controllers/authController');
const { check } = require('express-validator');

// Register a new user
router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    check('organization', 'Organization is required').not().isEmpty()
  ],
  authController.register
);

// Login user
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  authController.login
);

// Get current user
router.get('/current', auth, authController.getCurrentUser);

// Update user
router.put('/update', auth, authController.updateUser);

module.exports = router;