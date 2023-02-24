const assert = require('chai').assert;
const helpers = require('../helpers.js');

const testUsers = {
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

const urlDatabase = {
  "86w5yt": {
    longURL: "http://www.bing.com", 
    userID: "user2RandomID"
  },
  "86dfb7": {
    longURL: "http://www.google.com", 
    userID: "userRandomID"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = helpers.getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";

    assert.strictEqual(user, expectedUserID);
  });

  it('should return null if user does not exist', () => {
    const user = helpers.getUserByEmail("user@eamil.com", testUsers);

    assert.isNull(user);
  });

  it('should return null if user is undefiend', () => {
    const user = helpers.getUserByEmail(undefined, testUsers);

    assert.isNull(user);
  });
});

describe('generateRandomString', function() {
  it('should return a random alphanumeric string with length 6 if given 6 as an argument', function() {
    const randomID = helpers.generateRandomString(6);

    assert.strictEqual(randomID.length, 6, console.log(`randomID: ${randomID}`));
  });

  it('should return null if given argument is undefined', () => {
    const randomID = helpers.confirmURLById(undefined);
    assert.isNull(randomID);
  });

  it('should return null if given argument is empty', () => {
    const randomID = helpers.confirmURLById();
    assert.isNull(randomID);
  });
});

describe('confirmURLById', function() {
  it('should return true if given URL id exist in URL database', function() {
    const shortURL = helpers.confirmURLById("86w5yt", urlDatabase);

    assert.strictEqual(shortURL, true);
  });

  it('should return null if given URL id does not exist', () => {
    const shortURL = helpers.confirmURLById("g8fg8f", urlDatabase);

    assert.isNull(shortURL);
  });

  it('should return null if given URL id is undefined', () => {
    const shortURL = helpers.confirmURLById(undefined, urlDatabase);

    assert.isNull(shortURL);
  });
});

describe('urlsForUser', function() {
  it('should return an object of urls that belongs to a user', function() {
    const userURLS = helpers.urlsForUser("userRandomID", urlDatabase);
    const expectedResult = {
      "86dfb7": {
      longURL: "http://www.google.com", 
      userID: "userRandomID"
      }
    }
    assert.deepEqual(userURLS, expectedResult);
  });

  it("should return null if given user doesn't didn't create any urls", () => {
    const userURLS = helpers.urlsForUser("userRandomID3", urlDatabase);
    assert.isNull(userURLS);
  });

  it('should return null if given user is undefined', () => {
    const userURLS = helpers.urlsForUser(undefined, urlDatabase);
    assert.isNull(userURLS);
  });
});
