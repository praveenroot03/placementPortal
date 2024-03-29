var express = require('express');
var router = express.Router();
var students = require('../models/student')
var jobs = require('../models/job')
var csrf = require('csurf');

router.use(csrf());

function isLogin (req, res, next) {
  if (req.session && req.session.studentID) {
    return next();
  }else {
    return res.redirect('login');
  }
}

router.get('/login', function(req, res, next) {
  if (req.session && req.session.studentID){
    return res.redirect('/student/dashboard');
  }
  return res.render('studentLogin', { error : '', csrfToken: req.csrfToken()});
});

router.post('/login', function(req, res, next) {
  students.authenticate(req.body.email, req.body.password, function (error, student){
    if (error || !student){
      return res.render('studentLogin',{ error: 'wrong Username / password', csrfToken: req.csrfToken()});
    }
    else {
      req.session.studentID = student._id;
      return res.redirect("/student/dashboard");
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
      //console.log(err);
      
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
      return res.redirect("/student/dashboard");
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

router.get('/upload/profilepic',isLogin, function(req, res, next){
    students.uploadphoto(req.session.studentID,"1245656.png");
    console.log(req.session.studentID);
    
    return res.send("uploaded");
});

  router.get('/dashboard',isLogin ,function (req, res, next) {
      var search = req.query.search;

      if(search == undefined){
        jobs.getalljobs(function (err, result){
          if(err)
            return res.send("wrong");            
          return res.render("studentDashboard", {"jobs":result});
        })
      }
      else{
        jobs.getjobs(search, function (err, result){
          if(err)
            return res.send("Something went wrong");
          return res.render("studentDashboard", {"jobs":result});
        })
      }

  });

    router.get('/getjob',isLogin, function (req, res, next){
        var jobid = req.query.jobid;
        jobs.getjob(jobid, function (err, result){
          if (err)
            return result.send("error");
          // jobs.applyjob(req.session.studentID,jobid, function (err, result){
          //   if(err)
          //     return res.send("wrong wrong");
          //     return res.send(result);
          // })
          jobs.applyjob(req.session.studentID,jobid);
          return res.send("Applied");
        })
    })

module.exports = router;
