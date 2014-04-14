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

// Globals
var CONTEXT = document.getElementById('canvas').getContext('2d');


// Adding method roundRect to context
CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, radius, fill, stroke) {
    if (width < 2 * radius) radius = width / 2;
    if (height < 2 * radius) radius = height / 2;
    this.beginPath();
    this.moveTo(x + radius, y);
    this.arcTo(x + width, y, x + width, y + height, radius);
    this.arcTo(x + width, y + height, x, y + height, radius);
    this.arcTo(x, y + height, x, y, radius);
    this.arcTo(x, y, x + width, y, radius);
    this.closePath();
    if (fill) {
        this.fill();
    }
    if (stroke) {
        this.stroke();
    }
};


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
 * Cell class
 *
 * @namespace mines.view
 * @class mines.view.Cell
 */
(function()
{
    var context = CONTEXT;

    mines.view.Cell = function (i, j, x, y)
    {
        //--------------------------------------------------------------------------
        //  Public members
        //--------------------------------------------------------------------------

        this.i = i;
        this.j = j;
        this.x = x;
        this.y = y;
    };

    mines.view.Cell.prototype =
    {
        //--------------------------------------------------------------------------
        //  Public members
        //--------------------------------------------------------------------------

        TOP_COLOR_OPENED: '#fcfcfc',
        BOTTOM_COLOR_OPENED: '#e1dfde',
        TOP_COLOR_CLOSED: '#8cb0dc',
        BOTTOM_COLOR_CLOSED: '#7aa1d2',
        MINE_COLOR_FILL: '#7B7B7B',
        MINE_COLOR_STROKE: '#121212',
        COLORS_NUMBER: [
            '#0000FF', '#00A000', '#FF0000', '#00007F',
            '#A00000', '#00CCFF', '#A000A0', '#000000'
        ],
        SIZE: 60,
        FONT_SIZE: 54,
        THORN_HEIGHT: 8,

        width: 60,
        height: 60,
        imgFlag: null,
        imgMine: null,

        //--------------------------------------------------------------------------
        //  Public methods
        //--------------------------------------------------------------------------

        /**
         * Drawing the mines in the middle of the cell
         */
        drawMine: function () {
            var
                x0 = this.x + this.SIZE / 2,
                y0 = this.y + this.SIZE / 2,
                r = this.SIZE / 3.5,
                angle = 2 * Math.PI,
                x1, y1,
                x2, y2,
                gradient = context.createRadialGradient(x0 - 4, y0 - 2, 0, x0 - 4, y0 - 2, r);

            gradient.addColorStop(0, this.MINE_COLOR_FILL);
            gradient.addColorStop(1, this.MINE_COLOR_STROKE);

            // Circle of mine
            context.beginPath();
            context.arc(x0, y0, r, 0, 2 * Math.PI, false);
            context.fillStyle = gradient;
            context.fill();
            context.lineWidth = 5;
            context.strokeStyle = this.MINE_COLOR_STROKE;
            context.stroke();

            // thorns of mine
            while (angle) {
                x1 = x0 + r * Math.cos(angle);
                y1 = y0 + r * Math.sin(angle);
                x2 = x0 + (r + this.THORN_HEIGHT) * Math.cos(angle);
                y2 = y0 + (r + this.THORN_HEIGHT) * Math.sin(angle);
                context.beginPath();
                context.moveTo(x1, y1);
                context.lineTo(x2, y2);
                context.stroke();
                angle -= Math.PI / 4;
            }

            // Thorn in the middle of mine
            context.moveTo(x0, y0 - this.THORN_HEIGHT / 4);
            context.lineTo(x0 , y0 + this.THORN_HEIGHT / 4);
            context.stroke();
        },

        drawFlag: function () {
            context.drawImage(this.imgFlag, this.x + 2, this.y + 2);
        },

        drawStrikeoutFlag: function () {
            context.save();
            context.lineWidth = 6;
            context.strokeStyle = this.MINE_COLOR_STROKE;
            context.lineCap = "round";
            context.beginPath();
            context.moveTo(this.x + 5, this.y + 5);
            context.lineTo(this.x + this.SIZE - 8, this.y + this.SIZE - 8);
            context.moveTo(this.x + this.SIZE - 8, this.y + 5);
            context.lineTo(this.x + 5, this.y + this.SIZE - 8);
            context.stroke();
            context.closePath();
            context.restore();
        },

        draw: function(content, isOpened, isMine, isMarked) {
            var grd = context.createLinearGradient(this.x, this.y, this.x, this.y + this.SIZE);

            context.save();

            if (isOpened) {
                grd.addColorStop(0, this.TOP_COLOR_OPENED);
                grd.addColorStop(1, this.BOTTOM_COLOR_OPENED);
            } else {
                grd.addColorStop(0, this.TOP_COLOR_CLOSED);
                grd.addColorStop(1, this.BOTTOM_COLOR_CLOSED);
            }
            context.lineWidth = 1;
            context.fillStyle = grd;
            context.strokeStyle = "#7d838c";
            context.roundRect(this.x, this.y, this.SIZE, this.SIZE, 6, true, false);
            context.roundRect(this.x -1 , this.y - 1, this.SIZE, this.SIZE, 6, false, true);

            if (isOpened) { // Drawing number in the middle of the cell
                if (typeof content != 'undefined' && content > 0) {
                    context.font = 'bold ' + this.FONT_SIZE + 'px Arial';
                    context.textAlign = 'center';
                    context.textBaseline = 'middle';
                    context.fillStyle = this.COLORS_NUMBER[(content - 1) % this.COLORS_NUMBER.length];
                    context.fillText(content.toString(), this.x + this.SIZE / 2, this.y + this.SIZE / 2);
                }
                if (isMine) {
                    this.drawMine();
                }
            } else {
                if (isMarked) {
                    this.drawFlag();
                }
            }

            context.restore();
        },

        load: function() {
            this.imgFlag = new Image();
            this.imgFlag.src = '../asset/flag.png';
            this.imgMine = new Image();
            this.imgMine.src = '../asset/mine.png';
        }
    };

    mines.view.Cell.prototype.load();
})();


/**
 * Face class
 *
 * @namespace mines.view
 * @class mines.view.Face
 */
(function()
{
    mines.view.Face = function(x, y)
    {
        mines.view.Face.superclass.constructor.call(this);

        //--------------------------------------------------------------------------
        //  Modules
        //--------------------------------------------------------------------------

        var Constants = mines.Constants,
            Event = mines.utils.Event;

        //--------------------------------------------------------------------------
        //  Private members
        //--------------------------------------------------------------------------

        var numLoaded = 0,
            NUM_IMAGES = 5,
            self = this,
            context = CONTEXT,
            faceSmile = null,
            faceWorried = null,
            faceSad = null,
            faceCool = null,
            faceWin = null;

        //--------------------------------------------------------------------------
        //  Public members
        //--------------------------------------------------------------------------

        this.x = x;
        this.y = y;
        this.SIZE = 50;

        //--------------------------------------------------------------------------
        //  Private methods
        //--------------------------------------------------------------------------

        var addLoaded = function() {
            numLoaded++;
            if (numLoaded == NUM_IMAGES) {
                self.dispatchEvent(Event.LOADED);
            }
        };

        //--------------------------------------------------------------------------
        //  Public methods
        //--------------------------------------------------------------------------

        this.load = function() {
            faceSmile = new Image();
            faceSmile.src = '../asset/face-smile.png';
            faceSmile.onload = addLoaded;
            faceWorried = new Image();
            faceWorried.src = '../asset/face-worried.png';
            faceWorried.onload = addLoaded;
            faceCool = new Image();
            faceCool.src = '../asset/face-cool.png';
            faceCool.onload = addLoaded;
            faceSad = new Image();
            faceSad.src = '../asset/face-sad.png';
            faceSad.onload = addLoaded;
            faceWin = new Image();
            faceWin.src = '../asset/face-win.png';
            faceWin.onload = addLoaded;
        };

        this.draw = function(state) {
            context.clearRect(this.x, this.y, this.SIZE, this.SIZE);
            switch (state) {
                case Constants.FACE_SMILE:
                    context.drawImage(faceSmile, this.x, this.y);
                    break;
                case Constants.FACE_WORRIED:
                    context.drawImage(faceWorried, this.x, this.y);
                    break;
                case Constants.FACE_COOL:
                    context.drawImage(faceCool, this.x, this.y);
                    break;
                case Constants.FACE_SAD:
                    context.drawImage(faceSad, this.x, this.y);
                    break;
                case Constants.FACE_WIN:
                    context.drawImage(faceWin, this.x, this.y);
                    break;
            }
        };
    };

    //--------------------------------------------------------------------------
    //  Static members
    //--------------------------------------------------------------------------

    mines.view.Face.SIZE = 50;

    // Inherit from event dispatcher
    extend(mines.view.Face, mines.utils.EventDispatcher);
})();


/**
 * Clock class
 *
 * @namespace mines.view
 * @class mines.view.Clock
 */
(function()
{
    mines.view.Clock = function(x, y)
    {
        //--------------------------------------------------------------------------
        //  Private members
        //--------------------------------------------------------------------------

        var context = CONTEXT,
            FONT = 'bold 48px EmbDigital',
            PADDING = 22,
            HEIGHT = 50,
            width = 0,
            grd,
            userAgent,
            isFF,
            baseLine;

        //--------------------------------------------------------------------------
        //  Private methods
        //--------------------------------------------------------------------------

        var updateWidth = function() {
            context.font = FONT;
            width = context.measureText('00:00').width + PADDING * 2;
            context.font = '';
        };

        var drawRect = function() {
            context.lineWidth = 2;
            context.strokeStyle = '#9c9c9c';
            context.fillStyle = grd;
            context.roundRect(x, y, width, HEIGHT, 8, true, true);
        };

        var check = function(r) {
            return r.test(userAgent);
        };

        //--------------------------------------------------------------------------
        //  Public methods
        //--------------------------------------------------------------------------

        this.updateTime = function(strTime) {
            context.save();
            drawRect();
            context.font = FONT;
            context.textAlign = "left";
            context.textBaseline = baseLine;
            context.fillStyle = '#00A000';
            context.fillText(strTime, x + PADDING, y);
            context.restore();
        };

        // Initialize
        updateWidth();
        grd = context.createLinearGradient(x, y, x, y + HEIGHT);
        grd.addColorStop(0, '#fcfcfc');
        grd.addColorStop(1, '#e1dfde');
        // Bug in Firefox! textBaseLine displays doesn't correct
        userAgent = navigator.userAgent.toLowerCase();
        isFF = check(/firefox/);
        if (isFF) {
            baseLine = 'middle';
        } else {
            baseLine = 'top';
        }
        this.updateTime('00:00');
    };
})();


/**
 * ViewGame class
 *
 * @namespace mines.view
 * @class mines.view.ViewGame
 */
(function()
{
    mines.view.ViewGame = function ()
    {
        mines.view.ViewGame.superclass.constructor.call(this);

        //--------------------------------------------------------------------------
        //  Modules
        //--------------------------------------------------------------------------

        var
            Matrix = mines.utils.Matrix,
            Collision = mines.utils.Collision,
            Dom = mines.utils.Dom,
            Event = mines.utils.Event,
            Constants = mines.Constants,
            Button = mines.view.Button,
            Cell = mines.view.Cell,
            Face = mines.view.Face,
            Clock = mines.view.Clock;

        //--------------------------------------------------------------------------
        //  Private members
        //--------------------------------------------------------------------------

        var self = this,
            cells = null,
            canvasPosition = null,
            numRows, numCols,
            face,
            clock,
            context,
            timerID,
            wasMarked,
            wasMoved,
            isMobile,
            PADDING = 3,
            PADDING_HEADER = 50,
            BUTTON_HEIGHT = 50,
            HEADER_HEIGHT = 60;


        //--------------------------------------------------------------------------
        //  Public members
        //--------------------------------------------------------------------------

        this.canvas = null;
        this.bBack = null;

        //--------------------------------------------------------------------------
        //  Private methods
        //--------------------------------------------------------------------------

        var initListeners = function() {
            if (isMobile) {
                self.canvas.addEventListener('touchstart', onTouchStart);
                self.canvas.addEventListener('touchend', onTouchEnd);
                self.canvas.addEventListener('touchmove', onTouchMove);
            } else {
                self.canvas.addEventListener('click', onClick);
                self.canvas.addEventListener('mousedown', onMouseDown);
                self.canvas.addEventListener('mouseup', onMouseUp);
                window.document.body.onselectstart = function () {return false;};
            }
        };

        var removeListeners = function() {
            if (isMobile) {
                self.canvas.removeEventListener('touchstart', onTouchStart);
                self.canvas.removeEventListener('touchend', onTouchEnd);
                self.canvas.removeEventListener('touchmove', onTouchMove);
            } else {
                self.canvas.removeEventListener('click', onClick);
                self.canvas.removeEventListener('mousedown', onMouseDown);
                self.canvas.removeEventListener('mouseup', onMouseUp);
            }
        };

        var getCellAtMouse = function (mouseX, mouseY) {
            var cell, i = numRows, j = numCols;

            while (i--) {
                while (j--) {
                    cell = cells[i][j];
                    if (Collision.hitTestPoint(cell, mouseX, mouseY)) {
                        return cell;
                    }
                }
                j = numCols;
            }
            return cell;
        };

        //--------------------------------------------------------------------------
        //  Event handlers
        //--------------------------------------------------------------------------

        var onClick = function (e) {
            if (e.which == 3) {
                return;
            }
            var mouseX = e.clientX + window.scrollX - canvasPosition.x,
                mouseY = e.clientY + window.scrollY - canvasPosition.y;
            if (mouseY > HEADER_HEIGHT) {
                self.dispatchEvent(Event.CELL_CLICK, getCellAtMouse(mouseX, mouseY));
                clearTimeout(timerID);
            } else {
                if (Collision.hitTestPoint(self.bBack, mouseX, mouseY)) {
                    self.dispatchEvent(Event.BUTTON_CLICK, self.bBack);
                }
            }
        };

        var onMouseDown = function (e) {
            if (e.which == 3) {
                this.oncontextmenu = function () {
                    return false;
                };
            } else if (e.clientY + window.scrollY - canvasPosition.y > HEADER_HEIGHT) {
                self.dispatchEvent(Event.CELL_MOUSE_DOWN);
            }
        };

        var onMouseUp = function (e) {
            if (e.which == 3) { // Right click
                var cell = getCellAtMouse(e.clientX + window.scrollX - canvasPosition.x,
                    e.clientY + window.scrollY - canvasPosition.y);
                self.dispatchEvent(Event.CELL_RIGHT_CLICK, cell);
            } else {
                self.dispatchEvent(Event.CELL_MOUSE_UP);
            }
        };

        var onTouchStart = function(e) {
            var y = e.changedTouches[0].clientY;
            if (e.changedTouches[0].clientY + window.scrollY - canvasPosition.y > HEADER_HEIGHT) {
                self.dispatchEvent(Event.CELL_MOUSE_DOWN);
                var cell = getCellAtMouse(e.changedTouches[0].clientX + window.scrollX - canvasPosition.x,
                    e.changedTouches[0].clientY + window.scrollY - canvasPosition.y);
                timerID = setTimeout(function() {
                    self.dispatchEvent(Event.CELL_RIGHT_CLICK, cell);
                    wasMarked = true;
                }, 900);
            }
        };

        var onTouchEnd = function(e) {
            if (wasMarked || wasMoved) {
                wasMarked = wasMoved = false;
                self.dispatchEvent(Event.CELL_MOUSE_UP);
                return;
            }
            var mouseX = e.changedTouches[0].clientX + window.scrollX - canvasPosition.x,
                mouseY = e.changedTouches[0].clientY + window.scrollY - canvasPosition.y;
            if (mouseY > HEADER_HEIGHT) {
                self.dispatchEvent(Event.CELL_CLICK, getCellAtMouse(mouseX, mouseY));
                clearTimeout(timerID);
            } else {
                if (Collision.hitTestPoint(self.bBack, mouseX, mouseY)) {
                    self.dispatchEvent(Event.BUTTON_CLICK, self.bBack);
                }
            }
        };

        var onTouchMove = function(e) {
            wasMoved = true;
            clearTimeout(timerID);
        };

        var onLoadedFaces = function() {
            face.removeEventListener(Event.LOADED, onLoadedFaces);
            face.draw(Constants.FACE_SMILE);
        };

        //--------------------------------------------------------------------------
        //  Public methods
        //--------------------------------------------------------------------------

        this.init =  function(cols, rows, canvasId) {
            var cellSize = Cell.prototype.SIZE;
            this.canvas = document.getElementById(canvasId);
            this.canvas.width = cellSize * cols + 20;
            this.canvas.height = cellSize * rows + 20 + HEADER_HEIGHT;
            canvasPosition = Dom.getElementPosition(this.canvas);
            context =  this.canvas.getContext('2d');
            numCols = cols;
            numRows = rows;
            isMobile = false;

            // Matrix cells
            cells = Matrix.create(rows, cols);
            for (var i = 0; i < rows; i++) {
                for (var j = 0; j < cols; j++) {
                    cells[i][j] = new Cell(i, j, i * cellSize + PADDING, j * cellSize + PADDING + HEADER_HEIGHT);
                    cells[i][j].draw(0, false, false, false);
                }
            }

            // Face
            face = new Face((this.canvas.width - Face.SIZE) / 2, PADDING);
            face.load();
            face.addEventListener(Event.LOADED, onLoadedFaces);

            // Button back to menu
            this.bBack = new Button('В меню', PADDING, PADDING, 0, BUTTON_HEIGHT);
            this.bBack.x = face.x - this.bBack.width - PADDING_HEADER;
            this.bBack.show();

            // Clock
            clock = new Clock(face.x + face.SIZE + PADDING_HEADER, PADDING);

            initListeners();
        };

        this.destroy = function() {
            removeListeners();
        };

        this.getCell = function(i, j) {
            return cells[i][j];
        };

        this.drawMine = function(i, j) {
            cells[i][j].drawMine();
        };

        this.drawStrikeoutFlag = function(i, j) {
            cells[i][j].drawStrikeoutFlag();
        };

        this.redrawCell = function(i, j, content, isOpened, isMine, isMarked) {
            var cell = this.getCell(i, j);
            cell.draw(content, isOpened, isMine, isMarked);
        };

        this.redrawFace = function(state) {
            face.draw(state);
        };

        this.updateTime = function(strTime) {
            clock.updateTime(strTime);
        };
    };

    // Inherit from event dispatcher
    extend(mines.view.ViewGame, mines.utils.EventDispatcher);
})();
