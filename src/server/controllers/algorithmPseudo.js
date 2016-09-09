// Cases: 

// 1. One Graph Node - One Category - Many Beers (Easy)

// 2. Many Graph Nodes (1 Step) - Many Beers (Medium)

// 2.5 Many Graph Nodes (1 Step) - Many Beers (Medium)

// 3. Many Graph Nodes (2+ Steps) - Many Beers (Hard)


// Step 1. Determine the Specific Case: 

// Step 2. Calculate Query String Values 
	// -> Weighted preference for results based on styleIds from beer list 
	// -> averageABV 
	// -> averageIBU
	// -> averageSRM

// Step 3. Return Algorithm Profile Object 
	//-> Send back the result of running the case 1 algorithm. 

/////
// NOTE ABOUT THE PREFERENCE 
///////


// Weighted preference: We want a higher prevalence of more commonly selected beers 
// while still exposing the user to some new beers. 
// Previously selected styleIds get x % of the list, while unselected styleIds get 1-x %

// With a total recommendation list length of 15:
// We would transform an array of counts: 
	selections = {
		style1: 2, 
		style2: 1,
		style3: 1,
		style4: 1,
		style5: 0
	}

// Into an array of results in list that we ultimately select one beer from: 
// By using Math.floor, we never ask for something larger than our list: 
	selections = {
		style1: 4, 
		style2: 2,
		style3: 2,
		style4: 2,
		style5: 1
	}


