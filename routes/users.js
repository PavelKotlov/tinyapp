const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const helpers = require("../helpers/helpers.js");
const {usersDatabase} = require('../db/data.js');

// GET /
router.get("/", (req, res) => {
  const user_id = req.session.user_id;
  if (user_id) {
    return res.redirect("/urls");
  }
  
  res.redirect("/user/login");
});

// GET /login
router.get("/login", (req, res) => {
  const user_id = req.session.user_id;
  if (user_id) {
    res.redirect("/urls");
    return;
  }
  
  res.render('login_page', { user: usersDatabase[user_id] });
});

// GET /register
router.get("/register", (req, res) => {
  const user_id = req.session.user_id;
  if (user_id) {
    res.redirect("/urls");
    return;
  }
  res.render('registration_page', { user: usersDatabase[user_id] });
});

// POST /login
router.post("/login", (req, res) => {
  const userLoginEmail = req.body.email;
  const userLoginPassword = req.body.password;
  const userFound = helpers.getUserByEmail(userLoginEmail, usersDatabase);

  if (!userLoginEmail || !userLoginPassword) {
    const errorParameters = {
      user: null,
      code: 400,
      message: "Please provide both user email and password."
    };
    res.statusCode = 400;
    res.render("error_page", errorParameters);
    return;
  }

  if (!userFound) {
    const errorParameters = {
      user: null,
      code: 403,
      message: "User not found. Please register new user."
    };
    res.statusCode = 403;
    res.render("error_page", errorParameters);
    return;
  }
  
  bcrypt.compare(userLoginPassword, usersDatabase[userFound].password)
    .then(function(result) {
      if (!result) {
        const errorParameters = {
          user: null,
          code: 403,
          message: "Invalid password. Please check your password details and try again."
        };
        res.statusCode = 403;
        res.render("error_page", errorParameters);
        return;
      }

      req.session.user_id = usersDatabase[userFound].id;
      res.redirect("/urls");
    });
});

// POST /logout
router.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/user/login");
});

// POST /register
router.post("/register", (req, res) => {
  const newUserEmail = req.body.email;
  const newUserPassword = req.body.password;

  if (!newUserEmail || !newUserPassword) {
    const errorParameters = {
      user: null,
      code: 400,
      message: "Please provide both user email and password."
    };
    res.statusCode = 400;
    res.render("error_page", errorParameters);
    return;
  }

  if (helpers.getUserByEmail(newUserEmail, usersDatabase)) {
    const errorParameters = {
      user: null,
      code: 400,
      message: "User already exist, please procced to login."
    };
    res.statusCode = 400;
    res.render("error_page", errorParameters);
    return;
  }

  bcrypt.genSalt(10)
    .then((salt) => {
      return bcrypt.hash(newUserPassword, salt);
    })
    .then((hash) => {
      const userId = helpers.generateRandomString(8);
      const userParameters = {
        id: userId,
        email: newUserEmail,
        password: hash
      };

      usersDatabase[userId] = userParameters;
      req.session.user_id = usersDatabase[userId].id;
      res.redirect("/urls");
    });
});

module.exports = router