const express = require("express");
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

// Routes
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const urlsRouter = require("./routes/urls");

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/urls", urlsRouter);


app.listen(PORT, () => {
  console.log(`Tinyapp is listening on port ${PORT}!`);
});
