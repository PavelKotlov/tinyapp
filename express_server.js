const express = require("express");
const cookieParser = require('cookie-parser');
const morgan = require("morgan");
const app = express();
const PORT = 8080; // default port 8080


// Config
app.set("view engine", "ejs");


// Middleware
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// App data
const usersDatabase = {};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


// Global Variables
const generateRandomString = (length) => {
  /* Convert random number into alphanumeric string using redix base 16. Return
  positions 2 - lenght + 2, not inclusive*/
  return Math.random().toString(16).slice(2, length + 2);
};


// Helper Functions
const getUserByEmail = (email) => {
  for (const userId in usersDatabase) {
    if (usersDatabase[userId].email === email) {
      return usersDatabase[userId];
    }
  }

  return null;
};

const getURLById = (urlId) => {
  for (const URL in urlDatabase) {
    if (URL === urlId) {
      return true;
    }
  }

  return null;
};


// Route handlers
// GET Requests #################################

// GET /urls
app.get("/urls", (req, res) => {
  const user_id = req.cookies["user_id"];
  
  const templateVars = {
    user: usersDatabase[user_id],
    urls: urlDatabase
  };

  res.render("urls_index", templateVars);
});
// GET /urls/new
app.get("/urls/new", (req, res) => {
  const user_id = req.cookies["user_id"];
  if (!user_id) {
    res.redirect("/login");
    return;
  }
  res.render("urls_new", { user: usersDatabase[user_id] });
});
// GET /urls/:shortURL_id
app.get("/urls/:shortURL_id", (req, res) => {
  const shortURL_id = req.params.shortURL_id;
  const user_id = req.cookies["user_id"];
  
  if (!getURLById(shortURL_id)) {
    const errorParameters = {
      user: usersDatabase[user_id],
      code: 400,
      message: "Invalid short URL id."
    }
    res.statusCode = 400;
    res.render("error_page", errorParameters);
    return;
  }

  const templateVars = {
    user: usersDatabase[user_id],
    shortURL_id: shortURL_id,
    longURL: urlDatabase[shortURL_id]
  };
  
  res.render("urls_show", templateVars);
});
// GET /u/:shortURL_id
app.get("/u/:shortURL_id", (req, res) => {
  const shortURL_id = req.params.shortURL_id;
  const longURL = urlDatabase[shortURL_id];
  const user_id = req.cookies["user_id"];
  
  if (!getURLById(shortURL_id)) {
    const errorParameters = {
      user: usersDatabase[user_id],
      code: 302,
      message: "Invalid short URL id."
    }
    res.statusCode = 302;
    res.render("error_page", errorParameters);
    return;
  }

  res.redirect(longURL);
});
// GET /login
app.get("/login", (req, res) => {
  const user_id = req.cookies["user_id"];
  if (user_id) {
    res.redirect("/urls");
    return;
  }
  res.render('login_page', { user: usersDatabase[user_id] });
});
// GET /register
app.get("/register", (req, res) => {
  const user_id = req.cookies["user_id"];
  if (user_id) {
    res.redirect("/urls");
    return;
  }
  res.render('registration_page', { user: usersDatabase[user_id] });
});

// POST Requests ################################

// POST /urls
app.post("/urls", (req, res) => {
  const user_id = req.cookies["user_id"];
  if (!user_id) {
    const errorParameters = {
      user: usersDatabase[user_id],
      code: 403,
      message: "Please log in to create new short urls."
    }
    res.statusCode = 403;
    res.render("error_page", errorParameters);
    return;
  }

  const randomId = generateRandomString(6);
  if (req.body.longURL) {
    urlDatabase[randomId] = req.body.longURL;
    res.redirect(`/urls/${randomId}`);
  }
});
// POST /urls/:shortURL_id
app.post("/urls/:shortURL_id", (req, res) => {
  const shortURL_id = req.params.shortURL_id;
  const user_id = req.cookies["user_id"];

  const templateVars = {
    user: usersDatabase[user_id],
    shortURL_id: shortURL_id,
    longURL: urlDatabase[shortURL_id]
  };

  res.render("urls_show", templateVars);
});
// POST /urls/:shortURL_id/edit
app.post("/urls/:shortURL_id/edit", (req, res) => {
  urlDatabase[req.body.shortURL_id] = req.body.longURL;
  res.redirect(`/urls`);
});
// POST /urls/:shortURL_id/delete
app.post("/urls/:shortURL_id/delete", (req, res) => {
  const shortURL_id = req.params.shortURL_id;
  delete urlDatabase[shortURL_id];
  res.redirect("/urls");
});
// POST /login
app.post("/login", (req, res) => {
  const userLoginEmail = req.body.email;
  const userLoginPassword = req.body.password;
  const user_id = req.cookies["user_id"];
  const userFound = getUserByEmail(userLoginEmail);

  if (!userFound) {
    const errorParameters = {
      user: usersDatabase[user_id],
      code: 403,
      message: "User not found. Please register new user."
    }
    res.statusCode = 403;
    res.render("error_page", errorParameters);
    return;
  }

  if (userFound.password !== userLoginPassword) {
    const errorParameters = {
      user: usersDatabase[user_id],
      code: 403,
      message: "Invalid password. Please check your password details and try again."
    }
    res.statusCode = 403;
    res.render("error_page", errorParameters);
    return;
  }

  res.cookie("user_id", userFound.id);
  res.redirect("/urls");
});
// POST /logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});
// POST /register
app.post("/register", (req, res) => {
  const newUserEmail = req.body.email;
  const newUserPassword = req.body.password;
  const user_id = req.cookies["user_id"];

  if (!newUserEmail || !newUserPassword) {
    const errorParameters = {
      user: usersDatabase[user_id],
      code: 400,
      message: "Please provide both user email and password."
    }
    res.statusCode = 400;
    res.render("error_page", errorParameters);
    return;
  }

  if (getUserByEmail(newUserEmail)) {
    const errorParameters = {
      user: usersDatabase[user_id],
      code: 400,
      message: "User already exist, please procced to login."
    }
    res.statusCode = 400;
    res.render("error_page", errorParameters);
    return;
  }

  const userId = generateRandomString(8);
  const userParameters = {
    id: userId,
    email: newUserEmail,
    password: newUserPassword
  };
  usersDatabase[userId] = userParameters;

  res.cookie("user_id", userId);
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});