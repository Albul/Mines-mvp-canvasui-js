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
 * view namespace.
 *
 * @namespace mines.view
 */
if (typeof mines.view == "undefined" || !mines.view)
{
    mines.view = {};
}


/**
 * Label class
 *
 * @namespace mines.view
 * @class mines.view.Label
 */
(function()
{
    var context = CONTEXT;

    mines.view.Label = function (text, x, y, font) {
        this.text = text;
        this.x = x;
        this.y = y;
        this.font = font;
        this.width = 0;
        this.color = '#5e93bf';
        this.lineWidth = 3;

        // Calculate width
        this.updateWidth();
    };

    mines.view.Label.prototype = {
        draw: function() {
            context.save();
            context.font = this.font;
            context.strokeStyle = "black";
            context.lineWidth = this.lineWidth;
            context.strokeText(this.text, this.x, this.y);
            context.fillStyle = this.color;
            context.fillText(this.text, this.x, this.y);
            context.restore();
        },
        updateWidth: function() {
            context.font = this.font;
            this.width = context.measureText(this.text).width;
            context.font = '';
        }
    };
})();


/**
 * Button class
 *
 * @namespace mines.view
 * @class mines.view.Button
 */
(function()
{
    var context = CONTEXT;

    mines.view.Button = function (text, x, y, width, height)
    {
        //--------------------------------------------------------------------------
        //  Public members
        //--------------------------------------------------------------------------

        this.text = text;
        this.x = x;
        this.y = y;
        context.font = 'bold 24px Arial';
        this.width = width > 0 ? width : context.measureText(this.text).width + 2 * this.paddingWidth;
        this.height = height;
    };

    mines.view.Button.prototype =
    {
        paddingWidth: 40,
        paddingHeight: 15,

        //--------------------------------------------------------------------------
        //  Public methods
        //--------------------------------------------------------------------------

        draw: function() {
            context.save();
            // shadow
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;
            context.shadowBlur = 5;
            context.shadowColor = "rgba(0, 0, 0, 0.4)";
            // rect
            context.fillStyle = this.pattern;
            context.lineWidth = 2;
            context.strokeStyle = '#9c9c9c';
            context.roundRect(this.x, this.y, this.width, this.height, 7, true, true);
            // text
            context.font = 'bold 24px Arial';
            context.textBaseline = "middle";
            context.fillStyle = '#ffffff';
            context.fillText(this.text, this.x + this.paddingWidth, this.y + this.height / 2);
            context.restore();
        },
        show: function() {
            this.draw();
        },
        createPattern: function() {
            var canvas = document.getElementById('canvas-pattern');
            var ctx = canvas.getContext('2d');
            ctx.beginPath();
            ctx.rect(0, 0, 4, 4);
            ctx.rect(4, 4, 4, 4);
            ctx.fillStyle = '#5887af';
            ctx.fill();
            ctx.closePath();
            ctx.beginPath();
            ctx.rect(4, 0, 4, 4);
            ctx.rect(0, 4, 4, 4);
            ctx.fillStyle = '#44759c';
            ctx.fill();
            ctx.closePath();
            this.pattern = ctx.createPattern(canvas, "repeat");
        }

    };

    mines.view.Button.prototype.createPattern();
})();


/**
 * ViewMenu class
 *
 * @namespace mines.view
 * @class mines.view.ViewMenu
 */
(function()
{
    mines.view.ViewMenu = function ()
    {
        mines.view.ViewMenu.superclass.constructor.call(this);

        //--------------------------------------------------------------------------
        //  Modules
        //--------------------------------------------------------------------------

        var
            Button = mines.view.Button,
            Label = mines.view.Label,
            Dom = mines.utils.Dom,
            Collision = mines.utils.Collision,
            Event = mines.utils.Event,
            Animation = mines.utils.Animation;

        //--------------------------------------------------------------------------
        //  Private members
        //--------------------------------------------------------------------------

        var self = this;
        var animation = null;
        var context = null;
        var buttonsOnPage = [];
        var titleOnPage = null;
        var bg = null;
        var BG_SIZE = 604;
        var PADDING = 20;
        var BUTTON_HEIGHT = 50;
        var TITLE_FONT = 'bold 52px "Comic Sans MS"';

        //--------------------------------------------------------------------------
        //  Public members
        //--------------------------------------------------------------------------

        this.canvas = null;
        this.canvasPosition = null;

        this.lMainMenu = null;
        this.bNewGame = null;
        this.bRecords = null;
        this.bAbout = null;
        this.bExit = null;

        this.lChooseGame = null;
        this.bR8C8M10 = null;
        this.bR10C10M15 = null;
        this.bR16C16M40 = null;
        this.bBack = null;

        this.lRecords = null;
        this.bBackRecords = null;

        this.lAbout = null;
        this.lTextAbout = null;
        this.bSite = null;
        this.bBackAbout = null;

        this.lResult = null;
        this.lTextResult = null;
        this.bReplay = null;
        this.bBackResult = null;

        //--------------------------------------------------------------------------
        //  Private methods
        //--------------------------------------------------------------------------

        var createControls = function() {
            var bgY = (self.canvas.height - BG_SIZE) / 2,
                currentY = bgY + BUTTON_HEIGHT + PADDING * 3;

            // Main page
            self.lMainMenu = new Label("Главное меню", 0, currentY, TITLE_FONT);
            self.lMainMenu.x = Math.round((self.canvas.width - self.lMainMenu.width) / 2);
            self.bNewGame = new Button("Новая игра", self.canvas.width, currentY += BUTTON_HEIGHT + PADDING * 2, 0, BUTTON_HEIGHT);
            self.bRecords = new Button("Рекорды", self.canvas.width, currentY += BUTTON_HEIGHT + PADDING, 0, BUTTON_HEIGHT);
            self.bAbout = new Button("Об игре", self.canvas.width, currentY += BUTTON_HEIGHT + PADDING, 0, BUTTON_HEIGHT);
            self.bExit = new Button("Выход", self.canvas.width, currentY += BUTTON_HEIGHT + PADDING, 0, BUTTON_HEIGHT);

            // Choose game page
            currentY = bgY + BUTTON_HEIGHT + PADDING * 3;
            self.lChooseGame = new Label("Выбор игры", 0, currentY, TITLE_FONT);
            self.lChooseGame.x = Math.round((self.canvas.width - self.lChooseGame.width) / 2);
            self.bR8C8M10 = new Button("8 x 8 (10 мин)", self.canvas.width, currentY += BUTTON_HEIGHT + PADDING * 2, 0, BUTTON_HEIGHT);
            self.bR10C10M15 = new Button("10 x 10 (15 мин)", self.canvas.width, currentY += BUTTON_HEIGHT + PADDING, 0, BUTTON_HEIGHT);
            self.bR16C16M40 = new Button("16 x 16 (40 мин)", self.canvas.width, currentY += BUTTON_HEIGHT + PADDING, 0, BUTTON_HEIGHT);
            self.bBack = new Button("Назад", self.canvas.width, currentY += BUTTON_HEIGHT + PADDING, 0, BUTTON_HEIGHT);

            // About page
            currentY = bgY + BUTTON_HEIGHT + PADDING * 3;
            self.lAbout = new Label("Об игре", 0, currentY, TITLE_FONT);
            self.lAbout.x = Math.round((self.canvas.width - self.lAbout.width) / 2);
            self.lTextAbout = new Label("Author: Albul Alexandr © special for", self.canvas.width,
                currentY += BUTTON_HEIGHT + PADDING * 2, 'bold 26px "Comic Sans MS"');
            self.lTextAbout.lineWidth = 2;
            self.bSite = new Button("gamecook.org", self.canvas.width, currentY += BUTTON_HEIGHT + PADDING, 0, BUTTON_HEIGHT);
            self.bBackAbout = new Button("Назад", self.canvas.width, currentY += BUTTON_HEIGHT + PADDING, 0, BUTTON_HEIGHT);

            // Records page
            currentY = bgY + BUTTON_HEIGHT + PADDING * 3;
            self.lResult = new Label("Вы проиграли :(", 0, currentY, TITLE_FONT);
            self.lResult.x = Math.round((self.canvas.width - self.lResult.width) / 2);
            self.bBackRecords = new Button("Назад", self.canvas.width, currentY += BUTTON_HEIGHT + PADDING, 0, BUTTON_HEIGHT);

            // Result page
            currentY = bgY + BUTTON_HEIGHT + PADDING * 3;
            self.lRecords = new Label("Рекорды", 0, currentY, TITLE_FONT);
            self.lRecords.x = Math.round((self.canvas.width - self.lRecords.width) / 2);
            self.lTextResult = new Label("Затрачено времени: ", 0, currentY += BUTTON_HEIGHT + PADDING * 3, 'bold 24px "Comic Sans MS"');
            self.lTextResult.x = Math.round((self.canvas.width - self.lTextResult.width) / 2);
            self.lTextResult.lineWidth = 2;
            self.bReplay = new Button("Еще раз", self.canvas.width, currentY += BUTTON_HEIGHT + PADDING * 2, 0, BUTTON_HEIGHT);
            self.bBackResult = new Button("Назад", self.canvas.width, currentY += BUTTON_HEIGHT + PADDING, 0, BUTTON_HEIGHT);
        };

        var startAnimation = function() {
            var linearSpeed = 1800, // Pixels per second
                delay = 100, // Delay for next animation
                linearDistEachFrame,
                isContinued = false,
                i = 0, length = buttonsOnPage.length;

            // Set initial values
            for (i = 0; i < length; i++) {
                buttonsOnPage[i].toX = Math.round((self.canvas.width - buttonsOnPage[i].width) / 2);
                buttonsOnPage[i].x = self.canvas.width;
            }

            animation.setStage(function() {
                // Update
                linearDistEachFrame = linearSpeed * this.getTimeInterval() / 1000;
                isContinued = false;

                for (i = 0; i < length; i++) {
                    var button = buttonsOnPage[i];
                    if (button.x > button.toX && this.t >= delay * i) {
                        button.x -= Math.round(linearDistEachFrame);
                        if (button.x < button.toX) {
                            button.x = button.toX;
                        }
                        isContinued = true;
                    }
                }

                if (!isContinued) {
                    animation.stop();
                }

                // Clear
                this.clear();

                // Draw
                context.drawImage(bg, bg.cX, (self.canvas.height - bg.height) / 2);
                titleOnPage.draw();
                for (i = 0; i < length; i++) {
                    buttonsOnPage[i].draw(context);
                }
            });
            animation.start();
        };

        var settingCanvas = function() {
            self.canvas.width = window.innerWidth > BG_SIZE? window.innerWidth : BG_SIZE;
            self.canvas.height = window.innerHeight > BG_SIZE? window.innerHeight : BG_SIZE;
        };

        //--------------------------------------------------------------------------
        //  Event handlers
        //--------------------------------------------------------------------------

        var onClick = function(e) {
            if (e.which == 3) {
                return;
            }
            var mouseX = e.clientX + window.scrollX - self.canvasPosition.x,
                mouseY = e.clientY + window.scrollY - self.canvasPosition.y;

            for (var i = 0; i < buttonsOnPage.length; i++) {
                if (Collision.hitTestPoint(buttonsOnPage[i], mouseX, mouseY)) {
                    self.dispatchEvent(Event.BUTTON_CLICK, buttonsOnPage[i]);
                    return;
                }
            }
        };

        //--------------------------------------------------------------------------
        //  Public methods
        //--------------------------------------------------------------------------

        this.init = function() {
            animation = new Animation('canvas');

            this.canvas = animation.getCanvas();
            context = animation.getContext();
            settingCanvas();
            this.canvasPosition = Dom.getElementPosition(this.canvas);

            bg = new Image();
            bg.onload = function() {
                bg.cX = (self.canvas.width - bg.width) / 2;
                bg.cY = (self.canvas.height - bg.height) / 2;
                createControls();
                self.dispatchEvent('init');
            };
            bg.src = '../asset/bg.png';
            this.canvas.addEventListener('click', onClick);
        };

        this.showChooseGame = function() {
            settingCanvas();
            buttonsOnPage = [];
            buttonsOnPage.push(this.bR8C8M10, this.bR10C10M15, this.bR16C16M40, this.bBack);
            titleOnPage = this.lChooseGame;
            startAnimation();
        };

        this.showMainMenu = function() {
            settingCanvas();
            buttonsOnPage = [];
            buttonsOnPage.push(this.bNewGame, this.bRecords, this.bAbout, this.bExit);
            titleOnPage = this.lMainMenu;
            startAnimation();
        };

        this.showAbout = function() {
            settingCanvas();
            buttonsOnPage = [];
            buttonsOnPage.push(this.lTextAbout, this.bSite, this.bBackAbout);
            titleOnPage = this.lAbout;
            startAnimation();
        };

        this.showRecords = function() {
            settingCanvas();
            buttonsOnPage = [];
            buttonsOnPage.push(this.bBackRecords);
            titleOnPage = this.lRecords;
            startAnimation();
        };

        this.showResult = function(isWon, strTime) {
            settingCanvas();
            buttonsOnPage = [];
            buttonsOnPage.push(this.lTextResult, this.bReplay, this.bBackResult);
            titleOnPage = this.lResult;

            this.lTextResult.text = strTime;
            this.lTextResult.updateWidth();

            if (isWon) {
                this.lResult.text = "Вы выиграли :)";
                this.lResult.color = '#78c14c';
            } else {
                this.lResult.text = "Вы проиграли :(";
                this.lResult.color = '#cf4b4b';
            }
            this.lResult.updateWidth();
            startAnimation();
        };

        this.stopAnimation = function() {
            animation.stop();
        };
    };

    // Inherit from event dispatcher
    extend(mines.view.ViewMenu, mines.utils.EventDispatcher);
})();
