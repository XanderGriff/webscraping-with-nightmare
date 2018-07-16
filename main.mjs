// Imports
import Nightmare from 'nightmare';
import fs from 'fs';
import csvWriter from 'csv-write-stream';

// Package Definitions
const writer = csvWriter();
const nightmare = Nightmare({ show: true });

// Constant Definitions
const GOOGLE = 'https://www.google.com';
const QUERY = 'datatables';
const SEARCHBAR = 'input[id="lst-ib"]';
const SEARCHBUTTON = 'input[value="Google Search"]';
const SEARCH_RESULT_ID = 'h3.r > a';
const DATATABLES_LINK = 'https://datatables.net/';

nightmare
	// Navigate to Google
	.goto(GOOGLE)
	.then( () => {
		console.log("Navigated to Google...");
	})
	// Type in the query into the searchbar and click the search button
	.then( () => {
		return nightmare
			.type(SEARCHBAR, QUERY)
			.click(SEARCHBUTTON)
	})
	.then( () => {
		console.log("Searched...");
	})
	// Aggregate search results and click on datatables.net link
	.then( () => {
		return nightmare
			.wait('h3.r > a')
			.evaluate( () => {
				// filter results based on css selectors to choose link with proper url
				// indexed at 0 to access element from single-element array produced in above instruction
				let datatables_link = (Array.from(document.querySelectorAll('h3.r > a'))).filter(a => a.href === "https://datatables.net/")[0];
				datatables_link.click();
			})
	})
	.then( () => {
		console.log("Navigated to Datatables site...");
	})
	// Retrieve data from Datatables site
	//.then( () => {
	//	return nightmare
	//		.
	//})
	.then( () => {
		return nightmare
			.wait(20000)
			.end();
	})
	.then( () => {
		console.log("Done");
	});


/*
let foo = "placeholder";

for(i = 0; i < search_results.length; i++){
	if(search_results.href == "https://datatables.net/"){
		console.log(search_results.href);
		foo = search_results.href;
	}
}
*/

/*
	.wait(SEARCHBAR)
	.type(SEARCHBAR, QUERY)
	.click(SEARCHBUTTON)
	.evaluate(() => {
		return document.title;
	})
*/

// EXPORT AS CSV
/*
	writer.pipe(fs.createWriteStream('output.csv'));
	writer.write({title: title});
	writer.end();
*/