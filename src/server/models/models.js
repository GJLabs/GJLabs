var Sequelize = require('sequelize');
var sequelize = require('../db/db.js');

// Defines join table
var BeerLog = sequelize.define('beerlog', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  beer_id: {
    type: Sequelize.INTEGER,
    unique: false
  },
  user_id: {
    type: Sequelize.INTEGER,
    unique: false
  },
  rating: {type: Sequelize.INTEGER},
  liked: {type: Sequelize.BOOLEAN}
});

// Defines User table
var User = sequelize.define('user', {
  username: {type: Sequelize.STRING, null: false, unique: true},
  firstName: {type: Sequelize.STRING},
  lastName: {type: Sequelize.STRING},
  email: {type: Sequelize.STRING, unique: true}, // make null: false
  password: {type: Sequelize.STRING, null: false} // make null: false
});

// Defines Beer table
var Beer = sequelize.define('beer', {
  beerId: {type: Sequelize.STRING, null:false, unique: true},
  ibu: {type: Sequelize.FLOAT},
  srm: {type: Sequelize.FLOAT},
  abv: {type: Sequelize.FLOAT}
});


// Define many to many relationship between User and Beer
// using BeerLog as a join table
User.belongsToMany(Beer, {
  through: {
    model: BeerLog,
    unique: false
  },
  foreignKey: 'user_id'
});

Beer.belongsToMany(User, {
  through: {
    model: BeerLog,
    unique: false
  },
  foreignKey: 'beer_id'
});

/////////////////////////////////
///// INITIALIZE DATABASE
/////////////////////////////////
// Uncomment to create database tables. `{force:true}` drops and recreates table
// sequelize.sync({force:true});


module.exports.User = User;
module.exports.Beer = Beer;
module.exports.BeerLog = BeerLog;