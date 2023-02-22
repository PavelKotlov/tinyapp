const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

// Execute app requirements
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// App data
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Global Variables
const generateRandomString = (length) => {
  // Converting a random number between 0 & 1 to an alphanumeric string using redix base 16, for hexadecimal, as an argument in the object method .toString(16), then retreving the elements between positions 2 and 8, not inclusive.
  return Math.random().toString(16).slice(2, length + 2);
};

// Route handlers

// Direct URL get requests
app.get("/urls", (req, res) => {
  res.render("urls_index", { username: req.cookies["username"], urls: urlDatabase });
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new", { username: req.cookies["username"] });
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const templateVars = {
    username: req.cookies["username"],
    id: id,
    longURL: urlDatabase[id]
  };
  res.render("urls_show", templateVars);
});

// Redirect link to external resource get request
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  res.redirect(longURL);
});

// Create New URL button post request
app.post("/urls", (req, res) => {
  const randomId = generateRandomString(6);
  if (req.body.longURL) {
    urlDatabase[randomId] = req.body.longURL;
    res.redirect(`/urls/${randomId}`);
  }
});

// Edit Main button post request
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;

  const templateVars = {
    username: req.cookies["username"],
    id: id,
    longURL: urlDatabase[id]
  };

  res.render("urls_show", templateVars);
});

// Edit URL button post request
app.post("/urls/:id/edit", (req, res) => {
  urlDatabase[req.body.id] = req.body.longURL;
  res.redirect(`/urls`);
});

// Delete button post request
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

// Login button post request
app.post("/login", (req, res) => {
  if (req.body.username) {
    res.cookie("username", req.body.username);
  }
  res.redirect("/urls");
});

// Logout button post request
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});