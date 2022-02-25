const getUserByEmail = function(input, db) {
  for (let user in db) {
    if (input === db[user]["email"]) {
      return db[user];
    }
  }
  return false;
};

module.exports = getUserByEmail;