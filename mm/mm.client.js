/*globals io, document, console, Audio, setTimeout */
var MallardMayhem = MallardMayhem || {};

(function () {
    "use strict";

    MallardMayhem = function () {

        var self = this;

        this.stage = null;
        this.ducks = [];
        this.server = null;
        this.stage = document.getElementsByTagName('body')[0];
        this.startBtn = document.getElementById('beginRound');
        this.duckLimit = 99;
        this.animationStep = 3;
        this.animationSpeed = (1000 / 30);
        this.sounds = {};

        this.score = {
            ducks   : 0,
            hits    : 0,
            shots   : 0
        };

        this.scoreBoard = {
            container : document.getElementById('scoreboard'),
            actionBtns: document.getElementById('gameControls'),
            ducks   : document.getElementById('totalDucks'),
            hits    : document.getElementById('totalHits'),
            shots    : document.getElementById('totalShots')
        };

        this.serverDisconnected = function () {
            var d;
            for (d = 0; d < self.ducks.length; d = d + 1) {
                self.ducks[d].flyAway();
            }
        };

        this.randomCoord = function () {
            var maxX = self.stage.offsetWidth,
                maxY = self.stage.offsetHeight,
                minX = 0,
                minY = 0,
                coordX,
                coordY;
            coordX = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
            coordY = Math.floor(Math.random() * (maxY - minY + 1)) + minY;
            return [coordX, coordY];

        };

        this.generateRandomString = function () {
            var name = '', i;
            for (i = 0; i < 5; i = i + 1) {
                name += ("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789").charAt(Math.floor(Math.random() * ("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789").length));
            }
            return name;
        };

        this.validateDuck = function (duckOptions) {
            var d, checkID;
            switch (typeof duckOptions) {
            case 'string':
                checkID = duckOptions;
                break;
            case 'function':
            case 'object':
                checkID = duckOptions.id;
                break;
            }

            if (!checkID) {
                return false;
            }

            for (d = 0; d < self.ducks.length; d = d + 1) {
                if (self.ducks[d].id === duckOptions) {
                    return self.ducks[d].duck;
                }
            }

            return false;
        };

        this.createDuck = function (duckOptions) {

            duckOptions = duckOptions || {};

            if (self.ducks.length >= self.duckLimit) {
                return;
            }

            duckOptions = {
                id : self.generateRandomString(),
                colour : 'black'
            };

            if (!self.validateDuck(duckOptions) && duckOptions.id) {

                self.ducks.push({
                    id : duckOptions.id,
                    duck : new MallardMayhem.Duck(duckOptions)
                });

                self.score.ducks = self.score.ducks + 1;
                self.updateScoreboard();

            }
        };

        this.killDuck = function (duckID) {
            var d;
            for (d = 0; d < self.ducks.length; d = d + 1) {
                if (self.ducks[d].id === duckID) {
                    self.ducks[d].duck.kill();
                    self.score.hits = self.score.hits + 1;
                    self.updateScoreboard();
                }
            }
        };

        this.removeDuck = function (duckID) {
            var d, removeDuck;
            for (d = 0; d < self.ducks.length; d = d + 1) {
                if (self.ducks[d].id === duckID) {
                    removeDuck = self.ducks.splice(d, 1);
                    MallardMayhem.stage.removeChild(removeDuck[0].duck.domElement);
                    if (self.ducks.length === 0) {
                        self.endRound();
                    }
                }
            }
        };

        this.updateScoreboard = function () {
            self.scoreBoard.hits.innerHTML = self.score.hits;
            self.scoreBoard.ducks.innerHTML = self.score.ducks;
            self.scoreBoard.shots.innerHTML = self.score.shots;
        };

        this.loadModules = function (fileArray) {
            var f, dom;
            for (f = 0; f < fileArray.length; f = f + 1) {
                dom = document.createElement('script');
                dom.src = fileArray[f].file;
                if (fileArray[f].callback) {
                    dom.onload = fileArray[f].callback;
                } else {
                    dom.onload = null;
                }
                document.getElementsByTagName('body')[0].appendChild(dom);
            }

        };

        this.playShot = function () {
            self.score.shots = self.score.shots + 1;
            self.updateScoreboard();
            self.sounds.shot.currentTime = 0;
            self.sounds.shot.play();
        };

        this.initialize = function () {
        	
        	var format = (navigator.userAgent.indexOf('Firefox') > 1) ? 'ogg' : 'mp3';
        
            this.loadModules([{
                file: './mm/mm.client.duck.js'
            }]);

            self.sounds = {
                shot : new Audio('./interface/shot.' + format),
                intro : new Audio('./interface/intro.' + format),
                endRound : new Audio('./interface/endRound.' + format)
            };
            self.sounds.intro.addEventListener('ended', self.beginRound);
            self.sounds.endRound.addEventListener('ended', function () {
                self.scoreBoard.actionBtns.style.display = 'block';
            });
            self.startBtn.onclick = function () {
                self.scoreBoard.actionBtns.style.display = 'none';
                self.sounds.intro.play();
            };

        };

        this.beginRound = function () {
            var gameType = document.getElementById('gameType').value,
                duckCount,
                d = 0;
            self.stage.addEventListener('click', self.playShot);
            switch (gameType) {
            case 'hardcore':
                duckCount = 99;
                break;
            case 'medium':
                duckCount = 30;
                break;
            case 'parent':
                duckCount = 1;
                break;
            default:
                duckCount = 10;
            }
            while (d < duckCount) {
                self.createDuck();
                d = d + 1;
            }
        };

        this.endRound = function () {
            self.stage.removeEventListener('click', self.playShot);
            self.sounds.endRound.play();
        };

        this.initialize();
    };

    MallardMayhem = new MallardMayhem();

}());