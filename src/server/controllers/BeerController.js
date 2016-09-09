var Beer = require('../models/models.js').Beer;

module.exports = {
	get: (req, res) => {
		Beer.findAll()
		.then((beers) => {
			res.json({results: beers, message: 'Fetched resources.'});
		})
		.catch((err) => {
			res.json({results: err, message: 'Error fetching resources.'});
		})
	}, 
	post: (req, res) => {
		const data = req.body;
		Beer.create({
			beerId: data.beerId,
			ibu: data.ibu,
			srm: data.srm,
			abv: data.abv
		})
		.then((beer) => {
			res.json({results: beer, message: 'Resource created.'});
		})
		.catch((err) => {
			res.json({results: err, message: 'Error creating resource.'});
		})
	}
}