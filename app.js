//setup server and middlewares
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const filterXSS = require('xss');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const compression = require('compression');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const bookingController = require('./controllers/bookingController');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.set('trust proxy', 1);

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES
// Implement CORS
app.use(cors());
// Access-Control-Allow-Origin *
// api.natours.com, front-end natours.com
// app.use(cors({
//   origin: 'https://www.natours.com'
// }))

// After (Express 5.0 compatible)
app.options(/(.*)/, cors());
// app.options('/api/v1/tours/:id', cors());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//set security HTTP headers
// app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      'default-src': ["'self'"],

      'base-uri': ["'self'"],

      'script-src': [
        "'self'",
        "'unsafe-inline'",
        'https://js.stripe.com',
        'https://hooks.stripe.com',
        'https://api.mapbox.com',
        'https://cdn.jsdelivr.net',
        'https://esm.sh',
        'https:',
      ],

      'style-src': [
        "'self'",
        "'unsafe-inline'",
        'https://api.mapbox.com',
        'https://fonts.googleapis.com',
      ],

      'font-src': ["'self'", 'https://fonts.gstatic.com', 'https:', 'data:'],

      'img-src': [
        "'self'",
        'data:',
        'blob:',
        'https://api.mapbox.com',
        'https://images.unsplash.com',
        'https://*.stripe.com',
      ],

      'connect-src': [
        "'self'",
        'https://api.mapbox.com',
        'https://events.mapbox.com',
        'https://api.stripe.com',
        'https://cdn.jsdelivr.net',
      ],

      'frame-src': [
        "'self'",
        'https://js.stripe.com',
        'https://hooks.stripe.com',
      ],

      'worker-src': ["'self'", 'blob:'],

      'child-src': ["'self'", 'blob:'],

      'object-src': ["'none'"],
    },
  }),
);

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter); // Apply rate limiting to all API routes

// // Stripe webhook, BEFORE body-parser, because stripe needs the body as stream
app.post(
  '/webhook-checkout',
  bodyParser.raw({ type: 'application/json' }),
  bookingController.webhookCheckout,
);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// // Data sanitization against NoSQL query injection
// app.use(mongoSanitize()); // deprecated, we will do it manually to avoid replacing the whole object and losing the reference

app.use((req, res, next) => {
  if (req.body) req.body = mongoSanitize.sanitize(req.body);

  if (req.query) {
    // We sanitize the data inside, rather than replacing the whole object
    const cleanQuery = mongoSanitize.sanitize(req.query);
    Object.keys(req.query).forEach((key) => delete req.query[key]);
    Object.assign(req.query, cleanQuery);
  }
  next();
});

// // Data sanitization against XSS
// app.use(xss()); // deprecated, we will do it manually to avoid replacing the whole object and losing the reference

const sanitize = (obj) => {
  if (typeof obj !== 'object' || obj === null) return obj;

  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === 'string') {
      obj[key] = filterXSS(obj[key]);
    } else if (typeof obj[key] === 'object') {
      sanitize(obj[key]); // Recursive call for nested objects
    }
  });
};

// Use it as a middleware
app.use((req, res, next) => {
  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);
  next();
});

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

app.use(compression());

// Serving static files
app.use(express.static(`${__dirname}/public`));

// request time middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.status(204).end();
});

app.all(/(.*)/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
