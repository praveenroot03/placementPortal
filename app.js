var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var nodemailer = require('nodemailer');
var mongoose = require('mongoose');
var xssFilter = require('x-xss-protection')

var mongoURI = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/placementportal';

var students = require('./models/student');
var recrutes = require('./models/recruit');
var jobs = require('./models/job');
mongoose.connect(mongoURI, {dbName: 'placementportal'}, {useNewUrlParser: true},{ useCreateIndex: true });

var indexRouter = require('./routes/index');
var loginRouter = require('./routes/login');
var studentRouter = require('./routes/student');
var recruitRouter = require('./routes/recruit');
var db = mongoose.connection;

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(xssFilter())
app.use(session({
  name: 'SESSION_ID',
  secret: 'P0rTF0lIo1:][-#',
  resave: false,
  saveUninitialized: false,
  maxAge : 10000,
  secure: true,
  httpOnly : true,
  store: new MongoStore({ mongooseConnection: db })
}));


app.use('/', indexRouter);
app.use('/login',loginRouter);
app.use('/student', studentRouter);
app.use('/recruit', recruitRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
