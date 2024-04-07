// This contains the routes which an authorized user can access.
const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

//write code to check is the username is valid
const isValid = (username)=>{ //returns boolean
  let userswithsamename = users.filter((user)=>{
    return user.username === username
  });
  if(userswithsamename.length > 0){
    return true;
  } else {
    return false;
  }

}

//write code to check if username and password match the one we have in records.
const authenticatedUser = (username,password)=>{ //returns boolean
  let validusers = users.filter((user)=>{
    return (user.username === username && user.password === password)
  });
  if(validusers.length > 0){
    return true;
  } else {
    return false;
  }

}

/*regd_users.use(session({secret:"fingerpint"}))

regd_users.use("/friends", function auth(req,res,next){
  if(req.session.authorization) {
      token = req.session.authorization['accessToken'];
      jwt.verify(token, "access",(err,user)=>{
          if(!err){
              req.user = user;
              next();
          }
          else{
              return res.status(403).json({message: "User not authenticated"})
          }
       });
   } else {
       return res.status(403).json({message: "User not logged in"})
   }
}); */

//only registered users can login
regd_users.post("/login", (req,res) => { // BUT use 'customer/login' for post request
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) { // Code must validating and signin in a customer based on the username and password.
      return res.status(404).json({message: "Error logging in"});
  }
  if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });
    req.session.authorization = {
      accessToken,username
  }
  return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }
});

// Code for adding or modifying a book review:
regd_users.put("/auth/review/:isbn", (req, res) => { // "customer/auth/review/1" for PUT request
const isbn = req.params.isbn; // We fetch the ISBN given in the HTTP request parameters...
let filtered_book = books[isbn] // and filter the details (author, title, review) for that ISBN.
if (filtered_book) { //If the book with that ISBN exists, then...
  let review = req.query.review; // the review added in the HTTP request query is fetched. 
  let reviewer = req.session.authorization['username']; //  Session authorization is checked based on the username.
  if(review) { /*  If a review has been provided in the HTTP request query,it is assigned to the given username,  
                  and further to the reviews of the book with the above ISBN.
                  This way multiple users can post and update their respective book reviews.*/
      filtered_book['reviews'][reviewer] = review;
      books[isbn] = filtered_book;
  }
  res.send(`The review for the book with ISBN  ${isbn} has been added/updated.`);
}
else{
  res.send("Unable to find this ISBN!");
}
});

// Code for deleting a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  let reviewer = req.session.authorization['username'];
  let filtered_review = books[isbn]["reviews"];
  if (filtered_review[reviewer]){
      delete filtered_review[reviewer];
      res.send(`Reviews for the ISBN  ${isbn} posted by the user ${reviewer} deleted.`);
  }
  else{
      res.send("Can't delete, as this review has been posted by a different user");
  }
  });

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
