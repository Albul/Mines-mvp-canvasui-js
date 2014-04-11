/*
 * Copyright 2012 Alexandr Albul
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * mines root namespace.
 *
 * @namespace mines
 */
if (typeof mines == "undefined" || !mines) {
    var mines = {};
}


/**
 * utils namespace.
 *
 * @namespace mines.utils
 */
if (typeof mines.utils == "undefined" || !mines.utils) {
    mines.utils = {};
}


function extend(Child, Parent) {
    var F = function() {};
    F.prototype = Parent.prototype;
    Child.prototype = new F();
    Child.prototype.constructor = Child;
    Child.superclass = Parent.prototype;
}


// Add to prototype of array the method clone
Array.prototype.clone = function() {
    return this.slice(0);
};


/**
 * EventDispatcher class
 *
 * @namespace mines.utils
 * @class mines.utils.EventDispatcher
 */
(function()
{
    mines.utils.EventDispatcher = function ()
    {
        var eventListeners = {
            any: []
        };

        //--------------------------------------------------------------------------
        //  Private methods
        //--------------------------------------------------------------------------

        var visitListeners = function (action, type, event) {
            var pubtype = eventListeners.hasOwnProperty(type)? type : 'any';
            var clonedListeners = eventListeners[pubtype].clone();
            var listeners = eventListeners[pubtype];

            for (var i = 0, max = clonedListeners.length; i < max; i++) {
                if (action === 'dispatch') {
                    clonedListeners[i](event);
                } else {
                    if (listeners[i] === event) {
                        listeners.splice(i, 1);
                    }
                }
            }
        };

        //--------------------------------------------------------------------------
        //  Public methods
        //--------------------------------------------------------------------------

        /**
         * Registers an event listener object on the object EventDispatcher
         * @param type The event type
         * @param listener The listener function that processes the event
         */
        this.addEventListener = function (type, listener) {
            type = type || 'any';
            if (typeof eventListeners[type] === "undefined") {
                eventListeners[type] = [];
            }
            eventListeners[type].push(listener);
        };

        /**
         * Removes a listener from the EventDispatcher object
         * @param type The event type
         * @param listener The listener function that processes the event
         */
        this.removeEventListener = function (type, listener) {
            visitListeners('remove', type, listener);
        };

        /**
         * Dispatches an event
         * @param type The event type
         * @param event The event object passed to the handler
         */
        this.dispatchEvent = function (type, event) {
            visitListeners('dispatch', type, event);
        };
    };
})();


/**
 * Event class
 *
 * @namespace mines.utils
 * @class mines.utils.Event
 */
(function()
{
    mines.utils.Event =
    {
        //--------------------------------------------------------------------------
        //  Static members
        //--------------------------------------------------------------------------

        LOADED: 'loaded',
        GAME_WON: 'gameWon',
        GAME_LOST: 'gameLost',
        TIME_CHANGED: 'timeChanged',
        DATA_MODIFIED: 'dataModified',
        CELLS_OPENED: 'cellsOpened',
        CELL_MARKED: 'cellsMarked',
        CELL_CLICK: 'cellClick',
        CELL_MOUSE_DOWN: 'cellMouseDown',
        CELL_MOUSE_UP: 'cellMouseUp',
        CELL_RIGHT_CLICK: 'cellRightClick',
        BUTTON_CLICK: 'buttonClick'
    };
})();


/**
 * Animation class
 *
 * @namespace mines.utils
 * @class mines.utils.Animation
 */
(function()
{
    mines.utils.Animation = function(canvasId)
    {
        this.canvas = document.getElementById(canvasId);
        this.context = this.canvas.getContext('2d');
        this.t = 0;
        this.timeInterval = 0;
        this.startTime = 0;
        this.lastTime = 0;
        this.frame = 0;
        this.animating = false;
        this.instance = null;

        window.requestAnimFrame = (function() {
            return window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function (callback) {
                    window.setTimeout(callback, 1000 / 60);
                }
        })();
    }

    mines.utils.Animation.prototype = {
        getContext: function() {
            return this.context;
        },
        getCanvas: function() {
            return this.canvas;
        },
        clear: function() {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        },
        setStage: function(func) {
            this.stage = func;
            this.t = 0;
        },
        isAnimating: function() {
            return this.animating;
        },
        getFrame: function() {
            return this.frame;
        },
        getTimeInterval: function() {
            return this.timeInterval;
        },
        getTime: function() {
            return this.t;
        },
        getFps: function() {
            return this.timeInterval > 0 ? 1000 / this.timeInterval : 0;
        },
        start: function() {
            this.animating = true;
            var date = new Date();
            this.startTime = date.getTime();
            this.lastTime = this.startTime;

            if (this.stage !== undefined) {
                this.stage();
            }
            this.animationLoop();
        },
        stop: function() {
            this.animating = false;
        },
        animationLoop: function() {
            if (!this.animating) return;
            var that = this;

            this.frame++;
            var date = new Date();
            var thisTime = date.getTime();
            this.timeInterval = thisTime - this.lastTime;
            this.t += this.timeInterval;
            this.lastTime = thisTime;

            if (this.stage !== undefined) {
                this.stage();
            }

            if (this.animating) {
                requestAnimFrame(function() {
                    that.animationLoop();
                });
            }
        }
    };

    /*mines.utils.Animation.getInstance = function(canvasId) {
     if (this.instance == null) {
     this.instance = mines.utils.Animation(canvasId);
     }
     return this.instance;
     };*/
})();


/**
 * ExtMath class
 *
 * @namespace mines.utils
 * @class mines.utils.ExtMath
 */
(function()
{
    mines.utils.ExtMath =
    {
        //--------------------------------------------------------------------------
        //  Static methods
        //--------------------------------------------------------------------------

        /**
         * Returns a random number from a specified range
         * @param min
         * @param max
         * @return {Number}
         */
        getRandomInt : function (min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
    };
})();


/**
 * ExtArray class
 *
 * @namespace mines.utils
 * @class mines.utils.ExtArray
 */
(function()
{
    //--------------------------------------------------------------------------
    //  Modules
    //--------------------------------------------------------------------------

    var ExtMath = mines.utils.ExtMath;

    //--------------------------------------------------------------------------
    //  Private methods
    //--------------------------------------------------------------------------

    var createArray = function (length) {
        var arr = new Array(length),
            i = length;

        while (i--) {
            arr[i] = i + 1;
        }
        return arr;
    };

    var fillArray = function (length, value) {
        var arr = new Array(length),
            i = length;

        while (i--) {
            arr[i] = value;
        }

        return arr;
    };

    var shuffle = function (arr, start, end) {
        for(var j, x, i = end; i >= start; i--) {
            j = ExtMath.getRandomInt(start, end);
            x = arr[i];
            arr[i] = arr[j];
            arr[j] = x;
        }
        return arr;
    };

    //--------------------------------------------------------------------------
    //  Static methods
    //--------------------------------------------------------------------------

    mines.utils.ExtArray =
    {
        /**
         * Create array and fills it with the specified value or indexes starting from 1
         * @param length Length of the array
         * @param value The value of the array elements
         */
        create: function (length, value) {
            if (typeof value == 'undefined') {
                return createArray(length);
            } else {
                return fillArray(length, value);
            }
        },

        /**
         * Creates a random array of numbers from a specified range of the specified length
         * @param from Start of range sampling
         * @param to End of range sampling
         * @param length Length of the array
         * @param arrExceptions An array of exceptions that are included in sampling range,
         * but should not put in the output array
         * @return {Array}
         */
        createRandom : function (from, to, length, arrExceptions) {
            var arr = new Array(length),
                item;

            for (var i = length; i--;) {
                item = ExtMath.getRandomInt(from, to);
                while (arr.indexOf(item) != -1 || arrExceptions.indexOf(item) != -1) {
                    item = ExtMath.getRandomInt(from, to);
                }
                arr[i] = item;
            }
            return arr;
        },

        /**
         * Shuffles input array randomly
         * @param arr The input array
         * @param start Start of range of shuffling
         * @param end End of the range of shuffling
         * @return {Array}
         */
        shuffle : function (arr, start, end) {
            if (typeof start == 'undefined' || typeof end == 'undefined') {
                return shuffle(arr, 0, arr.length - 1);
            } else {
                return shuffle(arr, start, end);
            }
        },

        /**
         * Counts the number of elements in the array with a given value
         * @param arr The input array
         * @param value The input value
         * @return {number}
         */
        amount : function (arr, value) {
            var result = 0;

            for (var i = arr.length; i--;) {
                if (arr[i] == value) result++;
            }
            return result;
        }
    };
})();


/**
 * Matrix class
 *
 * @namespace mines.utils
 * @class mines.utils.Matrix
 */
(function()
{
    //--------------------------------------------------------------------------
    //  Modules
    //--------------------------------------------------------------------------

    var ExtMath =  mines.utils.ExtMath;

    //--------------------------------------------------------------------------
    //  Private methods
    //--------------------------------------------------------------------------

    var createMatrix = function (rows, cols) {
        var matrix = new Array(rows),
            i = matrix.length;

        while (i--) {
            matrix[i] = new Array(cols);
        }
        return matrix;
    };

    var fillMatrix = function (matrix, value) {
        var i = matrix.length,
            j = matrix[0].length;

        while (i--) {
            while (j--) {
                matrix[i][j] = value;
            }
            j = matrix[0].length;
        }
    };

    //--------------------------------------------------------------------------
    //  Static methods
    //--------------------------------------------------------------------------

    mines.utils.Matrix =
    {
        /**
         * Creating a two-dimensional array
         * @param rows
         * @param cols
         * @param value
         * @return {Array}
         */
        create: function (rows, cols, value) {
            var matrix = createMatrix(rows, cols);
            if (typeof value != 'undefined') {
                fillMatrix(matrix, value);
            }
            return matrix;
        },

        /**
         * Filling the existing two-dimensional array specified value
         * @param matrix
         * @param value
         */
        fill: function (matrix, value) {
            fillMatrix(matrix, value);
        },

        fillRandom: function (matrix, amount, value) {
            var maxI = matrix.length - 1,
                maxJ = matrix[0].length - 1,
                i, j;

            while (amount) {
                i = ExtMath.getRandomInt(0, maxI);
                j = ExtMath.getRandomInt(0, maxJ);
                while (matrix[i][j] == value) {
                    i = ExtMath.getRandomInt(0, maxI);
                    j = ExtMath.getRandomInt(0, maxJ);
                }
                matrix[i][j] = value;
                amount--;
            }
        }
    };
})();


/**
 * Collision class
 *
 * @namespace mines.utils
 * @class mines.utils.Collision
 */
(function ()
{
    //--------------------------------------------------------------------------
    //  Static methods
    //--------------------------------------------------------------------------

    mines.utils.Collision =
    {
        /**
         * Collision check the object with the point
         * @param obj
         * @param x x coordinate of the point
         * @param y y coordinate of the point
         * @return {boolean}
         */
        hitTestPoint: function (obj, x, y) {
            if (obj.x < x && obj.y < y
                && obj.x + obj.width > x
                && obj.y + obj.height > y) {
                return true;
            } else {
                return false;
            }
        }
    }
})();


/**
 * Dom class
 *
 * @namespace mines.utils
 * @class mines.utils.Dom
 */
(function ()
{
    //--------------------------------------------------------------------------
    //  Static methods
    //--------------------------------------------------------------------------

    mines.utils.Dom =
    {
        /**
         * Returns the global coordinates of the element on the page
         * @param element HTMLElement
         * @return {Object}
         */
        getElementPosition: function (element) {
            var elem = element,
                tagname = '',
                x = 0,
                y = 0;

            while((typeof(elem) == 'object') && (typeof(elem.tagName) != 'undefined')) {
                y += elem.offsetTop;
                x += elem.offsetLeft;
                tagname = elem.tagName.toUpperCase();

                if(tagname == 'BODY') elem = 0;

                if(typeof(elem) == 'object') {
                    if(typeof(elem.offsetParent) == 'object')
                        elem = elem.offsetParent;
                }
            }
            return {x: x, y: y};
        }
    };
})();