function generateRandomString() {
  const result = Math.random().toString(36).substring(2,7);
  return result;
}

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080]
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { status } = require("express/lib/response");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
// helper function to check if email is in user database
const emailMatch = function(input) {
  for (let user in users) {
    if (input === users[user].email) {
      return true;
    }
    return false;
  }
};

const authenticate = function(db, email, password) {
  for (let user in db) {
    if (emailMatch(email) === true) {
      if (password === db[user].password) {
        return true;
      }
    }
    return false;
  }
};

// redirect to index of urls
app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// display page to add new url
app.get("/urls/new", (req, res) => {
  const templateVars = { 
    user_id: req.cookies["user_id"] 
  };
  res.render("urls_new", templateVars);
});

// display page to register an account
app.get("/register", (req, res) => {
  const templateVars = { 
    user_id: req.cookies["user_id"] 
  };
  res.render("urls_register", templateVars);
});

// submit a registration
app.post("/register", (req, res) => {
  const newUser = generateRandomString();
  
  if (!req.body.email) {
    res.redirect(400, "/register");
  } else if (emailMatch(req.body.email) === true) {
    res.redirect(400, "/register");
  } else {
    users.newUser = { id: newUser, email: req.body.email, password: req.body.password };
    res.cookie("user_id", req.body.email);
    res.redirect("/urls");
  }
});

// display page to login
app.get("/login", (req, res) => {
  const templateVars = { 
    user_id: req.cookies["user_id"] 
  };
  res.render("urls_login", templateVars);
});

// submit a new url
app.post("/urls", (req, res) => {
  console.log(req.body);  
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

// display original website through shortened URL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (urlDatabase[req.params.shortURL] === undefined) {
    res.status(400).send('Error: this page does not exist');
  } else {
    res.redirect(longURL);
  }
});

// display main index of urls
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user_id: req.cookies["user_id"] 
  };
  res.render("urls_index", templateVars);
});

// display information about single url
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    user_id: req.cookies["user_id"] 
  };
  res.render("urls_show", templateVars);
});

// submit login information
app.post("/login", (req, res) => {
  const email = req.body.email; 
  const password = req.body.password;

  if (emailMatch(email) === false) {
    res.redirect(403, "/login");
  } else if (emailMatch(email) === true) {
    if (authenticate(users, email, password) === false) {
      res.redirect(403, "/login");
    } else if (emailMatch(email) === true) {
      let id = "";
      if (authenticate(users, email, password) === true) {
      res.cookie("user_id", email);
      res.redirect("/urls");
      }
    }
  }
});

// submit request to logout of account
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

// delete a url from the database
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  console.log("url was deleted");
  res.redirect("/urls");
});

// edit a url in the database
app.post("/urls/:shortURL/update", (req, res) => {
  const shortURL = req.params.shortURL;
  const newURL = req.body.longURL;
  urlDatabase[shortURL] = newURL;
  console.log("url was changed");
  res.redirect("/urls");
});

// show when the server is ready
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});