// Require Mongoose
var mongoose = require("mongoose");
// create the schema class
var Schema = mongoose.Schema;

// create article schema
var ArticleSchema = new Schema({
	// title is a required string
	title: {
		type: String,
		required: true
	},
	//link is a required string
	link: {
		type: String,
		required: true
	},
	// This will save one note's ObjectId, ref refers to the Note model
	note: {
		type: Schema.Types.ObjectId,
		ref: "Note"
	},
});

//Create Article model with the ArticleSchema
var Article = mongoose.model("Article", ArticleSchema);

//Export the Article model
module.exports = Article;