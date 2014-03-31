// data about our beers
// beers is a list of objects - each one is a beer
// tapList is an array of integers - each one is a single tap - each number indexes into the beer list for what is on that tap
var beerData = {
  options : { },
  beers : [ ],
  tapList : [ ]
};

var defaultBeerData = {
      options : { },
      beers : [ { name : "Beer", img : "beer-img.png" } ],
      tapList : [ 0, 0, 0 ]
};

// if our data is corrupted, this resets it to a basic beer and no tap list
var resetData = function() {
    // reset beer and taplist
    beerData = defaultBeerData;
}

/**
 * Initialize the web application.  Check to see if we're just got back from DropBox authentication, and then load the data.
 */
var init = function() {
    DropBox.init(editDropBox);
    loadData(render);
}

/**
 * Save the current set of data.  Both in Local Storage, as well as in DropBox if we are setup for that.
 */
var saveData = function() {
    var jsonString = JSON.stringify(beerData);
    localStorage.setItem("beerData", jsonString);
    DropBox.save("default", jsonString);
}

/**
 * Update the dialog of dropbox options based on our current state
 */
var updateDropBoxDialog = function() {
    if (DropBox.isConnected()) {
	$('#connectDropBoxBtn').prop('disabled', true);
	$('#disconnectDropBoxBtn').prop('disabled', false);
    } else {
	$('#connectDropBoxBtn').prop('disabled', false);
	$('#disconnectDropBoxBtn').prop('disabled', true);
    }
}

/**
 * Updates the dropbox dialog, save the state that it is showing, and displays
 * the dropbox dialog
 */
var editDropBox = function() {
    localStorage.setItem("connecting-to-dropbox", true);

    updateDropBoxDialog();
    $('#edit-drop-box').modal('show');
}

/**
 * Closes the dropbox dialog, and then attemps to load data from dropbox.
 */
var closeDropBox = function() {
    localStorage.setItem("connecting-to-dropbox", false);
    $('#edit-drop-box').modal('hide');
    DropBox.load("default", setBeerDataFromString, render);
}

// checks to see if the beer data is in the right structure
var beerDataValid = function(beerDataObject) {
    if (beerDataObject == undefined)
	return false;

    if (beerDataObject.beers == undefined || beerDataObject.tapList == undefined || beerDataObject.options == undefined)
	return false;
    
    if (beerDataObject.beers[0] == undefined || beerDataObject.tapList[0] == undefined) {
	return false;
    }
    return true;

}

// sets the beer data object from a string
// makes sure that the entire object is loaded.
var setBeerDataFromString = function(beerDataString) {
    var beerDataObject = JSON.parse(beerDataString);
    if (beerDataValid(beerDataObject)) {
        beerData = beerDataObject;
    }
}

// loads the data, and trys to make sure its valid
// if the data doesn't exist, or if its invalid, sets our beer to our default data
var loadData = function(render) {
    try {
	resetData();
	
	var beerDataTemp = localStorage.getItem("beerData");
	if (beerDataTemp) {
	    setBeerDataFromString(beerDataTemp);
	}

	DropBox.load("default", setBeerDataFromString, render);
  } catch (err) {
    // our beer data is already reset, don't worry about it
  }
}

/**
 * Updates our edit beer dialog with the given beer and index
 * @param beer the beer object to update the edit box with
 * @param index the index of the beer object in the beer list
 */
var updateEditBeer = function(beer, index) {
    $('#editBeerName').val(beer.name);
    $('#editBeerStyle').val(beer.style);
    $('#editBeerImg').val(beer.img);
    $('#editBeerLongDescription').val(beer.longDescription);
    $('#editBeerABV').val(beer.abv);
    $('#editBeerIBU').val(beer.ibu);
    $('#editBeerIndex').val(index);
}

/**
 * Creates a new beer object from the values in the edit box
 * @return beer object
 */
var getBeerFromEdit = function() {
    var beer = {};

    beer.name = $('#editBeerName').val();
    beer.style = $('#editBeerStyle').val();
    beer.img = $('#editBeerImg').val();
    beer.longDescription = $('#editBeerLongDescription').val();
    beer.abv = $('#editBeerABV').val();
    beer.ibu = $('#editBeerIBU').val();
    return beer;
}

/**
 * Shows the edit beer dialog, editing the beer at the given index
 * @param beerIndex the index of the beer to edit
 */
var editBeer = function(beerIndex) {
    var beer = beerData.beers[beerIndex];
    updateEditBeer(beer, beerIndex);
    $('#edit-beer').modal('show');
}

/**
 * Sets up the edit box with a new beer.  Shows the edit box
 * The beer won't be added until the save button is pushed
 */
var addBeer = function() {
    var beer = { name : "New Beer" };

    updateEditBeer(beer, beerData.beers.length);
    $('#edit-beer').modal('show');
}

/**
 * Updates our edit beer dialog with the given beer and index
 * @param beer the beer object to update the edit box with
 * @param index the index of the beer object in the beer list
 */
var updateEditOptions = function(options) {
    $('#editNumTaps').val(options.numTaps);
    $('#editOpenKeyValKey').val(options.openKeyValKey);
}

/**
 * Creates a new beer object from the values in the edit box
 * @return beer object
 */
var getOptionsFromEdit = function() {
    var options = {};

    options.numTaps = $('#editNumTaps').val();
    options.openKeyValKey = $('#editOpenKeyValKey').val();

    return options;
}

/**
 * take any options setup and update the other data structures
 * right now, this just makes the the taps array the same size as numTaps
 */
var updateOptions = function() {
    var numTaps = beerData.options.numTaps;
    var oldTaps = beerData.tapList.length;
    if (numTaps > oldTaps) {
        for (var i = 0 ; i < numTaps - oldTaps ; i++) {
            beerData.tapList.push(0);
	}
    } else if (oldTaps > numTaps) {
        beerData.tapList.splice(numTaps, oldTaps - numTaps);
    }
}

/**
 * Saves the options
 */
var saveOptions = function() {
    beerData.options = getOptionsFromEdit();
    updateOptions();
    saveData();
    render();
    $('#edit-options').modal('hide');
}

/**
 * Edit the options - show the modal
 */
var editOptions = function() {
    var options = beerData.options;
    if (options == undefined)
	options = {};

    updateEditOptions(options);
    $('#edit-options').modal('show');
}

var updateEditTapList = function() {
  $('#tap-list-selects').empty();

  var selectOptions = "";
  $.each(beerData.beers, function(key, val) {
    var beer = val;
    var beerIndex = key;
    selectOptions += '<option value="' + beerIndex + '">' + beer.name + '</option>' + "\n";
  });
  
  $.each(beerData.tapList, function(key, val) {
    var beer = beerData.beers[val];
    $('<div class="form-group"> \
         <label for="tap' + key + 'beerIndex">Tap ' + ( key + 1 ) + '</label> \
         <select id="tap' + key + 'beerIndex" class="form-control">' + selectOptions + '\
         </select> \
       </div>').appendTo('#tap-list-selects');
  });

  $.each(beerData.tapList, function(key, val) {
    $('#tap' + key + 'beerIndex').val(beerData.tapList[key]);
  });
}

var getTapListFromForm = function() {
  var newTapList = [];
  $.each(beerData.tapList, function(key, val) {
    newTapList[key] = $('#tap' + key + 'beerIndex').val();
  });
  return newTapList;
}

var saveBeer = function() {
    beer = getBeerFromEdit();
    beerData.beers[$('#editBeerIndex').val()] = beer;
    saveData();
    render();
    $('#edit-beer').modal('hide');
}

var deleteBeer = function(key) {
    beerData.beers.splice(key, 1);
    saveData();
    render();
}

var editTapList = function() {
    updateEditTapList();
    $('#edit-tap-list').modal('show');
}

var saveTapList = function() {
    beerData.tapList = getTapListFromForm();
    saveData();
    render();
    $('#edit-tap-list').modal('hide');
}

var render = function() {
  $('#beers').empty()
  $.each(beerData.tapList, function(key, val) {
    var beer = beerData.beers[val];
    if (beer == undefined) {
      beer = {};
    }
    var source   = $("#beer-tap-template").html();
    var template = Handlebars.compile(source);
    var context = { index : val, beer : beer };
    var html = template(context);

    $(html).appendTo('#beers');
  });

  $('#beer-detail').empty()
  $.each(beerData.beers, function(key, val) {
    var source   = $("#beer-detail-template").html();
    var template = Handlebars.compile(source);
    var context = { index : key, beer : val };
    var html = template(context);
    $(html).appendTo('#beer-detail');
  });
}
