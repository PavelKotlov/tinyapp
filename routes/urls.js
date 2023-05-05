const express = require("express");
const router = express.Router();
const helpers = require("../helpers/helpers.js");
const {usersDatabase, urlDatabase} = require('../db/data.js');

// GET /urls
router.get("/", (req, res) => {
  const user_id = req.session.user_id;

  if (!user_id) {
    const errorParameters = {
      user: usersDatabase[user_id],
      code: 401,
      message: "Unautorized access. Please login or register to access."
    };
    res.statusCode = 401;
    res.render("error_page", errorParameters);
    return;
  }

  const templateVars = {
    user: usersDatabase[user_id],
    urls: helpers.urlsForUser(user_id, urlDatabase)
  };

  res.render("urls_index", templateVars);

});
// GET /urls/new
router.get("/new", (req, res) => {
  const user_id = req.session.user_id;
  if (!user_id) {
    return res.redirect("/users/login");
  }

  res.render("urls_new", { user: usersDatabase[user_id] });
});
// GET /urls/:id
router.get("/:id", (req, res) => {
  const id = req.params.id;
  const user_id = req.session.user_id;

  if (!user_id) {
    const errorParameters = {
      user: usersDatabase[user_id],
      code: 401,
      message: "Unautorized access. Please login or register to access."
    };
    res.statusCode = 401;
    res.render("error_page", errorParameters);
    return;
  }
  
  if (!helpers.confirmURLById(id, helpers.urlsForUser(user_id, urlDatabase))) {
    const errorParameters = {
      user: usersDatabase[user_id],
      code: 400,
      message: "URL does not exist, please create new short URL."
    };
    res.statusCode = 400;
    res.render("error_page", errorParameters);
    return;
  }
  
  
  const templateVars = {
    user: usersDatabase[user_id],
    id: id,
    longURL: helpers.urlsForUser(user_id, urlDatabase)[id].longURL
  };
  
  res.render("urls_show", templateVars);
});

// POST /urls
router.post("/", (req, res) => {
  const user_id = req.session.user_id;
  if (!user_id) {
    const errorParameters = {
      user: usersDatabase[user_id],
      code: 401,
      message: "Please log in to create new short urls."
    };
    res.statusCode = 401;
    res.render("error_page", errorParameters);
    return;
  }

  const randomId = helpers.generateRandomString(6);
  urlDatabase[randomId] = {
    longURL: req.body.longURL,
    userID: user_id
  };

  res.redirect(`/urls/${randomId}`);
});
// POST /urls/:id
router.post("/:id", (req, res) => {
  const id = req.params.id;
  const user_id = req.session.user_id;
  
  if (!user_id) {
    const errorParameters = {
      user: usersDatabase[user_id],
      code: 401,
      message: "Please log in to edit exisitng urls."
    };
    res.statusCode = 401;
    res.render("error_page", errorParameters);
    return;
  }

  if (!helpers.confirmURLById(id, urlDatabase)) {
    const errorParameters = {
      user: usersDatabase[user_id],
      code: 400,
      message: "Invalid short URL id."
    };
    res.statusCode = 400;
    res.render("error_page", errorParameters);
    return;
  }

  urlDatabase[id].longURL = req.body.longURL;

  res.redirect("/urls");
});
// POST /urls/:id/delete
router.post("/:id/delete", (req, res) => {
  const id = req.params.id;
  const user_id = req.session.user_id;
  
  if (!user_id) {
    const errorParameters = {
      user: usersDatabase[user_id],
      code: 401,
      message: "Please log in to delete existing urls."
    };
    res.statusCode = 401;
    res.render("error_page", errorParameters);
    return;
  }

  if (!helpers.urlsForUser(user_id, urlDatabase)[id]) {
    const errorParameters = {
      user: usersDatabase[user_id],
      code: 400,
      message: "Invalid short URL id."
    };
    res.statusCode = 400;
    res.render("error_page", errorParameters);
    return;
  }

  delete urlDatabase[id];
  res.redirect("/urls");
});
// GET /u/:id
router.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const user_id = req.session.user_id;

  if (!helpers.confirmURLById(id, urlDatabase)) {
    const errorParameters = {
      user: usersDatabase[user_id],
      code: 400,
      message: "Invalid short URL id."
    };
    res.statusCode = 400;
    res.render("error_page", errorParameters);
    return;
  }

  res.redirect(urlDatabase[id].longURL);
});

module.exports = router