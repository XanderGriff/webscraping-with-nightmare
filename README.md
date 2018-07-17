# Webscraping with Nightmare

## Installation Instructions

1. Ensure you have the latest version of NPM (v6.2.0) and Node.js (v10.6.0) installed 
2. Clone files from Github repo
3. Navigate to the downloaded directory in your terminal
4. (Optional) Delete the included output.csv file if you want to see the script to generate a new file
4. Run the following commands:
     - ```npm install```
     - ```node --experimental-modules main.mjs```
5. Navigate to the generated output.csv and open to confirm results

## Working Notes

### Intro

I started these notes to keep track of the development process for this assessment. While I have modest experience with webscraping projects, I haven't done webscraping using Nightmare.js, or a headless browser for that matter, so these notes 
also track my learning throughout the development.

While these notes may provide insight into how the development went, they are by no means necessary to understanding the
functionality of the code and, given a time-crunch, they can be eschewed in favour of the in-code documentation. If you've 
got the time, though, I hope these notes provide wider context and insight into my development process. 

###	Preparation

Looking over the assignment instructions, my first step was to outline exactly what the assignment requirements were.
Below are the rough steps for the assignment, broken down into more granular steps from the provided instructions:

#### Steps:
1. Navigate to https://www.google.com
2. Type "datatables" into the Google search bar
3. Click the search button
4. Navigate to the link from the results for https://datatables.net
5. Fetch the data from the table on the datatables homepage
6. Map each col to an object property 
7. Insert each of the objects into an array
8. Export the array as a .csv file

Although there were starter problems provided to scaffold up to the main task, I planned on using them as reference in 
case of a hiccup along the dev process rather than as prescriptive tasks. Thus, time to start with the problem!

As mentioned, this was my first experience with Nightmare.js, so my first inclination was to search out the docs.
I found the docs [here](https://github.com/segmentio/nightmare). After reading over the docs and some of the linked matierals 
to learn about some of Nightmare's capabilities, I wanted to familiarize myself with the tool in a practical sense. Under 
the Usage heading in the docs, I followed the setup steps to test a provided script to scrape CNN's site for its title.

The provided script was as follows:

```javascript
import Nightmare from 'nightmare';

const nightmare = Nightmare();

nightmare.goto('http://cnn.com')
  .evaluate(() => {
    return document.title;
  })
  .end()
  .then((title) => {
    console.log(title);
  })
```

However, after following all the instructions, I received an error message rather than the expected output. After doing
some quick StackOverflowing, I realized that ES6 wasn't natively supported in most stable release of Node (v10.6.0), so 
Node was having issues with the ES6 style import statement. While I could have solved the support issue using a transpiler
like babel, recent StackOverflow responses pointed out that ES6 support is being currently in being developed for Node, and
that it was actually already available as an experimental feature in the most stable release(!). For the scope of this 
project (ie. not production code), I figured trying this support out would be a relatively safe experiment. The docs 
outlining its use can be found [here](https://nodejs.org/dist/latest-v9.x/docs/api/all.html#esm_enabling), but it came down 
to two simple steps:

1. Change the file extension of the script from .js to .mjs to indicate its experimentality
2. Run the script with the --experimental-modules flag

After implementing the changes, the script ran as expected, printing "CNN - Breaking News, Latest News and Videos" to the
console.

With the test script succeeding, I wanted to confirm that exporting to CSV worked fine. I added a Node module to write
CSV files called "csv-write-stream" after doing some looking (the package seemed sensibly lightweight and 
well-maintained), modified the CNN script, and ran it to make sure it was all working. The modified script can be found
below: 

```javascript
// Imports
import Nightmare from 'nightmare';
import fs from 'fs';
import csvWriter from 'csv-write-stream';

// Package Definitions
const writer = csvWriter();
const nightmare = Nightmare();

nightmare.goto('http://cnn.com')
  .evaluate(() => {
    return document.title;
  })
  .end()
  .then((title) => {
    writer.pipe(fs.createWriteStream('output.csv'));
    writer.write({title: title});
    writer.end();
  })
```

With a CSV file successfully exported as expected, it seemed reasonable to move on to the task at hand! :)

###	Working Notes

With the dev environment set up, I could get started with the given task. Having laid out the steps necessary, it
was a matter of translating each of the steps into working code.

The first step involved navigating to Google and searching for "datatables" in the query bar. Based on the Nightmare
documentation, this was a relatively trivial task. With Nightmare's show property set to true for debugging purposes,
I was able to confirm that the scraper was behaving as planned, typing in the search query and clicking on the search
button to query results from Google. 

At this point, with the Google search page loaded with results, I turned to my web browser to inspect the elements to
look for a pattern in the results. I found that all results were contained in a div with a class "rc" and all links
were contained in an <a> element encapsulated by an \<h3> element of class "r". After playing around with it a little,
I found that selecting the first element in an array produced by querySelectorAll('h3.r > a') reliably resulted in
navigating to the Datatables website. However, I wanted to see if I could make the tool slightly more flexible to
handle if, say, the link was the second result rather than the first. To do so, I used a filter function on the
array, filtering on the href property's equality to the specified url.

With the navigation to the Datatables site working, the next step was to grab all the data from the table on the
page. My first idea to accomplish this task involved looping through a process that grabbed the data and clicked 
the "Next" button 	until all the results were grabbed. However, looking at the table options, I found that if
you changed the settings to show 100 entries, you could do it all in one go. Given this situation, the next
step was doing just that. 

That process was, again, relatively straightforward based on the documentation (I got to try out the select function),
leaving me with the task of scraping the data, placing them in objects, and writing them to a CSV. When scraping, 
I actually found a hidden column - salary - when iterating over the <th> and <td> elements. Cool stuff! 

I was able to complete the rest of the required functionality without too many hiccups, but I ran into an interesting
problem post-completion. When the functionality was all built, I tried to help with the readability of the code
by defining constants for some of the more obfuscating selectors, but encountered I thought were asynchronicity 
issues. Namely, variables would *sometimes* be considered undefined and *sometimes* not. I was able to narrow the problem
down to the evaluate sections, and it turns out that (I think based on testing) it had to do with the changes of function
scope from the headless browser to the Node environment and vice versa rather than the synchronicity of the program's 
statement evaulation. I've tested the script and it ran 20 out of 20 times correctly, but I'm admittedly a little fuzzy 
on the nuances of Javascript's, and more specifically Nightmare's, 	execution behaviour in some more complex situations. 
I've been doing some reading on the subject since then, but would love to chat further on the subject - sometimes a 
10min sitdown with someone who knows and can explain well is worth hours of individual research. Anyhow, with a 
working script ready, it was time to compile everything and ship it off!

###	Conclusions

With the task complete, I took some time to review the code and ensure everything was as readable as possible 
(while I try to make things readable during the dev process, another once-over afterwards never hurts). I then put
together the installation instructions that are found at the top of this doc, uploaded to Github, tested 
the install instructions on a clean download, and sent it off :) I hope you've enjoyed reading! 
