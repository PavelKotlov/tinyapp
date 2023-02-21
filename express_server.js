const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

// Execute app requirements
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

// App data
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Global Variables
const generateRandomString = (length) => {
  // Converting a random number between 0 & 1 to an alphanumeric string using redix base 16, for hexadecimal, as an argument in the object method .toString(16), then retreving the elements between positions 2 and 8, not inclusive.
  return Math.random().toString(16).slice(2, length + 2)
};

// Route handlers
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase
  };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;

  const templateVars = {
    id: id,
    longURL: urlDatabase[id]
  };

  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);
  res.send("Ok");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});