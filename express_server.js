function generateRandomString() {
  const result = Math.random().toString(36).substring(2,7);
  return result;
}

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080]
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { status } = require("express/lib/response");
const { getUserByEmail, urlsForUser } = require("./helpers.js");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['tinyapp key'],
}));

app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandom2ID"
  },
  msm5xK: {
    longURL: "http://www.google.com",
    userID: "userRandomID"
  },
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

// redirect to index of urls
app.get("/", (req, res) => {
  const userID = users[req.session.user_id];
  if (!userID) {
    res.redirect("/login");
  } else {
    res.redirect("/urls");
  }
});

// display main index of urls
app.get("/urls", (req, res) => {
  const userID = req.session["user_id"];
  const urls = urlsForUser(userID, urlDatabase);
  console.log("userID", userID);
  console.log(urls);

  const templateVars = {
    urls: urls,
    user: users[userID]
  };
  res.render("urls_index", templateVars);
});

// display page to add new url
app.get("/urls/new", (req, res) => {
  const userID = users[req.session.user_id];
  const templateVars = {
    user: userID
  };
  if (!userID) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

// display information about single url
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[req.session.user_id]
  };
  res.render("urls_show", templateVars);
});

// display original website through shortened URL
app.get("/u/:id", (req, res) => {
  const long = urlDatabase[req.params.id].longURL;
  res.redirect(long);
});

// submit a new url
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.session.user_id };
  console.log("urlDatabase", urlDatabase[shortURL]);
  res.redirect(`/urls/${shortURL}`);
});

// edit a url in the database
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.user_id;
  const newURL = req.body.longURL;
  if (!userID) {
    res.redirect(400, "/login");
  }
  urlDatabase[shortURL].longURL = newURL;
  console.log("url was changed");
  res.redirect("/urls");
});

// delete a url from the database
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.user_id;
  if (!userID) {
    res.redirect(400, "/login");
  }
  delete urlDatabase[shortURL];
  console.log("url was deleted");
  res.redirect("/urls");
});

// display page to login
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("urls_login", templateVars);
});

// display page to register an account
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("urls_register", templateVars);
});

// submit login information
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);
 
  if (!user) {
    res.redirect(403, "/login");
  } else {
    if (bcrypt.compareSync(password, user.password)) {
      req.session.user_id = user.id;
      res.redirect("/urls");
    } else {
      res.redirect(403, "/login");
    }
  }
});

// submit a registration
app.post("/register", (req, res) => {
  const newUser = generateRandomString();
  const password = req.body.password;
  const email = req.body.email;
  
  if (!req.body.email || !password) {
    res.redirect(400, "/register");
  } else if (getUserByEmail(email, users) === true) {
    res.redirect(400, "/register");
  } else {
    const hashedPassword = bcrypt.hashSync(password, 10);
    users[newUser] = { id: newUser, email: email, password: hashedPassword };
    req.session.user_id = newUser;
    res.redirect("/urls");
  }
});

// submit request to logout of account
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/urls");
});

// show when the server is ready
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});