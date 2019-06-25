var express = require('express');
var router = express.Router();
var students = require('../models/student')
var csrf = require('csurf');

router.use(csrf());

router.get('/login', function(req, res, next) {
  return res.render('studentLogin', { error : '', csrfToken: req.csrfToken()});
});

router.post('/login', function(req, res, next) {
  students.authenticate(req.body.email, req.body.password, function (error, student){
    if (error || !student){
      return res.render('studentLogin',{ error: 'wrong Username / password', csrfToken: req.csrfToken()});
    }
    else {
      req.session.studentID = student._id;
      return res.send('Logged in');
    }
  })
});

router.get('/register', function(req, res, next) {
    return res.render('studentRegister', { error : '', csrfToken: req.csrfToken()});
});

router.post('/register', function(req, res, next) {
  // console.log(req.body);

  if (!(req.body.password === req.body.passwordck)){
    return res.render('studentRegister', { error : 'Check password', csrfToken: req.csrfToken()});
    
  }

  var studentData = {
    email : req.body.email,
    name : req.body.name,
    password : req.body.password,
    phoneno : req.body.phoneno
  };

  students.create(studentData, function (err, student) {
    if (err) {
      if (err.name === 'MongoError' && err.code === 11000) {
        return res.render('studentRegister', { error : 'Email or mobile number already exist', csrfToken: req.csrfToken()});
        //return next(new Error('Email or mobile number already exist'));
      }
      // keep this just only for dev purpose
      // else {
      //   return next(err);
      // }
      //------------------------------------
    }
    else {
      req.session.studentID = student._id;
      return res.send('Student account created');
    }
  }
  );
});


router.get('/logout', function(req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }});

module.exports = router;
