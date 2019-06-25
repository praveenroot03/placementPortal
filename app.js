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

var mongoURI = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/test';

var students = require('./models/student');
mongoose.connect(mongoURI, {dbName: 'test'}, {useNewUrlParser: true},{ useCreateIndex: true });

var indexRouter = require('./routes/index');
var studentRouter = require('./routes/student');
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
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
  saveUninitialized: true, 
  secure: true,
  httpOnly : true,
  ephemeral: true,
  store: new MongoStore({ mongooseConnection: db })
}));


app.use('/', indexRouter);
app.use('/student', studentRouter);

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
