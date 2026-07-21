var express = require("express");
var router = express.Router();

// Import các router lẻ
let authRouter = require('./auth');
let busesRouter = require('./buses');
let notificationsRouter = require('./notifications');
let paymentsRouter = require('./payments');
let usersRouter = require('./users');
let ticketsRouter = require('./tickets');
let tripsRouter = require('./trips');
let seatsRouter = require('./seats');
let stationsRouter = require('./stations');
let reviewsRouter = require('./reviews');
let routesRouter = require('./routes');

// Gắn các router vào endpoint tương ứng
router.use('/auth', authRouter);
router.use('/buses', busesRouter);
router.use('/notifications', notificationsRouter);
router.use('/payments', paymentsRouter);
router.use('/users', usersRouter);
router.use('/tickets', ticketsRouter);
router.use('/trips', tripsRouter);
router.use('/seats', seatsRouter);
router.use('/stations', stationsRouter);
router.use('/reviews', reviewsRouter);
router.use('/routes', routesRouter);

module.exports = router;