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
const userLookUp = (email) => {
  for (const userId in usersDatabase) {
    if (usersDatabase[userId].email === email) {
      return usersDatabase[userId];
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
  }

  res.render("urls_index", templateVars);
});
// GET /urls/new
app.get("/urls/new", (req, res) => {
  const user_id = req.cookies["user_id"];
  res.render("urls_new", { user: usersDatabase[user_id] });
});
// GET /urls/:shortURL_id
app.get("/urls/:shortURL_id", (req, res) => {
  const shortURL_id = req.params.shortURL_id;
  const user_id = req.cookies["user_id"];
  
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
  res.redirect(longURL);
});
// GET /register
app.get("/register", (req, res) => {
  const user_id = req.cookies["user_id"];
  res.render('registration_page', { user: usersDatabase[user_id] });
});

// POST Requests ################################

// POST /urls
app.post("/urls", (req, res) => {
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
  const userFound = userLookUp(userLoginEmail);
  if (userFound) {
    res.cookie("user_id", userFound.id);
  }
  res.redirect("/urls");
});
// POST /logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});
// POST /register
app.post("/register", (req, res) => {
  const newUserEmail = req.body.email;
  const newUserPassword = req.body.password;

  if (!newUserEmail || !newUserPassword) {
    res.statusCode = 400;
    res.send("Please provide both user email and password.");
    return;
  }

  if (!userLookUp(newUserEmail)) {
    res.statusCode = 400;
    res.send("User already exist, please procced to login.");
    return;
  }

  const userId = generateRandomString(8);
  const userParameters = {
    id: userId,
    email: newUserEmail,
    password: newUserPassword
  }
  usersDatabase[userId] = userParameters;

  res.cookie("user_id", userId);
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});