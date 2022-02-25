function generateRandomString() {
  const result = Math.random().toString(36).substring(2,7);
  return result;
}

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080]
const bodyParser = require("body-parser");
// const cookieParser = require("cookie-parser");
var cookieSession = require('cookie-session')
const bcrypt = require('bcryptjs');
const { status } = require("express/lib/response");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['tinyapp key'],
}))
// app.use(cookieParser());

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandom2ID" 
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "userRandomID"
  },
  "12345": {
    longURL: "http://www.twitter.com",
    userID: "userRandomID"
  }
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
// helper functions 
const getUserByEmail = function(input, db) {
  for (let user in db) {
    if (input === db[user]["email"]) {
      return db[user];
    }
  }
  return false;
};

const authenticate = function(db, email, password) {
  for (let user in db) {
    if (getUserByEmail(email, users)) {
      if (password === db[user].password) {
        return true;
      }
    }
    return false;
  }
};

// const getID = function(email, db) {
//   for (let user in db) {
//     if (emailMatch(email)) {
//       return user;
//     }
//   }
// };

const urlsForUser = function(id) {
  let urls = [];
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      urls.push(urlDatabase[url].longURL);
    }
  }
  return urls;
}

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
    user_id: req.session.user_id 
  };
  res.render("urls_new", templateVars);
});

// display page to register an account
app.get("/register", (req, res) => {
  const templateVars = { 
    user_id: req.session.user_id 
  };
  res.render("urls_register", templateVars);
});

// submit a registration
app.post("/register", (req, res) => {
  const newUser = generateRandomString();
  
  if (!req.body.email) {
    res.redirect(400, "/register");
  } else if (getUserByEmail(req.body.email, users) === true) {
    res.redirect(400, "/register");
  } else {
    const password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10);
    users.newUser = { id: newUser, email: req.body.email, password: hashedPassword };
    req.session.user_id = req.body.email;
    res.redirect("/urls");
  }
});

// display page to login
app.get("/login", (req, res) => {
  const templateVars = { 
    user_id: req.session.user_id 
  };
  res.render("urls_login", templateVars);
});

// submit a new url
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL };
  res.redirect(`/urls/${shortURL}`);
});

// display original website through shortened URL
app.get("/u/:id", (req, res) => {
  const long = urlDatabase[req.params.id].longURL;
  res.redirect(long);
});

// display main index of urls
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user_id: req.session.user_id 
  };
  res.render("urls_index", templateVars);
});

// display information about single url
app.get("/urls/:id", (req, res) => {
  const templateVars = { 
    shortURL: req.params.id, 
    longURL: urlDatabase[req.params.id].longURL,
    user_id: req.session.user_id 
  };
  res.render("urls_show", templateVars);
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
      req.session.user_id = req.body.email;
      res.redirect("/urls");
    } else {
      res.redirect(403, "/login");
    }
  }
});

// submit request to logout of account
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/urls");
});

// delete a url from the database
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.cookies.user_id;
  if(!userID) {
    res.redirect(400, "/urls");
  } else if (userID) {
    for (let url of urlsForUser(userID)) {
      if (url !== urlDatabase[shortURL].longURL) {
        res.redirect(400, "/urls");
      } else { 
        delete urlDatabase[shortURL];
        console.log("url was deleted");
        res.redirect("/urls");
      }
    }
  }
});

// edit a url in the database
app.post("/urls/:shortURL/update", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.cookies.user_id;
  const newURL = req.body.longURL;
  if(!userID) {
    res.redirect(400, "/urls");
  } else if (userID) {
    for (let url of urlsForUser(userID)) {
      if (url !== urlDatabase[shortURL].longURL) {
        res.redirect(400, "/urls");
      } else { 
        urlDatabase[shortURL].longURL = newURL;
        console.log("url was changed");
        res.redirect("/urls");
      }
    }
  }
});

// show when the server is ready
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});