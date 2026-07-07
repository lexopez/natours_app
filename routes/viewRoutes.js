const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(viewsController.alerts);

router.get('/', authController.isLoggedIn, viewsController.getOverview);

router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/signup', authController.isLoggedIn, viewsController.getSignupForm);

// applying general protection middleware to all routes below this line
// router.use(authController.protect);

router.get('/me', authController.protect, viewsController.getAccount);
router.get('/billing', authController.protect, viewsController.getBillingView);

router.get('/my-tours', authController.protect, viewsController.getMyTours);
router.get(
  '/my-reviews',
  authController.protect,
  viewsController.getMyReviewsView,
);

router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData,
);

router.get(
  '/manage-tours',
  authController.protect,
  authController.restrictTo('admin'),
  viewsController.getManageTours,
);
router.get(
  '/manage-users',
  authController.protect,
  authController.restrictTo('admin'),
  viewsController.getManageUsers,
);
router.get(
  '/manage-reviews',
  authController.protect,
  authController.restrictTo('admin'),
  viewsController.getManageReviews,
);
router.get(
  '/manage-bookings',
  authController.protect,
  authController.restrictTo('admin'),
  viewsController.getManageBookings,
);

// Add this with your other GET routes in routes/viewRoutes.js
router.get(
  '/tour/:slug/review',
  authController.protect,
  viewsController.getReviewForm,
);

module.exports = router;
