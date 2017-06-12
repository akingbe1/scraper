// Require Mongoose
var mongoose = require("mongoose");
//Create a schema class
var Schema = mongoose.Schema;

// create the note schema
var NoteSchema = new Schema({
	// Just a string
	title: {
		type: String
	},
	// Just a string
	body: {
		type: String
	}
});

// Remember, Mongoose will automatically save ObjectIds of the notes
// The Ids are referred to in the Article model

//Create the note model with the NoteSchema
var Note = mongoose.model("Note", NoteSchema);

// Export the Note model
module.exports = Note;