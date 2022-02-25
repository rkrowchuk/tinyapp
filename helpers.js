const urlsForUser = function(userID, database) {
  let urls = {}; 
  for (let url in database) {
    if (database[url].userID === userID) {
      urls[url] = database[url].longURL;
    }
  }
  return urls;
}

const getUserByEmail = function(input, db) {
  for (let user in db) {
    if (input === db[user]["email"]) {
      return db[user];
    }
  }
  return false;
};

const getUserIDByEmail = function(input, db) {
  for (let user in db) {
    if (input === db[user]["email"]) {
      return user;
    }
  }
  return undefined;
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


module.exports = { getUserByEmail, getUserIDByEmail, urlsForUser, authenticate };

