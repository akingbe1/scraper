//Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
//Requiring the Note and Article models
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");
// Our Scraping Tools
var request = require("request");
var cheerio = require("cheerio");
//Set mongoose to leverage built in Javascript ES6 promises
mongoose.Promise = Promise;


//Initialize Express
var app = express();

// Use Morgan and Body Parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(bodyParser.json());


// Make public a static dir
app.use(express.static("public"));

// Database configuration with mongoose
mongoose.connect("mongodb://localhost/scraper");
var db = mongoose.connection;

//Show any mongoose errors
db.on("error", function(error) {
	console.log("Mongoose Error: ", error);
});

// Once logged into the db through mongoose, log a success message
db.once("open", function() {
	console.log("Mongoose connection successful.")
});


// Routes
// ======

// A GET request to scrape the NY Times website
app.get("/scrape", function(req, res) {

	// First we grab the body of the html with request
	request("http://www.nytimes.com/", function(error, response, html) {
		//Then, we load that into cheerio and save it to $ for a shorthand selector
		console.log("made request with cheerio")

		var $ = cheerio.load(html);
		//Now, we grab every h2 within an article tag, and do the following:
		$("h2.story-heading").each(function(i, element) {
			// var a = $(this).prev();
			console.log("iterating through h2")
			//Save an empty result object
			var result = {};

			//Add the text and href of every link, and save them as properties of the result object
			result.title = $(this).children("a").text(); 
			result.link = $(this).children("a").attr("href");

			if (typeof(result.title) === "string" && typeof(result.link) === "string")
			{
				//Using our Article model, create a new entry
				//This effectively passes the result object to the entry (and the title and link)
				var entry = new Article(result);

				//Now, save that entry to the db
				entry.save(function(err, doc) {
					//Log any errors
					if(err) {
						console.log(err);
					}
					// Or log the doc
					else {
						console.log(result);
					}
				})
			}

		})
	});
	// Tell the browser that we finished scraping the text
	res.send("Scrape Complete");
});

//This will get the articles we scraped from the MongoDB
app.get("/articles", function(req, res) {
	//Grab every doc in the Articles array
	Article.find({}, function(error, doc) {
		// Log any errors
		if (error) {
			console.log(error);
		}
		// Or send the doc to the browser as a json object
		else {
			res.json(doc)
		}
	});
});

// Grab an article by its ObjectId
app.get("/articles/:id", function(req, res) {
	// Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
	Article.findOne({ "_id": req.params.id })
	// ..and populate all of the notes associated with it
	.populate("note")
	// now, execute our query
	.exec(function(error, doc) {
		// Log any errors
		if (error) {
			console.log(error);
		}
		// Otherwise, send the doc to the browser as a json object
		else {
			res.json(doc);
		}
	});
});


// Create a new note or replace an existing note
app.post("/articles/:id", function(req, res) {
	// Create a new note and pass the req.body to the entry
	var newNote = new Note(req.body);

	// And save the new note to the db
	newNote.save(function(error, doc) {
		// Log any errors
		if (error) {
			console.log(error);
		}
		// Otherwise
		else {
			// Use the article id to find and update its note
			Article.findOneAndUpdate({ "_id": req.params.id }, { "note": doc._id })
			// Execute the above query
			.exec(function(err, doc) {
				// Log any errors
				if (err) {
					console.log(err);
				}
				else {
					// Or send the document to the browser
					res.send(doc);
				}
			});
		}
	});
});


// Delete the note from mongodb
app.get('/delete/:id', function(req, res) {
  // delete a note by the objectID
  db.notes.remove({
    "_id": mongojs.ObjectID(req.params.id)
  }, function(err, deleted) {
    // log the errors
    if (err) {
      console.log(err);
      res.send(err);
    } 
    // or send the response to the browser.
    else {
      console.log(deleted);
      res.send(deleted);
    }
  });
});

// Listen on port 3000
app.listen(3000, function() {
	console.log("App running on port 3000!");
});

