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


module.exports = { getUserByEmail, getUserIDByEmail };

