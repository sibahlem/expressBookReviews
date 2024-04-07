// This contains the routes which a general user can access.
const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


// Code for registering a new user.
public_users.post("/register", (req,res) => {
  //let users = []
  /*const doesExist = (username)=>{ /* Utility function to check if the username exists in the list of registered users,
  to avoid duplications and keep the username unique.*/
    /*let userswithsamename = users.filter((user)=>{
      return user.username === username
    }); 
    if(userswithsamename.length > 0){
      return true;
    } else {
      return false;
    } 
  }*/
  const username = req.body.username; // takes the ‘username’ and ‘password’ provided in the body of the request for registration.
  const password = req.body.password;
  if (username && password) {
    if (username) {
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "User successfully registred. Now you can login"});
    } else { // If the username already exists, it must mention. 
      return res.status(404).json({message: "User already exists!"});
    }
  }
  return res.status(404).json({message: "Unable to register user."}); // Errors when username &/ password are not provided.
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  res.send(JSON.stringify(books,null,4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn; // Retrieving the ISBN from the request parameters.
  res.send(books[isbn])
});

// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  let booksbyauthor = [];
  let isbns = Object.keys(books) // Obtain all the keys for the ‘books’ object. Returns array?
  isbns.forEach((isbn) => { // Iterate through the ‘books’ array & check the author matches the one provided in the request parameters.
    if(books[isbn]["author"] === req.params.author) {
      booksbyauthor.push({"isbn":isbn,
                          "title":books[isbn]["title"],
                          "reviews":books[isbn]["reviews"]});
    }
  });
  res.send(JSON.stringify({booksbyauthor}, null, 4));
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  let booksbytitle = [];
  let isbns = Object.keys(books) // Obtain all the keys for the ‘books’ object. Returns array?
  isbns.forEach((isbn) => {  // Iterate through the ‘books’ array & check the title matches the one provided in the request parameters.
    if(books[isbn]["title"] === req.params.title) {
      booksbytitle.push({"isbn":isbn,
                          "author":books[isbn]["author"],
                          "reviews":books[isbn]["reviews"]});
    }
  });
  res.send(JSON.stringify({booksbytitle}, null, 4));
});

// Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn; // Retrieving the ISBN from the request parameters.
  res.send(books[isbn]["reviews"])
});

module.exports.general = public_users;
