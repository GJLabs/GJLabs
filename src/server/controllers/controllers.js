var express = require('express');
var axios = require('axios'); 
var API_KEY = require('../key/config.js'); 
var Promise = require('bluebird'); 
var _ = Promise.promisifyAll(require('underscore'));
var beerStyles = require('../../../beerdata/beerStyles.js'); 
//sqlize
var User = require('../models/models.js').User;
var Beer = require('../models/models.js').Beer;
var BeerLog = require('../models/models.js').BeerLog;

//// DATA FOR ALGORITHM //// 
var algorithm = require('./algorithm.js');  
var beerList = require('../../../beerdata/multipleExample.js'); 
////////////////

var styleFamilies = require('../../../beerdata/styleFamilies.js');

module.exports = {

  get: function (req, res, next) {
    res.send(index); 
  },

  post: function (req, res, next) {
    var count = 0;
    var style = req.body.beers[0];
    // console.log(req.body.beers[0]); 
    var styles = beerStyles[style]; 
    // var styles = [30, 164]; //req.data.styles;
    var lookupStr = 'http://api.brewerydb.com/v2/beer/' + style + '/?key=' + API_KEY; 
    console.log(lookupStr); 
    axios.get(lookupStr)
    .then(function(beerData) {
      var results = [];
      var startIBU = beerData.data.data.ibu; //req.data.ibu;
      var startABV = beerData.data.data.abv; //req.data.abv;
      var test = makeReq(results, styles, startIBU, startABV, count, res, 0);
    }); 
  }, 

  algorithmPost: function (req, res, next) {
    console.log('req.body:', req.body);
    var algorithmResult = algorithm(beerList); 
    var results = [];

    var startIBU = algorithmResult.ibu; //req.data.ibu;
    var startABV = algorithmResult.abv;
    var styles = algorithmResult.styles; 
    var styleCount = algorithmResult.styleCount; 
    algorithmRequest(results, styles, styleCount, startIBU, startABV, 0, res, 0); 
    // res.send(algorithmResult); 
  },

  algorithmGet: function (req, res, next) {
    getBeerList(req.params.userId).then(function(beerList) {
      var algorithmResult = algorithm(beerList); 
      var results = [];
      var startIBU = algorithmResult.ibu; //req.data.ibu;
      var startABV = algorithmResult.abv;
      var styles = algorithmResult.styles; 
      var styleCount = algorithmResult.styleCount; 
      algorithmRequest(results, styles, styleCount, startIBU, startABV, 0, res, 0); 
      // res.send(algorithmResult); 
    })
  }
};




// Controllers List 

// getAllUsers
// createNewUser

// getOneUser
// addToProfile

// getProfile
// 



// Recursive request function that makes a request to the BreweryDB API using recursive axios 'GET'
// request to ensure that we are receiving a list of beer recommendations of the desired length. 
// NOTE: 
var makeReq = function(results, styles, startIBU, startABV, count, res, index, incSize) {
  count++;
  var style = styles[index];
  // console.log(count); 
  var incSize = incSize || .05;
  var reqString = requestStrBuilder(style, startIBU, startABV, count, incSize);
  // console.log(reqString)
  // console.log('\n');
  axios.get(reqString)
  .then(function(getResponse) {
    if (getResponse.data.totalResults > 5 && count < 5) {
      results.push(makeReq(results, styles, startIBU, startABV, count, res, index, incSize/2));
    } else if (getResponse.data.totalResults === undefined && count < 5) {
      results.push(makeReq(results, styles, startIBU, startABV, count, res, index, incSize * 2));
    } else if (index === styles.length - 1) {
      results.push(getResponse.data.data);
      results = resultsCleaner(results); 
      // var names = results.map((a)=> a.name); 
      var beer = Math.floor(Math.random() * results.length); 
      beer = results[beer]; 
      var styleFamily = findStyleFamily(beer.styleId, styleFamilies); 
      // console.log('STYLE FAMILY IS: ', styleFamily); 
      beer['styleFamily'] = styleFamily[1]; 
      beer['styleFamilyId'] = styleFamily[0]; 
      console.log(beer); 
      res.json(beer); 
    } else {
      results.push(getResponse.data.data);
      results.push(makeReq(results, styles, startIBU, startABV, 0, res, index + 1));
    }
    return results;
  })
  .catch(function (error) {
    console.log(error);
  });
}


var algorithmRequest = function(results, styles, styleCount, startIBU, startABV, count, res, index, incSize) {
  var style = styles[index];
  var incSize = incSize || .05;
  var reqString = requestStrBuilder(style, startIBU, startABV, count, incSize);
  console.log(reqString); 
  count++;

  axios.get(reqString)
  .then(function(getResponse) {
    if (getResponse.data.totalResults > 10 && count < 5) {
      results.push(algorithmRequest(results, styles, styleCount, startIBU, startABV, count, res, index, incSize/2));

    } else if (getResponse.data.totalResults === undefined && count < 5) {
      results.push(algorithmRequest(results, styles, styleCount, startIBU, startABV, count, res, index, incSize * 2));

    } else if (index === styles.length - 1) {
      var responseArray = getResponse.data.data;
      if (responseArray.length > styleCount[style]) {
        var startIndex = responseArray.length - styleCount[style]; 
        startIndex = Math.floor(Math.random() * startIndex); 
        var endIndex = startIndex + styleCount[style]; 
        responseArray.slice(startIndex, endIndex); 
      } else {
        results.push(getResponse.data.data);
      }
      results = resultsCleaner(results); 
      var beer = Math.floor(Math.random() * results.length); 
      console.log('CHOOSING 1 BEER FROM A LIST OF ' + results.length + ' beers!'); 
      beer = results[beer]; 
      res.json(beer); 

    } else {
      var responseArray = getResponse.data.data;
      if (responseArray.length > styleCount[style]) {
        var startIndex = responseArray.length - styleCount[style]; 
        startIndex = Math.floor(Math.random() * startIndex); 
        var endIndex = startIndex + styleCount[style]; 
        responseArray.slice(startIndex, endIndex); 
      } else {
        results.push(getResponse.data.data);
      }
      results.push(algorithmRequest(results, styles, styleCount, startIBU, startABV, 0, res, index + 1));
    }
    return results;
  })
  .catch(function (error) {
    console.log(error);
  });
}

// Utility helper function that takes style, IBU, ABV to generate a query string for the BreweryDB API
var requestStrBuilder = function(style, startIBU, startABV, count, incSize) {
  var finalStr = 'http://api.brewerydb.com/v2/beers/?availabilityId=1&withBreweries=Y'
  if(startIBU != undefined) {
    finalStr += '&ibu=' + (startIBU - startIBU*incSize) + ',' + (startIBU + startIBU*incSize);
  }
  if(startABV != undefined) {
    finalStr += '&abv=' + (startABV - startABV*incSize) + ',' + (startABV + startABV*incSize);
  }
  finalStr += '&styleId=' + style;
  finalStr += '&key=' + API_KEY;
  return finalStr;
}

// Utility cleaner function for concatenating and removing undefined value from results array. 
var resultsCleaner = function (results) {
  return results.reduce(function(a,b) {
    if (b === undefined) {
      return a; 
    } else {
      return a.concat(b); 
    }
  },[]); 
}

var allStyles = []; 
for (var key in beerStyles) {
  allStyles.concat(beerStyles[key]); 
}

allStyles.sort(function(a,b) {
  return a - b; 
}); 

// Utility helper function for adding a given beer's styleFamily and styleFamilyId properties
// to the returned object. 
var findStyleFamily = function(styleId, styleFamilyObject) {
  var styleFamilyResult = []; 
  if (styleFamilyObject[styleId] !== undefined) {
    styleFamilyResult.push(styleId, styleFamilyObject[styleId]); 
    return styleFamilyResult; 
  }
  var styleKeys = Object.keys(styleFamilyObject); 
  styleKeys.forEach((style) => {
    var currentStyleFamily = styleFamilyObject[style]; 
    if (currentStyleFamily.indexOf(styleId) !== -1) {
      styleFamilyResult.push(style, currentStyleFamily); 
    }
  }); 
  return styleFamilyResult; 
}

var styleQuery = function() {
  var lookupStr = 'http://api.brewerydb.com/v2/styles/?key=' + API_KEY; 
  var stylesObject = {}; 
  axios.get(lookupStr)
  .then(function(getResponse) {

  });
}

var getBeerList = function(userId){
  return User.findById(userId).then(function(user) {
    return user.getBeers()
  });
}
      