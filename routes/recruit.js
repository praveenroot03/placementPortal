var express = require('express');
var router = express.Router();
var recruits = require('../models/recruit');
var jobs = require('../models/job');
var csrf = require('csurf');

router.use(csrf());

function isLogin (req, res, next) {
  if (req.session && req.session.recruitID) {
    return next();
  }else {
    return res.redirect('login');
  }
}

router.get('/login', function(req, res, next) {
  if (req.session && req.session.recruitID){
    return res.redirect('/recruit/dashboard');
  }
  return res.render('recruitLogin', { error : '', csrfToken: req.csrfToken()});
});

router.post('/login', function(req, res, next) {
  recruits.authenticate(req.body.email, req.body.password, function (error, recruit){
    if (error || !recruit){
      return res.render('recruitLogin',{ error: 'wrong Username / password', csrfToken: req.csrfToken()});
    }
    else {
      req.session.recruitID = recruit._id;
      return res.redirect("/recruit/dashboard");
    }
  })
});

router.get('/register', function(req, res, next) {
    return res.render('recruitRegister', { error : '', csrfToken: req.csrfToken()});
});

router.post('/register', function(req, res, next) {
  // console.log(req.body);

  if (!(req.body.password === req.body.passwordck)){
    return res.render('rectuitRegister', { error : 'Check password', csrfToken: req.csrfToken()});
    }

  var recruitData = {
    email : req.body.email,
    name : req.body.name,
    password : req.body.password,
    phoneno : req.body.phoneno
  };

  recruits.create(recruitData, function (err, recruit) {
    if (err) {
      //console.log(err);
      
      if (err.name === 'MongoError' && err.code === 11000) {
        return res.render('recruitRegister', { error : 'Email or mobile number already exist', csrfToken: req.csrfToken()});
        //return next(new Error('Email or mobile number already exist'));
      }
      // keep this just only for dev purpose
      // else {
      //   return next(err);
      // }
      //------------------------------------
    }
    else {
      req.session.recruitID = recruit._id;
      return res.redirect("/recruit/dashboard");
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
    recruits.uploadphoto(req.session.recruitID,"1245656.png");
    console.log(req.session.recruitID);
    
    return res.send("uploaded");
});

  router.get('/dashboard',isLogin ,function (req, res, next) {
     recruits.getdata(req.session.recruitID, function (error, data){
      if (error || !data){
        //return res.render('studentLogin',{ error: 'wrong Username / password', csrfToken: req.csrfToken()});
      }
      else {
        //console.log(data);
        
        return res.render('recruitDashboard',{data: data});
      }
    });
  });

  router.get('/addjob',isLogin,function(req,res,next){
    return res.render('jobcreate', {csrfToken: req.csrfToken()});
  });

  router.post('/addjob',isLogin,function (req,res,next){
    console.log(req.body);
    
      jobs.addjob(req.body.name,req.body.role,req.body.description,req.session.recruitID,req.body.salary,function(err){
        if(err){
          console.log("Error");
          
          return res.send("error adding data");
        }
        else{
          console.log("Done data");
          return res.send("data added");
        }
      });
  });

module.exports = router;
