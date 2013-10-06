/*globals document, setTimeout, clearTimeout, Audio, navigator */
var MallardMayhem = MallardMayhem || {};

(function () {
    "use strict";

    MallardMayhem.Duck = function (options) {

        var self = this;

        this.currentTimeout = null;

        this.domElement = document.createElement('span');
        this.currentLocation = 0;
        this.sounds = {};

        this.maxAge = (20 * 1000);
        this.lifeSpan = null;

        this.id     = options.id        || null;
        this.colour = options.colour    || null;
        this.name   = options.name      || 'Quacky';

        this.direction = 'right';

        this.flyTo = function (coords, callback) {

            var baseClass = 'duck-' + self.colour,
                randomLocation;

            switch (typeof coords) {
            case 'string':
                coords = coords.split(',');
                break;
            case 'function':
                if (coords.x && coords.y) {
                    coords = [coords.x, coords.y];
                }
                break;
            }

            if (!self.currentLocation) {
                self.domElement.style.top = '0px';
                self.domElement.style.left = '0px';
                self.currentLocation = [(MallardMayhem.stage.offsetWidth / 2), MallardMayhem.stage.offsetHeight - (self.domElement.style.height * 2)];
            }
            if (self.currentLocation[0] === coords[0] && self.currentLocation[1] === coords[1]) {
                if (callback) {
                    callback();
                } else {
                    randomLocation = MallardMayhem.randomCoord();
                    self.flyTo(randomLocation);
                }
            } else {

                if (self.currentLocation[1] !== coords[1]) {
                    if (coords[1] > self.currentLocation[1]) {
                        if ((coords[1] - self.currentLocation[1]) < MallardMayhem.animationStep) {
                            self.currentLocation[1] = self.currentLocation[1] + (coords[1] - self.currentLocation[1]);
                        } else {
                            self.currentLocation[1] = self.currentLocation[1] + MallardMayhem.animationStep;
                        }
                        baseClass = baseClass + '-bottom';
                    }
                    if (coords[1] < self.currentLocation[1]) {
                        if ((self.currentLocation[1] - coords[1]) < MallardMayhem.animationStep) {
                            self.currentLocation[1] = self.currentLocation[1] - (self.currentLocation[1] - coords[1]);
                        } else {
                            self.currentLocation[1] = self.currentLocation[1] - MallardMayhem.animationStep;
                        }
                        baseClass = baseClass + '-top';
                    }
                }

                if (self.currentLocation[0] !== coords[0]) {
                    if (coords[0] > self.currentLocation[0]) {
                        if ((coords[0] - self.currentLocation[0]) < MallardMayhem.animationStep) {
                            self.currentLocation[0] = self.currentLocation[0] + (coords[0] - self.currentLocation[0]);
                        } else {
                            self.currentLocation[0] = self.currentLocation[0] + MallardMayhem.animationStep;
                        }
                        baseClass = baseClass + '-right';
                    }
                    if (coords[0] < self.currentLocation[0]) {
                        if ((self.currentLocation[0] - coords[0]) < MallardMayhem.animationStep) {
                            self.currentLocation[0] = self.currentLocation[0] - (self.currentLocation[0] - coords[0]);
                        } else {
                            self.currentLocation[0] = self.currentLocation[0] - MallardMayhem.animationStep;
                        }
                        baseClass = baseClass + '-left';
                    }
                }

                self.domElement.style.left = self.currentLocation[0] + 'px';
                self.domElement.style.top = self.currentLocation[1] + 'px';
                if (self.domElement.className !== baseClass) {
                    self.domElement.className = baseClass;
                }

                self.currentTimeout = setTimeout(function () {
                    self.flyTo(coords, callback);
                }, MallardMayhem.animationSpeed);


            }

        };

        this.drop = function () {
            self.currentLocation[1] = self.currentLocation[1] + (MallardMayhem.animationStep * 2);
            self.domElement.style.top = self.currentLocation[1] + 'px';
            if (self.currentLocation[1] < MallardMayhem.stage.offsetHeight - 72) {
                setTimeout(self.drop, MallardMayhem.animationSpeed);
            } else {
                self.sounds.fall.currentLocation = self.sounds.fall.pause();
                self.sounds.ground.play();
                MallardMayhem.removeDuck(self.id);
            }
        };

        this.kill = function () {
            clearTimeout(self.currentTimeout);
            clearTimeout(self.lifeSpan);
            self.domElement.className = 'duck-' + self.colour + '-dead';
            self.sounds.fall.play();
            setTimeout(self.drop, ((1000 / 4) * 3));
        };

        this.gotShot = function () {
            self.domElement.removeEventListener('mousedown', self.gotShot);
            self.domElement.removeEventListener('touchstart', self.gotShot);
            MallardMayhem.killDuck(self.id);
        };

        this.flapWing = function () {
            self.sounds.flap.play();
        };

        this.initialize = function () {
            self.domElement.id = self.id;
            self.domElement.setAttribute('class', 'duck-' + self.colour + '-right');
            self.domElement.addEventListener('mousedown', self.gotShot);
            self.domElement.addEventListener('touchstart', self.gotShot);
            MallardMayhem.stage.appendChild(self.domElement);
            var randomLocation = MallardMayhem.randomCoord(),
                format = (navigator.userAgent.indexOf('Firefox') > 1) ? 'ogg' : 'mp3';
            self.flyTo(randomLocation);
            self.lifeSpan = setTimeout(self.flyAway, self.maxAge);

            self.sounds = {
                fall : new Audio('./audio/fall.' + format),
                ground: new Audio('./audio/ground.' + format)
            };
            self.sounds.fall.volume = 0.1;

        };

        this.flyAway = function () {
            clearTimeout(self.currentTimeout);
            self.domElement.removeEventListener('mousedown', self.gotShot);
            self.domElement.removeEventListener('touchstart', self.gotShot);
            self.domElement.className = 'duck-' + self.colour + '-top';
            self.currentLocation[1] = self.currentLocation[1] - (MallardMayhem.animationStep * 3);
            self.domElement.style.top = self.currentLocation[1] + 'px';
            if (self.currentLocation[1] > (-60)) {
                setTimeout(self.flyAway, MallardMayhem.animationSpeed);
            } else {
                MallardMayhem.removeDuck(self.id);
            }
        };

        this.initialize();
    };

}());