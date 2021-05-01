const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

//user model
const User = require('../models/User');

//Login page
router.get('/login', (req, res) => res.render('login'));

//Register page
router.get('/register', (req, res) => res.render('register'));

//Register Handle
router.post('/register', (req, res) => {
    const {name, email, password, password2 } = req.body;
    let errors = [];

    //check required fields
    if (!name || !email || !password) {
        errors.push({ msg: 'Please fill in all fields'});
    }

    //check if passwords are 6 char
    if (password.length < 6) {
        errors.push({ msg: 'Password should be at least 6 characters'});
    }

    if(errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        });
    } else {
        //validation passed
        User.findOne({ email: email})
            .then(user => {
                if(user){
                     //User exists
                     errors.push({ msg: 'Email is already registered'});
                     res.render('register', {
                         errors,
                         name,
                         email,
                         password,
                         password2
                     });
                } else {
                    const newUser = new User({
                        name,
                        email,
                        password
                    });
                    // Hash password
                    bcrypt.genSalt(10, (err, salt) =>
                        bcrypt.hash(newUser.password, salt, (err, hash)=> {
                            if(err) throw err;
                            //set password to hashed
                            newUser.password = hash;

                            //Save User
                            newUser.save()
                                .then(user =>{
                                    req.flash('success_msg', 'You are now registered for Cabbages and can log in');
                                    res.redirect('/users/login');
                                })
                                .catch(err => console.log(err));

                    }))
                }
            });
    }
});

//Login Handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        //if successful login go to dashboard... link home.html here
        successRedirect: '/final/index.html',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

//Logout Handle
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

module.exports = router;
