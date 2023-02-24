const getUserByEmail = (email, database) => {
  for (const userId in database) {
    if (database[userId].email === email) {
      return database[userId].id;
    }
  }

  return null;
};

// Global Variables
const generateRandomString = (length) => {
  /* Convert random number into alphanumeric string using redix base 16. Return
  positions 2 - lenght + 2, not inclusive*/
  return Math.random().toString(16).slice(2, length + 2);
};


// Helper Functions
const confirmURLById = (urlID, database) => {
  for (const URL in database) {
    if (URL === urlID) {
      return true;
    }
  }

  return null;
};

const urlsForUser = (user_id, database) => {
  const userURLs = {};
  for (const url in database) {
    if (database[url].userID === user_id) {
      userURLs[url] = database[url];
    }
  }

  return Object.keys(userURLs).length > 0 ? userURLs: null;
};

const helpers = {
  getUserByEmail,
  generateRandomString,
  confirmURLById,
  urlsForUser
};


module.exports = helpers;