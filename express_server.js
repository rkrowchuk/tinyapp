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

const emailMatch = function(input) {
  for (let user in users) {
    if (input === users[user].email) {
      return true;
    }
  }
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    user_id: req.cookies["user_id"] 
  };
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = { 
    user_id: req.cookies["user_id"] 
  };
  res.render("urls_register", templateVars);
});

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

app.post("/urls", (req, res) => {
  console.log(req.body);  
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});


app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (urlDatabase[req.params.shortURL] === undefined) {
    res.status(400).send('Error: this page does not exist');
  } else {
    res.redirect(longURL);
  }
});

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user_id: req.cookies["user_id"] 
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    user_id: req.cookies["user_id"] 
  };
  res.render("urls_show", templateVars);
});

app.post("/login", (req, res) => {
  const user_id = req.body.username;
  res.cookie("user_id", users[user_id]);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  console.log("url was deleted");
  res.redirect("/urls");
});

app.post("/urls/:shortURL/update", (req, res) => {
  const shortURL = req.params.shortURL;
  const newURL = req.body.longURL;
  urlDatabase[shortURL] = newURL;
  console.log("url was changed");
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});