const express = require("express");
const bcrypt = require("bcrypt");
const cookieSession = require('cookie-session');
const morgan = require("morgan");
const app = express();
const PORT = 8080; // default port 8080


// Config
app.set("view engine", "ejs");


// Middleware
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['fhgjfhgks'],
}));


// App data
const usersDatabase = {};
const urlDatabase = {};


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

const confirmURLById = (urlID) => {
  for (const URL in urlDatabase) {
    if (URL === urlID) {
      return true;
    }
  }

  return null;
};

const urlsForUser = (user_id) => {
  const userURLs = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === user_id) {
      userURLs[url] = urlDatabase[url];
    }
  }

  return userURLs;
};


// Route handlers
// GET Requests #################################

// GET /
app.get("/", (req, res) => {
  const user_id = req.session.user_id;
  if (user_id) {
    return res.redirect("/urls");
  }

  res.redirect("/login");
});
// GET /urls
app.get("/urls", (req, res) => {
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
    urls: urlsForUser(user_id)
  };

  res.render("urls_index", templateVars);

});
// GET /urls/new
app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id;
  if (!user_id) {
    return res.redirect("/login");
  }

  res.render("urls_new", { user: usersDatabase[user_id] });
});
// GET /urls/:id
app.get("/urls/:id", (req, res) => {
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
  
  if (!confirmURLById(id) || !urlsForUser(user_id)[id]) {
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
    longURL: urlsForUser(user_id)[id].longURL
  };
  
  res.render("urls_show", templateVars);
});
// GET /u/:id
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const user_id = req.session.user_id;

  if (!confirmURLById(id)) {
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
// GET /login
app.get("/login", (req, res) => {
  const user_id = req.session.user_id;
  if (user_id) {
    res.redirect("/urls");
    return;
  }
  res.render('login_page', { user: usersDatabase[user_id] });
});
// GET /register
app.get("/register", (req, res) => {
  const user_id = req.session.user_id;
  if (user_id) {
    res.redirect("/urls");
    return;
  }
  res.render('registration_page', { user: usersDatabase[user_id] });
});

// POST Requests ################################

// POST /urls
app.post("/urls", (req, res) => {
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

  const randomId = generateRandomString(6);
  urlDatabase[randomId] = {
    longURL: req.body.longURL,
    userID: user_id
  };

  res.redirect(`/urls/${randomId}`);
});
// POST /urls/:id
app.post("/urls/:id", (req, res) => {
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

  if (!confirmURLById(id)) {
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
app.post("/urls/:id/delete", (req, res) => {
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

  if (!urlsForUser(user_id)[id]) {
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
// POST /login
app.post("/login", (req, res) => {
  const userLoginEmail = req.body.email;
  const userLoginPassword = req.body.password;
  const userFound = getUserByEmail(userLoginEmail);

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
  
  bcrypt.compare(userLoginPassword, userFound.password)
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

      req.session.user_id = userFound.id;
      res.redirect("/urls");
    });
});
// POST /logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});
// POST /register
app.post("/register", (req, res) => {
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

  if (getUserByEmail(newUserEmail)) {
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
      const userId = generateRandomString(8);
      const userParameters = {
        id: userId,
        email: newUserEmail,
        password: hash
      };

      usersDatabase[userId] = userParameters;

      res.redirect("/login");
    });
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});