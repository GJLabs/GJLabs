var graphs = require('../graph/node.js');  
var aleGraph = graphs.aleGraph; 
var lagerGraph = graphs.lagerGraph; 
var styleFamilies = require('../../../beerdata/styleFamilies.js')


// Current Input: Hard Coded Data, result of 5 'GET' requests from the same beer category. 
// All pale ale category = (25, [25, 29, 32, 33, 37])
// styleId breakdown = [25, 25, 29, 32, 33]; 
var beerList = require('../../../beerdata/paleAleSample.js'); 
var styleFamilyId = 'cdkpyx'; // -> Refers to the paleAle category 
var styleFamily = [25, 29, 32, 33, 37]; // -> All styles related to paleAle

// Desired Input: Access User's Beer List, includes Beer ID, ibu, abv, srm (calculated from average if neccesary)
// var beerList = User.find({})..... 

// Ideal Input/Idea: Can we calculate and store the results of running the algorithm everytime a user adds the beer?
// Seems like it may be a cleaner way to store a specific set of values when everything is available in system. 


var algorithm = function(beerList) {

	var beerListStylesId = beerList.map((beer) => beer.styleId); 
	console.log(beerListStylesId); 

	// Step 1. Determine the Specific Case: 
	var algorithmCase = categoryConfirm(styleFamily, beerListStylesId); 
	console.log('algorithmCase is: ', algorithmCase); 

	var nodesList = findAllNodes(beerList, styleFamily); 
	console.log(nodesList); 

	// Step 2. Calculate Query String Values (styles, abv, ibu, srm)

	//////
	// 2.1 Weighted Preference for Styles 
	// -> Weighted preference for results based on styleIds from beer list 
	///////

	// selectionsPerStyle is an object that will contain the number of beers will select per 
	// a query for a given styleId 
	var selectionsPerStyle = {}
	// Total list of recommendations that we pull 1 result from
	var recommendationListLength = 15; 
	// The ratio that we prefer styleIds the user has previously selected
	var selectedRatio = .80; 
	// This 20% will allow users to see styles they have not previously chosen (ie styleId=37); 
	var unselectedRatio = .20; 

	var total = beerListStylesId.length; 
	var unselected = 0; 

	// Count the frequency a given styleId shows up in the users beers list.
	beerListStylesId.forEach((style) => {
		selectionsPerStyle[style] = selectionsPerStyle[style] + 1 || 1; 
	}); 

	// Add the styleIds that have never been selected to the selections object:
	styleFamily.forEach((style) => {
		if (selectionsPerStyle[style] === undefined) {
			selectionsPerStyle[style] = 0; 
			// selectionsPerStyle['unselected'] = selectionsPerStyle['unselected'] + 1 || 1; 
			unselected++; 
		}; 
	}); 

	console.log('The selections per style before weighting is:', selectionsPerStyle); 

	var styleKeys = Object.keys(selectionsPerStyle); 
	
	styleKeys.forEach((key) => {
		var styleCount = selectionsPerStyle[key]; 
		var stylePercent = styleCount / total; 
		console.log(stylePercent); 
		selectionsPerStyle[key] = selectionPerStyleCalculator(stylePercent, recommendationListLength, selectedRatio, unselected); 
	})

	console.log('The selections per style after weighting is:', selectionsPerStyle); 


	//////
	// 2.2 averageABV
	///////

	beerList_avgABV = beerList.map((beer) => {
		return propertyFinder('abv', beer); 
	})

	var avgABV = avgCalculator(beerList_avgABV); 	
	console.log(beerList_avgABV); 
	console.log('The average ABV is: ', avgABV); 


	//////
	// 2.3 averageIBU
	///////

	beerList_avgIBU = beerList.map((beer) => {
		return propertyFinder('ibu', beer); 
	})

	var avgIBU = avgCalculator(beerList_avgIBU); 
	console.log(beerList_avgIBU); 
	console.log('The average IBU is: ', avgIBU); 

	//////
	// 2.4 averageSRM
	///////

	beerList_avgSRM = beerList.map((beer) => {
		return propertyFinder('srm', beer); 
	})

	var avgSRM = avgCalculator(beerList_avgSRM); 
	console.log(beerList_avgSRM); 
	console.log('The average SRM is: ', avgSRM);

	//////
	// 3 Algorithm Result 
	///////

	var algorithmResult = {}; 
	algorithmResult.styles = styleKeys; 
	algorithmResult.styleCount = selectionsPerStyle; 
	algorithmResult.avgABV = avgABV
	algorithmResult.avgIBU = avgIBU
	algorithmResult.avgSRM = avgSRM

	return algorithmResult; 

}; 

var getBeerOverlapScores = function(beerList) {
	stylesScores = {};
	for (var i = 0; i < beerList.length; i++) {
		var adjFams = beerList[i].allAdjacent;
		for (var j = 0; j < adjFams.length; j++) {
			if (adjFam[j] !== undefined && stylesScores[adjFam[j]] === undefined) {
				stylesScores[adjFam[j]] = 1;
			} else if (adjFam[j] !== undefined) {
				stylesScores[adjFam[j]]++;
			}
		}
	}

	return stylesScores;
}

var getCurrentNode = function(beer) {
	for (var i = 0; i < lagerGraph.length; i++) {
		if (beer.styleFamily === lagerGraph.nodes[i].styleFamily) {
			return lagerGraph.nodes[i]
		}
	}
	for (var i = 0; i < aleGraph.length; i++) {
		if (beer.styleFamily === aleGraph.nodes[i].styleFamily) {
			return aleGraph.nodes[i]
		}
	}
}

var categoryConfirm = function(styleFamily, styleIdArray) {
	// Naive approach for looking through array of styles in users beer list
	// and checking if they all belong to the same styleFamily. 
	styleIdArray.forEach((styleId) => {
		if (styleFamily.indexOf(styleId) === -1) {
			return false
		}
	})
	return 1; 
};  

var selectionPerStyleCalculator = function(stylePercent, listLength, ratio, unselectedCount) {
	if (stylePercent > 0) {
		return Math.floor(ratio * listLength * stylePercent); 
	} else {
		return Math.floor((1-ratio) * listLength / unselectedCount); 
	}
}

var avgCalculator = function(propertyArray) {
	var len = propertyArray.length; 
	return propertyArray.reduce((a,b) => a + b) / len; 
}; 

var propertyFinder = function(property, beerDataObject) {
	var min = property + 'Min'; 
	var max = property + 'Max'; 
	if (beerDataObject[property] !== undefined) {
		return parseFloat(beerDataObject[property]); 
	} else if (beerDataObject.style[min] !== undefined && beerDataObject.style[max] !== undefined) {
		return ( (parseFloat(beerDataObject.style[min]) + parseFloat(beerDataObject.style[max])) / 2 ); 
	} else {
		return null; 
	}
} 

module.exports = algorithm; 