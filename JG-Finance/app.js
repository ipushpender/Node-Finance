let createError = require('http-errors');
let express = require('express');
let path = require('path');
// var cookieParser = require('cookie-parser');
let mongoose = require('mongoose');
let session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session);

let indexRouter = require('./routes/index');
let usersRouter = require('./routes/users');
let employeeRouter = require('./routes/employees');
let vendorRouter = require('./routes/vendors');
let pfgRouter = require('./routes/pfg');
let depositRouter = require('./routes/deposit_reconcil');
let withdrawRouter = require('./routes/withdrawal');
let fs = require('fs');

let app = express();
// app.use(logger('dev'));
var store = new MongoDBStore({
  uri: 'mongodb://175.25.4.198:27017/PayoutApp',
  collection: 'mySessions'
});
store.on('error', function (error) {
  console.log(error);
});
try {
  mongoose.connect('mongodb://175.25.4.198:27017/PayoutApp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  mongoose.set('useCreateIndex', true);
} catch (error) {
  console.log(error)
}
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60 * 3
  }, //hour
  store: store,
  resave: true,
  saveUninitialized: true
}))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
// app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/employees', employeeRouter);
app.use('/vendors', vendorRouter);
app.use('/pfg', pfgRouter);
app.use('/deposit', depositRouter);
app.use('/withdraw', withdrawRouter);
app.use(function (req, res, next) {
  res.locals.user = req.session.username;
  next();
});
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;