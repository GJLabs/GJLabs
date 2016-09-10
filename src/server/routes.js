var path = require('path');
var controllers = require('./controllers/controllers.js');
var UserController = require('./controllers/UserController.js');
var UsersController = require('./controllers/UsersController.js');
var BeerController = require('./controllers/BeerController.js');
var UserBeerLogController = require('./controllers/UserBeerLogController.js');
var AuthController = require('./controllers/AuthController.js');

module.exports = function (app, express) {

  app.post('/signup', AuthController.SignUp.post);
  app.post('/login', AuthController.Login.post);

  app.post('/api/suggestion', controllers.post);

  app.post('/api/user/suggestion', controllers.algorithmPost); 
  app.get('/api/user/suggestion', controllers.algorithmPost);

  app.get('/api/user/moreSuggestions/:userId', controllers.algorithmGet);

  // Gets all users
  app.get('/api/users', UsersController.get);
  // Creates new user. 
  // Note: User creation moved to /api/signup - AuthController.SignUp.post
  // app.post('/api/users', UsersController.post);
  // Gets user by id
  app.get('/api/users/:userId', UserController.get);
  // Updates user by id
  app.put('/api/users/:userId', UserController.put);

  // Get user's beer log
  app.get('/api/users/:userId/beers', UserBeerLogController.get);
  // Adds beer to user's beer log
  app.post('/api/users/:userId/beers', UserBeerLogController.post);
  // Updates single entry for user's beer log (updates rating and liked)
  app.put('/api/users/:userId/beers', UserBeerLogController.put);
  // Removes beer from user's beer log.
  // Note: DELETE method ignores request body, so :beerId parameter is 
  // required for reference
  app.delete('/api/users/:userId/beers/:beerId', UserBeerLogController.delete);

  // Gets all beers stored in Bru db
  app.get('/api/beers', BeerController.get);
  // Store new beer in db
  app.post('/api/beers', BeerController.post);

  // Catch all to ensure manually entered urls still render app
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'client', 'index.html'));
  })

// ////////////// OLD EXAMPLES ////////////////////////////////
//   app.post('/api/users/signin', userController.signin);
//   app.post('/api/users/signup', userController.signup);
//   app.get('/api/users/signedin', userController.checkAuth);

//   // authentication middleware used to decode token and made available on the request
//   // app.use('/api/links', helpers.decode);
//   app.get('/api/links/', linksController.allLinks);
//   app.post('/api/links/', linksController.newLink);

//   // If a request is sent somewhere other than the routes above,
//   // send it through our custom error handler
//   app.use(helpers.errorLogger);
//   app.use(helpers.errorHandler);
};



// // DB ROUTES LIST 

// '/user' 
// // get: Gets all users (db)
// // post: Creates a new user (db)

// '/user/:id'
// // get: Gets one user model (db)
// // post: TBD (???)

// '/user/:id/profile'
// // get: Gets users specific taste profile (past beer history) (db)
// // post: Creates/changes a users taste profile (db)

// '/user/:id/suggestion'
// // get: Gets all suggestions following a request to db/algorithm (db)
// // post: Creates a new user (db)

// '/user/:id/suggestion/:suggestionCategory'
// // -> Categories: new, similar, stay away, default 
// // get: Gets all users (db)
// // post: Creates a new user (db)

'api/suggestion'

/*
1. POST request - 'api/suggestion'
// -> we respond with our suggestions, front=end renders 

2/3. POST request - creating user profile and taste profile
     GET request - On profile component page mount, request the users taste profile from our db
*/
