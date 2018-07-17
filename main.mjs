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
const DATATABLES_SIZE_SELECTOR = 'select[name="example_length"]';
const DATATABLES_DATA_SELECTOR = 'table#example tr';

function datatablesScraper() {
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
				.click(SEARCHBUTTON);
		})
		.then( () => {
			console.log("Searched...");
		})
		// Aggregate search results and click on datatables.net link
		.then( () => {
			return nightmare
				.wait(SEARCH_RESULT_ID)
				.evaluate( (SEARCH_RESULT_ID, DATATABLES_LINK) => {
					// filter results based on css selectors to choose link with proper url
					// indexed at 0 to access element from single-element array produced in above instruction
					(Array.from(document.querySelectorAll(SEARCH_RESULT_ID))).filter(a => a.href === DATATABLES_LINK)[0].click();
				}, SEARCH_RESULT_ID, DATATABLES_LINK);
		})
		.then( () => {
			console.log("Navigated to Datatables site...");
		})
		// Adjust datatable to show all entries
		.then( () => {
			return nightmare
				.wait(DATATABLES_SIZE_SELECTOR)
				.select(DATATABLES_SIZE_SELECTOR, 100);
		})
		.then( () => {
			console.log("Adjusted table to show all entries...");
		})
		// Retrieve values from datatable
		.then( () => {
			return nightmare
				.evaluate( (DATATABLES_DATA_SELECTOR) => {
					let table_rows = Array.from(document.querySelectorAll(DATATABLES_DATA_SELECTOR));

					// delineate between keys and vals from retrieved table data
					let table_keys_row = Array.from((table_rows[0]).querySelectorAll('th')).map(e => e.innerHTML); //array of strings
					let table_data_rows = table_rows.slice(1,58); //array of arrays of HTML elements

					let array_of_row_objects = [];
					let row_object = {};
					let formatted_values = [];

					table_data_rows.forEach( row => {
						// grab innerHTML from each element in the row
						formatted_values = Array.from(row.querySelectorAll('td')).map(e => e.innerHTML);

						// place each of the element values in an object with each value associated with its respective key 
						row_object = {};
						for(i = 0; i < table_keys_row.length; i++) {
							row_object[table_keys_row[i]] = formatted_values[i];
						}

						array_of_row_objects.push(row_object);
					})

					return array_of_row_objects;
				}, DATATABLES_DATA_SELECTOR)
				.then( result => {
					console.log("Retrieved values from datatable...");

					// Write to CSV
					writer.pipe(fs.createWriteStream('output.csv'));
					result.forEach( obj => {
						writer.write(obj);
					});
					writer.end();

					console.log("Wrote values to CSV...")
				})
		})
		.then( () => {
			// close headless browser session
			return nightmare.end();
		})
		.then( () => {
			console.log("Done :)");
		});
}

datatablesScraper();