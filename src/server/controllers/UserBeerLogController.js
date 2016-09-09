var User = require('../models/models.js').User;
var Beer = require('../models/models.js').Beer;

module.exports = {
  get: (req, res) => {
  	const data = req.body;
  	const userId = req.params.userId;
  	User.findById(userId)
  	.then((user) => {
  		user.getBeers()
  		.then((beers) => {
	  		res.json({results: beers, message: 'Fetched resource.'})
  		})
  		.catch((err) => {
  			res.json({results: err, message: 'Error fetching resource.'})
  		})
  	})
  	.catch((err) => {
	    res.json({results: err, message: 'Error fetching resouce.'})
  	})
  },
  post: (req, res) => {
  	const data = req.body;
  	const userId = req.params.userId;
  	Beer.findOne({
  		where: {
  			beerId: data.beerId
  		}
  	})
  	.then((beer) => {
  		if (!beer) {
  			return Beer.create({
  				beerId: data.beerId,
  				ibu: data.ibu,
  				srm: data.srm,
  				abv: data.abv
  			})
  			.then((beer) => {
  				return beer;
  			})
  		} else {
  			return beer;
  		}
  	})
  	.then((beer) => {
	  	User.findById(userId)
	  	.then((user) => {
	  		user.addBeers(beer);
	  		return beer;
	  	})
	  	.then((beer) => {
		    res.json({results: beer, message: 'Resource created.'});
	  	})
  		.catch((err) => {
  			res.json({results: err, message: 'Error creating resource'});
  		})
  	})
  	.catch((err) => {
  		res.json({results: err, message: 'Resource not created'})
  	})
  },
  put: (req, res) => {
    res.json('beerlog controller put request')
  },
  delete: (req, res) => {
    res.json('beerlog controller delete request')
  }
}