/*globals io, document, console */
var MallardMayhem = MallardMayhem || {};

(function () {
    "use strict";

    MallardMayhem = function () {

        var self = this;

        this.stage = null;
        this.ducks = [];
        this.server = null;
        this.stage = document.getElementsByTagName('body')[0];
        this.duckLimit = 99;
        this.animationStep = 3;
        this.animationSpeed = (1000 / 30);

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

            }
        };

        this.killDuck = function (duckID) {
            var d;
            for (d = 0; d < self.ducks.length; d = d + 1) {
                if (self.ducks[d].id === duckID) {
                    self.ducks[d].duck.kill();
                }
            }
        };

        this.removeDuck = function (duckID) {
            var d, removeDuck;
            for (d = 0; d < self.ducks.length; d = d + 1) {
                if (self.ducks[d].id === duckID) {
                    removeDuck = self.ducks.splice(d, 1);
                    MallardMayhem.stage.removeChild(removeDuck[0].duck.domElement);
                }
            }
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

        this.initialize = function () {
            this.loadModules([{
                file: './mm/mm.client.duck.js'
            }]);

            document.getElementsByTagName('button')[0].onclick = self.createDuck;

        };

        this.initialize();
    };

    MallardMayhem = new MallardMayhem();

}());