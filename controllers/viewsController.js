const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.alerts = (req, res, next) => {
  const { alert } = req.query;
  if (alert === 'booking')
    res.locals.alert =
      "Your booking was successful! Please check your email for a confirmation. If your booking doesn't show up here immediatly, please come back later.";
  next();
};

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection
  const tours = await Tour.find();

  // 2) Build template
  // 3) Render that template using tour data from 1)
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1) Get the data, for the requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }

  // 2) Build template
  // 3) Render template using data from 1)
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
    mapboxToken: process.env.MAPBOX_ACCESS_TOKEN,
  });
});

exports.getMyReviewsView = catchAsync(async (req, res, next) => {
  const reviews = await Review.find({ user: req.user.id }).populate('tour');

  res.status(200).render('myReviews', {
    title: 'My Reviews',
    reviews,
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};

exports.getSignupForm = (req, res) => {
  res.status(200).render('signup', {
    title: 'Sign up for an account',
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  // 2) Find tours with the returned IDs
  const tourIDs = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  // 3) Find which tours have been reviewed by the user among the booked tours
  const userReviews = await Review.find({
    user: req.user.id,
    tour: { $in: tourIDs },
  });
  const reviewedTourIDs = new Set(
    userReviews.map((review) => review.tour.toString()),
  );

  // 4) Add a flag to each tour to indicate if it has been reviewed
  tours.forEach((tour) => {
    tour.isReviewed = reviewedTourIDs.has(tour.id);
  });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});

exports.getReviewForm = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug });
  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }

  // Ensure user has booked the tour and not reviewed it yet
  const booking = await Booking.findOne({ user: req.user.id, tour: tour.id });
  if (!booking) {
    return next(
      new AppError('You can only review tours you have booked.', 403),
    );
  }

  res.status(200).render('reviewForm', {
    title: 'Write a Review',
    tour,
  });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser,
  });
});

exports.getBillingView = catchAsync(async (req, res, next) => {
  // Find all bookings for logged-in user
  const bookings = await Booking.find({ user: req.user.id }).populate('tour');

  res.status(200).render('billing', {
    title: 'Billing & Invoices',
    bookings,
  });
});

exports.getManageTours = catchAsync(async (req, res, next) => {
  const tours = await Tour.find().sort('-createdAt');
  const guides = await User.find({
    role: { $in: ['guide', 'lead-guide'] },
  }).sort('name');
  res
    .status(200)
    .render('manageTours', { title: 'Manage Tours', tours, guides });
});

exports.getManageUsers = catchAsync(async (req, res, next) => {
  const users = await User.find().sort('name');
  res.status(200).render('manageUsers', { title: 'Manage Users', users });
});

exports.getManageReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find().populate('tour user').sort('-createdAt');
  res.status(200).render('manageReviews', { title: 'Manage Reviews', reviews });
});

exports.getManageBookings = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find()
    .populate('tour user')
    .sort('-createdAt');
  res
    .status(200)
    .render('manageBookings', { title: 'Manage Bookings', bookings });
});
