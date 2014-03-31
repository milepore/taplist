var DropBox = {

    dropBoxClient : undefined,
    dropBoxConnected : false,

    /**
     * Initialize the dropbox connection.
     * Try and authenticate, and if that works, great.
     * If we were redirected here from dropbox in the middle of authentication,
     * show the dropbox options box again.
     */
    init : function(initCallback) {
	if (this.dropBoxClient != undefined)
	    return;

	this.dropBoxClient = new Dropbox.Client({key: "dcjo9zsy0hrtkkz"});

	// Try to finish OAuth authorization.
	this.dropBoxClient.authenticate({interactive: false}, function (error) {
	    if (error) {
		this.dropBoxConnected = false;
	    }
	});
	
	this.checkConnection();
	if (localStorage.getItem("connecting-to-dropbox") == true) {
	    initCallback();
	}
    },

    /**
     * If we are not connected to dropbox, then connect.  If we are already connected, then noop
     */
    connectToDropBox : function() {
	if (!this.dropBoxConnected) {
	    this.dropBoxClient.reset();
	    this.dropBoxClient.authenticate();
	}
	
	this.checkConnection();
    },

    /**
     * Checks to see if dropbox is connected or not.
     */
    checkConnection : function() {
	if (this.dropBoxClient.isAuthenticated()) {
	    this.dropBoxConnected = true;
	} else {
	    this.dropBoxConnected = false;
	}
    },

    /**
     * Disconnect dropbox
     */
    disconnectFromDropBox : function() {
	if (this.dropBoxConnected) {
	    this.dropBoxClient.signOut({ mustInvalidate : true }, function() {
		this.checkConnection();
	    });
	}
    },
    

    isConnected : function() {
	this.checkConnection();
	return this.dropBoxConnected;
    },


    /**
     * Saves the current set of beer data in dropbox, under the selected tap name
     */
    save : function(tapName, string) {
	if (!this.dropBoxConnected)
	    return;
	
	var datastoreManager = this.dropBoxClient.getDatastoreManager();
	datastoreManager.openDefaultDatastore(function (error, datastore) {
	    if (error) {
		alert('Error opening default datastore: ' + error);
		return;
	    }
	    
	    alert("OPEN");
	    var tapTable = datastore.getTable('taps');
	    var storedTapList = tapTable.query({name : "tapName"});
	    if ((storedTapList.length >= 1) || (storedTapList[0] != undefined)) {
		storedTapList[0].set('value',string);
	    } else {
		tapTable.insert({name : tapName, value :string});
	    }
	    alert("CLOSING");
	    datastore.close();
	});
    },


    load : function(location, dataSetCallback, render) {
	if (!this.dropBoxConnected) {
	    render();
	    return;
	}
	
	var datastoreManager = this.dropBoxClient.getDatastoreManager();
	datastoreManager.openDefaultDatastore(function (error, datastore) {
	    if (error) {
		alert('Error opening default datastore: ' + error);
		render();
		return;
	    }

	    alert("OPEN");
	    var tapTable = datastore.getTable('taps');
	    var storedTapList = tapTable.query({name : "tapName"});
	    if ((storedTapList.length >= 1) || (storedTapList[0] != undefined)) {
		var beerDataString = storedTapList[0].get('value');
		dataSetCallback(beerDataString);
		setBeerDataFromString(beerDataString);
	    }
	    alert("CLOSING");
	    datastore.close();
	    render();
	});
    }

};
