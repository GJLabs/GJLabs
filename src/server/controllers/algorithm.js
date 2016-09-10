var graphs = require('../graph/node.js');  
var aleGraph = graphs.aleGraph; 
var lagerGraph = graphs.lagerGraph; 
var styleFamilies = require('../../../beerdata/styleFamilies.js'); 
var stylesData = require('../../../beerdata/styles.js'); 
var _ = require('underscore'); 
var User = require('../models/models.js').User;
var Beer = require('../models/models.js').Beer;
var BeerLog = require('../models/models.js').BeerLog;
var beerList = require('../../../beerdata/multipleExample.js'); 


var algorithm = function(beerList) {
	var beerListStylesId = beerList.map((beer) => beer.styleId); 
	var beerListStyleFamilyIds = beerList.map((beer) => beer.styleFamilyId);
	// console.log('STYLE FAMILY IDS: ', beerListStyleFamilyIds);  
	// console.log('beerList:', beerList);
	// Step 1. Determine the Specific Case: 

	// !! TODO !! 
	// -> Include correct value for styleFamily 
	// var algorithmCase = categoryConfirm(styleFamily, beerListStylesId); 

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
	var currentStyleId = getCurrentNode(beerList[0]).styleFamilyId; 
	var currentStyleFamily = getCurrentNode(beerList[0]).styleFamily; 
	// console.log(currentStyleFamily); 

	var total = beerListStylesId.length; 
	var unselected = 0; 

	// Count the frequency a given styleId shows up in the users beers list.
	beerListStylesId.forEach((style) => {
		selectionsPerStyle[style] = selectionsPerStyle[style] + 1 || 1; 
	}); 

	// Add the styleIds that have never been selected to the selections object:
	currentStyleFamily.forEach((style) => {
		if (selectionsPerStyle[style] === undefined) {
			selectionsPerStyle[style] = 0; 
			unselected++; 
		}; 
	}); 

	// console.log('SELECTIONS PER STYLE: ', selectionsPerStyle); 

	var styleKeys = Object.keys(selectionsPerStyle); 
	styleKeys.forEach((key) => {
		var styleCount = selectionsPerStyle[key]; 
		var stylePercent = styleCount / total; 
		selectionsPerStyle[key] = selectionPerStyleCalculator(stylePercent, recommendationListLength, selectedRatio, unselected); 
	})

	beerList_avgABV = beerList.map((beer) => {
		return propertyFinder('abv', beer); 
	})
	var avgABV = avgCalculator(beerList_avgABV); 	

	beerList_avgIBU = beerList.map((beer) => {
		return propertyFinder('ibu', beer); 
	})
	var avgIBU = avgCalculator(beerList_avgIBU); 


	beerList_avgSRM = beerList.map((beer) => {
		return propertyFinder('srm', beer); 
	})
	var avgSRM = avgCalculator(beerList_avgSRM); 


	//////
	// 3 Algorithm Result 
	///////

	var algorithmResult = {}; 
	algorithmResult.styles = styleKeys; 
	algorithmResult.styleCount = selectionsPerStyle; 
	algorithmResult.abv = avgABV
	algorithmResult.ibu = avgIBU
	algorithmResult.srm = avgSRM


	/////// CASE 2: NOT ALL THE SAME CATEGORY ///////////////// 

	var overLapScoresObject = getBeerOverlapScores(beerList); 

	//////// COMPARE TO CURRENT NODES ////////
	// console.log('ALGORITHM RESULT: \n', algorithmResult); 

	var primaryCategory = calculatePrimaryCategory(beerListStyleFamilyIds); 
	primaryCategoryData = stylesData[primaryCategory]; 
	primaryCategoryCharacteristics = calculateStyleCharacteristics(primaryCategoryData); 
	// console.log(primaryCategoryCharacteristics); 

	var comparisonData = calculateComparison(algorithmResult, primaryCategoryCharacteristics); 
	var currentNode = aleGraph.storage[primaryCategory]; 
	var similarNodes = calculateComparableNodes(comparisonData, currentNode); 

	// console.log(comparisonData); 
	// console.log(currentNode);
	// console.log(adjacentNodes); 

	var searchCategoryScores = calculateSearchCategoryScores(overLapScoresObject, similarNodes); 
	console.log('SEARCH CATEGORY SCORES', searchCategoryScores); 

	searchCategoryScores = convertToCount(searchCategoryScores, 50); 
	console.log('SEARCH CATEGORY COUNT', searchCategoryScores); 

	selectionsPerStyleId = algorithmSelectionsPerStyle(searchCategoryScores, beerListStylesId); 
	console.log(selectionsPerStyleId); 

	// var singleSelection = singleStyleCalculator(19, 25, beerListStylesId); 

	// return algorithmResult; 
}; 

var getBeerOverlapScores = function(beerList) {
	stylesScores = {};
	for (var i = 0; i < beerList.length; i++) {
		var currentNode = getCurrentNode(beerList[i]);
		var adjFams = currentNode.allAdjacent();
		// console.log('adjFams: ', adjFams);
		for (var j = 0; j < adjFams.length; j++) {
			if (adjFams[j] !== undefined && stylesScores[adjFams[j]] === undefined) {
				stylesScores[adjFams[j]] = 1;
			} else if (adjFams[j] !== undefined) {
				stylesScores[adjFams[j]]++;
			}
		}
	}
	// console.log('Scores: ', stylesScores);
	return stylesScores;
}

var getCurrentNode = function(beer) {
	for (var i = 0; i < aleGraph.nodes.length; i++) {
		if (beer.styleFamilyId === aleGraph.nodes[i].styleId) {
			return aleGraph.nodes[i]
		}
	}
	for (var i = 0; i < lagerGraph.nodes.length; i++) {
		if (beer.styleFamilyId === lagerGraph.nodes[i].styleId) {
			return lagerGraph.nodes[i]
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
		console.log('percent: ', stylePercent); 
		console.log('listlength: ', listLength); 
		return Math.floor(ratio * listLength * stylePercent); 
	} else {
		return Math.floor((1-ratio) * listLength / unselectedCount); 
	}
}

var avgCalculator = function(propertyArray) {
	var len = propertyArray.length; 
	return propertyArray.reduce((a,b) => a + b) / len; 
}; 

var calculateStyleCharacteristics = function (beerObject) {
	var characteristics = {}; 
	characteristics['ibu'] = stylePropertyFinder('ibu', beerObject); 
	characteristics['srm'] = stylePropertyFinder('srm', beerObject); 
 	return characteristics; 
}

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

var stylePropertyFinder = function(property, beerDataObject) {
	var min = property + 'Min'; 
	var max = property + 'Max'; 
    if (beerDataObject[min] !== undefined && beerDataObject[max] !== undefined) {
		return ( (parseFloat(beerDataObject[min]) + parseFloat(beerDataObject[max])) / 2 ); 
	} else {
		return null; 
	}
} 

var calculateComparison = function(algorithmObject, nodeObject) {
	var characteristicKeys = Object.keys(nodeObject); 
	var comparisonResult = {}; 
	comparisonResult['increase'] = []; 
	comparisonResult['decrease'] = []; 
	characteristicKeys.forEach((key) => {
		comparisonResult[key] = (algorithmObject[key] - nodeObject[key]).toFixed(2);
		var percent = (comparisonResult[key] / nodeObject[key]).toFixed(2); 
		comparisonResult[key + 'Percent'] = percent; 
		if (percent >= .15) {
			comparisonResult.increase.push(key); 
		} else if ( percent <= -.15) {
			comparisonResult.decrease.push(key);
		}
	}); 
	return comparisonResult; 
}

var calculateComparableNodes = function(comparisonObject, node) {
	var increase = comparisonObject.increase; 
	var decrease = comparisonObject.decrease;
	var comparableNodes = []; 

	increase.forEach(function(char) {
		console.log(char); 
		if (char === 'ibu') {
			comparableNodes.push(node.moreIBU.styleId || null); 
		} else {
			comparableNodes.push(node.moreSRM.styleId || null); 
		}
	}); 

	decrease.forEach(function(char) {
		if (char === 'ibu') {
			comparableNodes.push(node.lessIBU.styleId || null); 
		} else {
			comparableNodes.push(node.lessSRM.styleId || null); 
		}
	}); 

	return comparableNodes; 
}

var calculatePrimaryCategory = function(beerListStylesId) {
	var categoryCount = {}; 
	categoryCount['max'] = 0; 
	categoryCount['maxStyle'] = undefined; 
	beerListStylesId.forEach((style) => {
		categoryCount[style] = categoryCount[style] + 1 || 1; 
		if (categoryCount[style] > categoryCount['max']) {
			categoryCount['max'] = categoryCount[style]; 
			categoryCount['maxStyle'] = style; 
		}; 
	}); 
	return categoryCount['maxStyle'] || beerListStylesId[0]; 
}

var calculateSearchCategoryScores = function (overLapScoresObject, similarNodes) {
	if (!similarNodes) {
		return calculateTopValues(overLapScoresObject); 
	} else {
		similarNodes.forEach((node) => {
			overLapScoresObject[node] = overLapScoresObject[primaryCategory]; 
			// beerListStylesId.push(node); 
		}); 
		return calculateTopThree(overLapScoresObject); 
	}
}; 

var calculateTopThree = function (object) {
	var resultObject = {}; 
	var sortedArray = []; 
	var keys = Object.keys(object); 
	keys.forEach((key) => {
		sortedArray.push([key, object[key]]); 
	}); 
	sortedArray.sort(function(a,b) {
		return a[1] - b[1]; 
	}); 
	resultObject[1] = sortedArray[sortedArray.length - 1]; 
	resultObject[2] = sortedArray[sortedArray.length - 2]; 
	resultObject[3] = sortedArray[sortedArray.length - 3]; 
	resultObject['total'] = resultObject[1][1] + resultObject[2][1] + resultObject[3][1]; 
	return resultObject; 
}

var convertToCount = function (categoryObject, totalCountList) {
	var total = categoryObject.total; 
	delete categoryObject.total; 
	var keys = Object.keys(categoryObject); 
	var resultObject = {}
	keys.forEach((key) => {
		resultObject[categoryObject[key][0]] = Math.floor( (categoryObject[key][1] / total) * totalCountList);  
	}); 
	return resultObject; 
}

var algorithmSelectionsPerStyle = function (categoryCountObject, beerListStylesId) {
	var selectionsPerStyleId = {}; 
	var allStyleFamilies = []; 
	var unselected = 0; 
	var total = 0; 
	var preferredStyleIds = beerListStylesId.slice(); 
	var result = {}; 

	// This is to add the values that we are looking for to the preferredStyles so they will receive more distribution. 
	var keys = Object.keys(categoryCountObject); 

	keys.forEach((key) => {
		if (preferredStyleIds.indexOf(key) === -1) {
			preferredStyleIds.push(parseInt(key)); 
		} 
	}); 

	keys.forEach((key) => {
		selectionsPerStyleId[key] = singleStyleCalculator(key, categoryCountObject[key], preferredStyleIds); 
	}); 

	keys.forEach((key) => {
		_.extend(result, selectionsPerStyleId[key]);
	}); 

	return result; 
}

var singleStyleCalculator = function (styleId, totalCountForList, preferredStyleIds) {
	var selectedRatio = .75; 
	var unselectedRatio = .25; 
	var selectionsPerStyleId = {}; 
	var unselected = 0; 
	var total = 0; 
	var styleFamily = styleFamilies[styleId]; 

	var preferredInCategory = []; 

	preferredStyleIds.forEach(function(styleId) {
		if (styleFamily.indexOf(styleId) !== -1) {
			preferredInCategory.push(styleId); 
		}
	}); 

	preferredInCategory.forEach((style) => {
		selectionsPerStyleId[style] = selectionsPerStyleId[style] + 1 || 1;
		total++;  
	}); 

	styleFamily.forEach((style) => {
		if (selectionsPerStyleId[style] === undefined) {
			selectionsPerStyleId[style] = 0; 
			unselected++; 
		}; 
	}); 

	var styleKeys = Object.keys(selectionsPerStyleId); 
	styleKeys.forEach((key) => {
		var styleCount = selectionsPerStyleId[key]; 
		var stylePercent = styleCount / total; 
		var test = selectionPerStyleCalculator(stylePercent, totalCountForList, selectedRatio, unselected);
		selectionsPerStyleId[key] = test; 
	}); 

	return selectionsPerStyleId; 

}

module.exports = algorithm; 