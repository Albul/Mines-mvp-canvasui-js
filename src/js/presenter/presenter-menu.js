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
 * PresenterMenu class
 *
 * @namespace mines.presenter
 * @class mines.presenter.PresenterMenu
 */
(function()
{
    mines.presenter.PresenterMenu = function()
    {
        //--------------------------------------------------------------------------
        //  Modules
        //--------------------------------------------------------------------------

        var
            ViewMenu = mines.view.ViewMenu,
            PresenterGame = mines.presenter.PresenterGame,
            Event = mines.utils.Event;

        //--------------------------------------------------------------------------
        //  Private members
        //--------------------------------------------------------------------------

        var
            viewMenu = null,
            presenterGame = new PresenterGame(),
            soundSlide = null,
            DELAY_SHOW_RESULT = 2000;

        //--------------------------------------------------------------------------
        //  Private methods
        //--------------------------------------------------------------------------

        var initListeners = function() {
            viewMenu.addEventListener(Event.BUTTON_CLICK, onButtonClick);
        };

        var createNewGame = function(numRows, numCols, numMines) {
            viewMenu.stopAnimation();
            presenterGame.createNewGame(numRows, numCols, numMines);
            presenterGame.addEventListener(Event.GAME_LOST, onGameLost);
            presenterGame.addEventListener(Event.GAME_WON, onGameWon);
            viewMenu.removeEventListener(Event.BUTTON_CLICK, onButtonClick);
        };

        var finishGame = function() {
            presenterGame.removeEventListener(Event.GAME_LOST, onGameLost);
            presenterGame.removeEventListener(Event.GAME_WON, onGameWon);
            initListeners();
        };

        var getTimeStr = function(time) {
            return "Затрачено времени: " + Math.floor(time / 60) + " мин " + Math.floor(time) + " сек";
        };


        //--------------------------------------------------------------------------
        //  Event handlers
        //--------------------------------------------------------------------------

        var onButtonClick = function(button) {

            switch (button.text) {
                case "Новая игра":
                    soundSlide.play();
                    viewMenu.showChooseGame();
                    break;
                case "Рекорды":
                    soundSlide.play();
                    viewMenu.showRecords();
                    break;
                case "Об игре":
                    soundSlide.play();
                    viewMenu.showAbout();
                    break;
                case "www.as3.com.ua":
                    window.open('http://' + button.text,'_blank');
                    break;
                case "8 x 8 (10 мин)":
                    createNewGame(8, 8, 10);
                    break;
                case "10 x 10 (15 мин)":
                    createNewGame(10, 10, 15);
                    break;
                case "16 x 16 (40 мин)":
                    createNewGame(16, 16, 40);
                    break;
                case "Еще раз":
                    createNewGame(presenterGame.getRows(), presenterGame.getCols(), presenterGame.getMines());
                    break;
                case "Назад":
                    soundSlide.play();
                    viewMenu.showMainMenu();
                    break;

            }
        };

        var onGameLost = function() {
            setTimeout(function() {
                showResult(false, getTimeStr(presenterGame.getTime()));
            }, DELAY_SHOW_RESULT);
        };

        var onGameWon = function() {
            setTimeout(function() {
                showResult(true, getTimeStr(presenterGame.getTime()));
            }, DELAY_SHOW_RESULT);
        };

        var showResult = function(isWon, strTime) {
            soundSlide.play();
            viewMenu.showResult(isWon, strTime);
            finishGame();
        };

        var onInitView = function() {
            soundSlide.play();
            viewMenu.showMainMenu();
        };

        //--------------------------------------------------------------------------
        //  Public methods
        //--------------------------------------------------------------------------

        this.init = function() {
            // Sound
            soundSlide = new Audio();
            soundSlide.setAttribute('src', '../asset/slide.wav');
            soundSlide.load(); // Required for 'older' browsers

            // View menu
            viewMenu = new ViewMenu();
            viewMenu.init();
            viewMenu.addEventListener('init', onInitView);

            initListeners();
        };
    }
})();