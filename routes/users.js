const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
let User = require('../models/user');

router.get('/register', function(req, res){
  res.render('register');
});

module.exports = router;


router.post('/register', function(req, res){
  const name = req.body.name;
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;

  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();

  let errors = req.validationErrors();
  if(errors){
    res.render('register',{
      errors:errors
    });
  }else{
    let newuser = new User({
      name: name,
      email:email,
      username:username,
      password:password
    });

    bcrypt.genSalt(10, function(err, salt){
      bcrypt.hash(newuser.password, salt, function(err, hash){
        if(err){
          console.log(err);
        }
        newuser.password = hash;
        newuser.save(function(err){
          if(err){
            console.log(err);
            return;
          }else{
            req.flash('Success', 'Your now registered');
            res.redirect('/users/login')
          }
        });
      });
    });
  }
});
//Route Get login
router.get('/login', function(req, res){
  res.render('login');
});
//Router post Login
router.post('/login', function(req, res, next){
  const username = req.body.name;
  const password = req.body.name;

  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();

  passport.authenticate('local',{
    successRedirect:'/',
    failureRedirect:'/users/login',
      failureFlash: true
  })(req, res, next);

});

//Logout

router.get('/logout', function(req, res){
  req.logout();
  req.flash('Success','Successfully logged out');
  res.redirect('/users/login');
});



router.get('/logout', function(req, res){
  req.logout();
  req.flash('Success','Successfully logged out');
  res.redirect('/users/login');
});
