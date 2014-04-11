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
 * ModelGame constants
 *
 * @namespace mines
 * @class mines.Constants
 */
mines.Constants =
{
    MINE: -1,
    ZERO: 0,
    CLOSED_STATE: 0,
    OPENED_STATE: 1,
    MARKED_STATE: 3,
    OVERFLOW: false,
    STATE_DURING: 0,
    STATE_WON: 1,
    STATE_LOST: 2,
    FACE_SMILE: 1,
    FACE_WORRIED: 2,
    FACE_COOL: 3,
    FACE_SAD: 4,
    FACE_WIN: 5,
    BUTTON_HEIGHT: 50
};

/**
 * ModelGame of game class
 *
 * @namespace mines
 * @class mines.ModelGame
 */
(function()
{
    mines.ModelGame = function ()
    {
        mines.ModelGame.superclass.constructor.call(this);

        //--------------------------------------------------------------------------
        //  Modules
        //--------------------------------------------------------------------------

        var
            Constants = mines.Constants,
            Matrix = mines.utils.Matrix,
            Event = mines.utils.Event;


        //--------------------------------------------------------------------------
        //  Private members
        //--------------------------------------------------------------------------

        var
            matrixContent, // Matrix contains the number of mines in the neighborhood
            matrixState, // Matrix states of the cells
            self = this,
            stateGame,
            startTime,
            curTime, // Current time
            newTime,
            endTime,
            strTime, // String time
            refTime, // Reformed time
            refMinutes,
            refSeconds,
            numCols, numRows, numMines,
            numClosed, // The number of closed cells
            modifData,
            timerID;

        //--------------------------------------------------------------------------
        //  Private methods
        //--------------------------------------------------------------------------

        /**
         * Checks the availability of cell index
         * @param i
         * @param j
         * @returns {boolean}
         */
        var isValid = function(i, j) {
            if (i >= 0 && i < numRows && j >= 0 && j < numCols) {
                return true;
            } else {
                return false;
            }
        };

        /**
         *
         * @param i
         * @param j
         * @returns {Array}
         */
        var getNeighbors = function(i ,j) {
            var k, l, n = 1, neighbors = [];
            while (n <= 8) {
                // Determine the direction
                switch (n) {
                    case 1:
                        k = i - 1; l = j;
                        break;
                    case 2:
                        k = i + 1; l = j;
                        break;
                    case 3:
                        k = i; l = j - 1;
                        break;
                    case 4:
                        k = i; l = j + 1;
                        break;
                    case 5:
                        k = i - 1; l = j - 1;
                        break;
                    case 6:
                        k = i - 1; l = j + 1;
                        break;
                    case 7:
                        k = i + 1; l = j - 1;
                        break;
                    case 8:
                        k = i + 1; l = j + 1;
                        break;
                }
                if (isValid(k, l)) {
                    neighbors.push(k, l);
                }
                n++;
            }
            return neighbors;
        };

        /**
         * Calculate the number of mines that the cell is bordered
         * @param i
         * @param j
         * @returns {number}
         */
        var calculateCell =  function (i, j) {
            var count = 0, k, l, neighbors;

            // Check the neighboring cells
            neighbors = getNeighbors(i, j);
            for (var n = 0, length = neighbors.length; n < length; n += 2) {
                k = neighbors[n];
                l = neighbors[n + 1];
                if (self.isMine(k, l)) count++;
            }

            return count;
        };

        /**
         * Calculate neighborhood mines for each cell of the field
         */
        var calculateCells = function () {
            var
                i = numCols,
                j = numRows;
            while (i--) {
                while (j--) {
                    if (!self.isMine(i, j)) {
                        self.setContentCell(i, j, calculateCell(i, j));
                    }
                }
                j = numCols;
            }
        };

        /**
         * Search and opening empty cells
         * @param i
         * @param j
         */
        var searchEmpty = function (i, j) {
            openCell(i, j);

            if (!self.isZero(i, j) && !self.isMine(i, j)) return;

            var k, l, neighbors;
            neighbors = getNeighbors(i, j);
            for (var n = 0, length = neighbors.length; n < length; n += 2) {
                k = neighbors[n];
                l = neighbors[n + 1];
                if (!self.isMine(k, l) && !self.isOpened(k, l)) {
                    searchEmpty(k, l);
                }
            }
        };

        var openCell = function (i, j) {
            if (!self.isOpened(i, j)) {
                numClosed--;
                matrixState[i][j] = Constants.OPENED_STATE;
                modifData.push([i, j]);
            }
        };

        //--------------------------------------------------------------------------
        //  Event handlers
        //--------------------------------------------------------------------------

        var onTimer = function() {
            newTime = new Date();
            if (newTime > curTime) {
                curTime = newTime;
                refTime = (curTime - startTime) / 1000;
                refMinutes = Math.floor(refTime / 60);
                refSeconds = Math.floor(refTime % 60);
                strTime = refMinutes >= 10? refMinutes : '0' + refMinutes;
                strTime += ':';
                strTime += refSeconds >= 10? refSeconds : '0' + refSeconds;
                self.dispatchEvent(Event.TIME_CHANGED, strTime);
            }
            if (!endTime) {
                timerID = setTimeout(onTimer, 1000);
            }
        };

        //--------------------------------------------------------------------------
        //  Public methods
        //--------------------------------------------------------------------------

        /**
         * Initialization
         * @param _numCols
         * @param _numRows
         * @param _numMines
         */
        this.init = function(_numCols, _numRows, _numMines) {
            numCols = _numCols;
            numRows = _numRows;
            numMines = _numMines;

            // Time
            startTime = new Date();
            curTime = startTime;
            timerID = setTimeout(onTimer, 1000);

            stateGame = Constants.STATE_DURING;
            matrixState = Matrix.create(numRows, numCols, Constants.CLOSED_STATE);
            matrixContent = Matrix.create(numRows, numCols, Constants.ZERO);
            Matrix.fillRandom(matrixContent, numMines, Constants.MINE);
            numClosed = numRows * numCols;
            modifData = [];

            calculateCells();
        };

        /**
         *
         * @param i
         * @param j
         */
        this.tryOpenCell = function (i, j) {
            if (this.isOpened(i, j) || this.isMarked(i, j)) return;

            modifData = [];
            openCell(i, j);

            if (this.isZero(i, j)) {
                searchEmpty(i, j);
            }

            this.dispatchEvent(Event.CELLS_OPENED, modifData);

            if (this.isMine(i, j)) {
                endTime = new Date();
                this.setStateGame(Constants.STATE_LOST);
                self.dispatchEvent(Event.GAME_LOST);
            }
            if (numClosed == this.getMines()) {
                endTime = new Date();
                this.setStateGame(Constants.STATE_WON);
                this.dispatchEvent(Event.GAME_WON);
            }
        };

        /**
         *
         * @param i
         * @param j
         */
        this.tryMarkCell = function (i, j) {
            if (!this.isOpened(i, j)) {
                if (this.isMarked(i, j)) {
                    this.setStateCell(i, j, Constants.CLOSED_STATE);
                } else {
                    this.setStateCell(i, j, Constants.MARKED_STATE);
                }
                modifData = [[i, j]];
                this.dispatchEvent(Event.CELL_MARKED, modifData);
            }
        };

        this.isOpened = function (i, j) {
            return matrixState[i][j] == Constants.OPENED_STATE;
        };

        this.isMine = function (i, j) {
            return matrixContent[i][j] == Constants.MINE;
        };

        this.isMarked =  function (i, j) {
            return matrixState[i][j] == Constants.MARKED_STATE;
        };

        this.isZero = function (i, j) {
            return matrixContent[i][j] == Constants.ZERO;
        };

        this.getRows = function () {
            return numRows;
        };

        this.getCols = function () {
            return numCols;
        };

        this.getMines = function () {
            return numMines;
        };

        this.getContentCell = function(i, j) {
            return matrixContent[i][j];
        };

        this.getTime = function () {
            if (endTime) {
                return (endTime.getTime() - startTime.getTime()) / 1000;
            }
        };

        this.setContentCell = function(i, j, value) {
            matrixContent[i][j] = value;
        };

        this.setStateCell = function(i, j, value) {
            matrixState[i][j] = value;
        };

        this.setStateGame = function(state) {
            stateGame = state;
        };

        this.quitGame = function() {
            endTime = new Date();
            this.setStateGame(Constants.STATE_LOST);
        };
    };

    // Inherit from event dispatcher
    extend(mines.ModelGame, mines.utils.EventDispatcher);
})();

