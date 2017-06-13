// Grab article in json format
$.getJSON("/articles", function(data) {
	// For each one
	for (var i = 0; i < data.length; i++) {
		// Display the apropos information on the page
		$("articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");

	}
});

//whenever someone clicks a p tag
$(document).on("click", "p", function() {
	//Empty the notes from the notes section
	$("#notes").empty();
	//Save the id from the p tag
	var thisId = $(this).attr("data-id");

	//Now make the ajax call for the article
	$.ajax({
		method: "GET",
		url: "/articles/" + thisId
	})

	  //With that done, add the note information to the page
	  .done(function(data) {
	  	console.log(data);
	  	// The title of the article
	  	$("#notes").append("<h2>" + data.title + "</h2>");
	  	// And input to enter a new title
	  	$("#notes").append("<input id='titleinput' name='title' >");
	  	// A textarea to add a new note body
	  	$("#notes").append("<textarea id='body input' name='body'></textarea");
	  	// A button to submit a new note, with an id of the article saved to it
	  	$("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

	  	//If there's a note in the article
	  	if (data.note) {
	  		//Place the title of the note int eh title input
	  		$("#titleinput").val(data.note.title);
	  		//Place the body of the note in the body textarea
	  		$("#bodyinput").val(data.note.body);
	  	}
	  });
});

//When you click the savenote button
$(document).on("click", "#savenote", function() {
	//Grab the id associated with the article from the submit button
	var thisId = $(this).attr("data-id");

	//Run a POST request to change the note, using what's entered in the inputs
	$.ajax({
		method: "POST",
		url: "/articles/" + thisId,
		data: {
			//Value taken from title input
			title: $("#titleinput").val(),
			// Value taken from note textarrea
			body: $("#bodyinput").val()
		}
	})
		//With that done
		.done(function(data) {
			//Log the response
			console.log(data);
			// Empty the notes section
			$("#notes").empty();
		});

		//Also, remove the values entered in the input and textarea for the note entry
		$("#titleinput").val("");
		$("#bodyinput").val("");
})