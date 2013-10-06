/*globals document, Audio, navigator */
var MallardMayhem = MallardMayhem || {};

(function () {
    "use strict";

    /**********************************
     * MallardMayhem
     ***/
    MallardMayhem = function () {

        // Self decloration for sub function referencing
        var self = this;

        // General DOM element assignment
        this.stage      = document.getElementsByTagName('body')[0];
        this.startBtn   = document.getElementById('beginRound');
        this.cursor     = document.getElementById('cursor');

        // Maximum number of ducks allowed on screen
        this.duckLimit = 99;

        // The placeholder of the duck objects within the game
        this.ducks = [];

        // The distance to travel on each frame
        this.animationStep = 3;

        // Equating to what amounts to the frame rate
        this.animationSpeed = (1000 / 30);

        // Placeholder for loading sounds into
        this.sounds = {};

        // The game score variables
        this.score = {
            ducks   : 0, // The amount of ducks the player has gone through
            hits    : 0, // The amount of hits the playr has had
            shots   : 0  // The amount of shots the player has taken
        };

        // DOM elements of the score board and control
        this.scoreBoard = {
            container   : document.getElementById('scoreboard'),
            actionBtns  : document.getElementById('gameControls'),
            gameType    : document.getElementById('gameType'),
            ducks       : document.getElementById('totalDucks'),
            hits        : document.getElementById('totalHits'),
            shots       : document.getElementById('totalShots')
        };

        // Get a random coordinate within the stage
        this.randomCoord = function () {

            // The width of the stage as the maximum
            var maxX = self.stage.offsetWidth,

                // The height of the stage minus a portion for the ground
                maxY = self.stage.offsetHeight - 120,

                // Top left for the min values
                minX = 0,
                minY = 0,

                // Placeholders for the coords
                coordX,
                coordY;

            // Capture a random value for both X and Y
            coordX = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
            coordY = Math.floor(Math.random() * (maxY - minY + 1)) + minY;

            // Return an array with the 2 coords
            return [coordX, coordY];

        };

        // Return a random string for the unique ID
        this.generateRandomString = function () {
            var name = '', i;
            for (i = 0; i < 5; i = i + 1) {
                name += ("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789").charAt(Math.floor(Math.random() * ("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789").length));
            }
            return name;
        };

        // Ensure that the duck exists and return it if so
        this.validateDuck = function (duckOptions) {
            var d, checkID;

            // Depending on the provided type, capture the ID passed
            switch (typeof duckOptions) {
            case 'string':
                // String values just get passed to the ID
                checkID = duckOptions;
                break;
            case 'function':
            case 'object':
                // Object based variables use ID
                checkID = duckOptions.id;
                break;
            }

            // If the id hasn't been captured or doesn't exist return
            if (!checkID) {
                return false;
            }

            // Check each of the ducks available
            for (d = 0; d < self.ducks.length; d = d + 1) {

                // Check the duck's ID and compair it to the provided
                if (self.ducks[d].id === checkID) {

                    // Return the duck
                    return self.ducks[d].duck;

                }

            }

            // If no match is found, return
            return false;
        };

        // Create a new duck
        this.createDuck = function () {

            // Set the duck default attributes
            var duckOptions = {

                // Generate a unique ID
                id : self.generateRandomString(),

                // Assign it a colour (Any colour so long as it's black)
                colour : 'black'

            };

            // If the duck count is at the maximum, return
            if (self.ducks.length >= self.duckLimit) {
                return;
            }

            // Append a new object to the duck array
            self.ducks.push({

                // The unique ID
                id : duckOptions.id,

                // The javascript object with the attributes
                duck : new MallardMayhem.Duck(duckOptions)

            });

            // Add a duck to all the ducks added
            self.score.ducks = self.score.ducks + 1;

            // Update the scoreboard
            self.updateScoreboard();

        };

        // Kill a specific duck from it's ID
        this.killDuck = function (duckID) {

            // Validate the duck and return it
            var duck = self.validateDuck(duckID);

            // If the duck was valid, kill it
            if (duck) {
                duck.kill();

                // Update the scoreboard
                self.score.hits = self.score.hits + 1;
                self.updateScoreboard();
            }
        };

        // Remove duck from the game
        this.removeDuck = function (duckID) {
            var d, removeDuck;

            // Loop through instead of going for the ID of the duck
            for (d = 0; d < self.ducks.length; d = d + 1) {

                // If the ID is found process it
                if (self.ducks[d].id === duckID) {

                    // Using "splice" allows us to remove it from the array as well as capture it as a variable
                    removeDuck = self.ducks.splice(d, 1);

                    // Remove the duck from the stage
                    MallardMayhem.stage.removeChild(removeDuck[0].duck.domElement);

                    // Check to see if that was the last duck
                    if (self.ducks.length === 0) {

                        // If it was the last, end the round
                        self.endRound();

                    }

                }

            }

        };

        // Update the scoreboard
        this.updateScoreboard = function () {

            // Update the DOM elements with the appropriate values
            self.scoreBoard.hits.innerHTML  = self.score.hits;
            self.scoreBoard.ducks.innerHTML = self.score.ducks;
            self.scoreBoard.shots.innerHTML = self.score.shots;

        };

        // Load a module
        this.loadModules = function (fileArray) {
            var f, dom;

            // Loop over the provided array
            for (f = 0; f < fileArray.length; f = f + 1) {

                // Create a new DOM element to contain the module script
                dom = document.createElement('script');

                // Set the source of the DOM element to the file provided
                dom.src = fileArray[f].file;

                // If there was a callback, set it to the load event of the module
                if (fileArray[f].callback) {
                    dom.onload = fileArray[f].callback;
                }

                // Append the module DOM element to the body
                document.getElementsByTagName('body')[0].appendChild(dom);
            }

        };

        // Actions performed when the player shoots
        this.playShot = function () {

            // add to the shot count
            self.score.shots = self.score.shots + 1;

            // Update the scoreboard to match the new shot
            self.updateScoreboard();

            // Reset the audio to the beginning
            self.sounds.shot.currentTime = 0;

            // Play the audio
            self.sounds.shot.play();

        };

        // Perform the setup of the game
        this.initialize = function () {

            // Capture the format of the video required for the browser
            var format = (navigator.userAgent.indexOf('Firefox') > 1) ? 'ogg' : 'mp3';

            // Load the duck module
            this.loadModules([{
                file: './mm/mm.client.duck.js'
            }]);

            // Set and load the sound files using the appropriate file format
            self.sounds = {
                shot        : new Audio('./audio/shot.' + format),
                intro       : new Audio('./audio/intro.' + format),
                endRound    : new Audio('./audio/endRound.' + format)
            };

            // Create the custom cursor tracker
            self.stage.addEventListener('mousemove', function (evt) {

                // Use a translate method of adjusting the position to be smoother and use hardware
                self.cursor.style['-webkit-transform'] = 'translate(' + (evt.pageX - 24) + 'px, ' + (evt.pageY - 24) + 'px)';
                self.cursor.style['-moz-transform'] = 'translate(' + (evt.pageX - 24) + 'px, ' + (evt.pageY - 24) + 'px)';

            });

            // Add the event listener to begin the round upon the audio stopping
            self.sounds.intro.addEventListener('ended', self.beginRound);

            // Add the event listener to show the controls upon ending the end round music
            self.sounds.endRound.addEventListener('ended', function () {
                self.scoreBoard.actionBtns.style.display = 'block';
            });

            // Begin the process of beginning the round on clicking the start button
            self.startBtn.onclick = function () {

                // Hide the controls
                self.scoreBoard.actionBtns.style.display = 'none';

                // Begin the round music
                self.sounds.intro.play();

            };

        };

        // Begin the current round of the game
        this.beginRound = function () {

            var gameType = self.scoreBoard.gameType.value,
                duckCount,
                d = 0;

            // Set the event listeners for the shots
            self.stage.addEventListener('mousedown', self.playShot);
            self.stage.addEventListener('touchstart', self.playShot);

            // Remove the cursor
            self.stage.className = 'noCursor';

            // Show the custom cursor
            self.cursor.style.display = 'block';

            // Set the round's duck count appropriate to the game type
            switch (gameType) {
            case 'extreme':
                duckCount = 50;
                break;
            case 'hard':
                duckCount = 20;
                break;
            case 'easy':
                duckCount = 1;
                break;
            default:
                duckCount = 10;
            }

            // Create a new duck per the game type quantity
            while (d < duckCount) {
                self.createDuck();
                d = d + 1;
            }
        };

        // End the current round of the game
        this.endRound = function () {

            // Remove the cursor removal class
            self.stage.className = '';

            // Hide the cursor object
            self.cursor.style.display = 'none';

            // Remove the shot event listeners
            self.stage.removeEventListener('mousedown', self.playShot);
            self.stage.removeEventListener('touchstart', self.playShot);

            // Play the end round audio
            self.sounds.endRound.play();

        };

        // Initialize the object on creation
        this.initialize();
    };

    // Create the MallardMayhem object as itself
    MallardMayhem = new MallardMayhem();

}());