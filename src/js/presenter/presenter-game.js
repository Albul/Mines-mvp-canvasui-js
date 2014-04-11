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
 * presenter namespace
 *
 * @namespace mines.presenter
 */
if (typeof mines.presenter == "undefined" || !mines.presenter)
{
    mines.presenter = {};
}

/**
 * PresenterGame class
 *
 * @namespace mines.presenter
 * @class mines.presenter.PresenterGame
 */
(function()
{
    mines.presenter.PresenterGame = function()
    {
        mines.presenter.PresenterGame.superclass.constructor.call(this);

        //--------------------------------------------------------------------------
        //  Modules
        //--------------------------------------------------------------------------

        var
            ModelGame = mines.ModelGame,
            ViewGame = mines.view.ViewGame,
            Constants = mines.Constants,
            Event = mines.utils.Event;


        //--------------------------------------------------------------------------
        //  Private members
        //--------------------------------------------------------------------------

        var
            model = null,
            view = null,
            soundMarked = null,
            self = this;


        //--------------------------------------------------------------------------
        //  Private methods
        //--------------------------------------------------------------------------

        var initListeners = function() {
            view.addEventListener(Event.CELL_CLICK, onCellClick);
            view.addEventListener(Event.CELL_RIGHT_CLICK, onCellRightClick);
            view.addEventListener(Event.BUTTON_CLICK, onButtonClick);
            view.addEventListener(Event.CELL_MOUSE_DOWN, onCellMouseDown);
            view.addEventListener(Event.CELL_MOUSE_UP, onCellMouseUp);
            model.addEventListener(Event.TIME_CHANGED, onTimeChanged);
            model.addEventListener(Event.CELL_MARKED, onCellMarked);
            model.addEventListener(Event.CELLS_OPENED, onCellsOpened);
            model.addEventListener(Event.GAME_LOST, onGameLost);
            model.addEventListener(Event.GAME_WON, onGameWon);
        };

        var removeListeners = function() {
            view.removeEventListener(Event.CELL_CLICK, onCellClick);
            view.removeEventListener(Event.CELL_RIGHT_CLICK, onCellRightClick);
            view.removeEventListener(Event.BUTTON_CLICK, onButtonClick);
            view.removeEventListener(Event.CELL_MOUSE_DOWN, onCellMouseDown);
            view.removeEventListener(Event.CELL_MOUSE_UP, onCellMouseUp);
            model.removeEventListener(Event.TIME_CHANGED, onTimeChanged);
            model.removeEventListener(Event.CELL_MARKED, onCellMarked);
            model.removeEventListener(Event.CELLS_OPENED, onCellsOpened);
            model.removeEventListener(Event.GAME_LOST, onGameLost);
            model.removeEventListener(Event.GAME_WON, onGameWon);
        };

        /**
         *
         * @param i
         * @param j
         */
        var updateCell = function(i, j) {
            view.redrawCell(i, j, model.getContentCell(i, j),
                model.isOpened(i, j), model.isMine(i, j), model.isMarked(i, j));
        };

        /**
         *
         */
        var finishGame = function() {
            var rows = model.getRows(),
                cols = model.getCols();
            for (var i = 0; i < rows; i++) {
                for (var j = 0; j < cols; j++) {
                    if (model.isMine(i, j) && !model.isMarked(i, j)) {
                        view.drawMine(i, j);
                    }
                    if (model.isMarked(i, j) && !model.isMine(i, j)) {
                        view.drawStrikeoutFlag(i, j);
                    }
                }
            }
            removeListeners();
            view.destroy();
        };

        //--------------------------------------------------------------------------
        //  Event handlers
        //--------------------------------------------------------------------------

        var onCellClick = function(cell) {
            model.tryOpenCell(cell.i, cell.j);
        };

        var onCellRightClick = function(cell) {
            model.tryMarkCell(cell.i, cell.j);
        };

        var onCellMouseDown = function() {
            view.redrawFace(Constants.FACE_WORRIED);
        };

        var onCellMouseUp = function() {
            view.redrawFace(Constants.FACE_SMILE);
        };

        var onButtonClick = function(button) {
            if (button.text == 'В меню') {
                model.quitGame();
                finishGame();
                view.redrawFace(Constants.FACE_SAD);
                self.dispatchEvent(Event.GAME_LOST);
            }
        };

        var onTimeChanged = function(strTime) {
            view.updateTime(strTime);
        };

        var onCellMarked = function(modifData) {
            view.redrawFace(Constants.FACE_SMILE);
            soundMarked.play();
            for (var i = modifData.length; i--;) {
                updateCell(modifData[i][0], modifData[i][1]);
            }
        };

        var onCellsOpened = function(modifData) {
            view.redrawFace(Constants.FACE_COOL);
            for (var i = modifData.length; i--;) {
                updateCell(modifData[i][0], modifData[i][1]);
            }
        };

        var onGameLost = function() {
            finishGame();
            view.redrawFace(Constants.FACE_SAD);
            self.dispatchEvent(Event.GAME_LOST);
        };

        var onGameWon = function() {
            finishGame();
            view.redrawFace(Constants.FACE_WIN);
            self.dispatchEvent(Event.GAME_WON);
        };

        //--------------------------------------------------------------------------
        //  Public methods
        //--------------------------------------------------------------------------

        /**
         *
         * @param numCols
         * @param numRows
         * @param numMines
         */
        this.createNewGame = function(numCols, numRows, numMines) {
            // Sound
            soundMarked = new Audio();
            soundMarked.setAttribute('src', '../asset/marked.wav');
            soundMarked.load(); // Required for 'older' browsers

            // init ModelGame
            model = new ModelGame();
            model.init(numCols, numRows, numMines);

            // init ViewGame
            view = new ViewGame();
            view.init(model.getCols(), model.getRows(), 'canvas');

            initListeners();
        };

        this.getCols = function() {
            return model.getCols();
        };

        this.getRows = function() {
            return model.getRows();
        };

        this.getMines = function() {
            return model.getMines();
        };

        this.getTime = function() {
            return model.getTime();
        }
    };

    // Inherit from event dispatcher
    extend(mines.presenter.PresenterGame, mines.utils.EventDispatcher);
})();

