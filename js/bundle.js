/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/js/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var SnakeView = __webpack_require__(1);
	
	$(function () {
	  var rootEl = $('.snake-game');
	  new SnakeView(rootEl);
	});


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var Board = __webpack_require__(2);
	
	var View = function ($el) {
	  this.$el = $el;
	
	  this.board = new Board(20);
	  this.setupGrid();
	
	  this.interval = window.setInterval(this.step.bind(this), 500);
	
	  $(window).on("keydown", this.handleKeyEvent.bind(this));
	};
	
	View.KEYS = {
	  38: "N",
	  39: "E",
	  40: "S",
	  37: "W"
	};
	
	View.prototype.handleKeyEvent = function (event) {
	  var direction = View.KEYS[event.keyCode];
	  if (direction) {
	    this.board.snake.turn(direction);
	  }
	};
	
	View.prototype.render = function () {
	  this.updateClasses(this.board.snake.segments, "snake");
	  this.updateClasses([this.board.apple.position], "apple");
	};
	
	View.prototype.updateClasses = function (coordinates, className) {
	  this.$li.filter("." + className).removeClass();
	
	  coordinates.forEach( function (coordinate) {
	    var flatCoordinate = (coordinate.a * this.board.size) + coordinate.b;
	    this.$li.eq(flatCoordinate).addClass(className);
	  }.bind(this));
	};
	
	View.prototype.setupGrid = function () {
	  var html = "";
	
	  for (var i = 0; i < this.board.size; i++) {
	    html += "<ul>";
	    for (var j = 0; j < this.board.size; j++) {
	      html += "<li></li>";
	    }
	    html += "</ul>";
	  }
	
	  this.$el.html(html);
	  this.$li = this.$el.find("li");
	};
	
	View.prototype.step = function () {
	  this.board.snake.move();
	  this.render();
	};
	
	module.exports = View;


/***/ },
/* 2 */
/***/ function(module, exports) {

	var Coordinate = function (a, b) {
	  this.a = a;
	  this.b = b;
	};
	
	Coordinate.prototype.isOpposite = function (coordinate) {
	  return (this.a === (-1 * coordinate.a) && this.b === (-1 * coordinate.b));
	};
	
	Coordinate.prototype.plus = function (coordinate) {
	  return new Coordinate(this.a + coordinate.a, this.b + coordinate.b);
	};
	
	var Apple = function (board) {
	  this.board = board;
	  this.replace();
	};
	
	Apple.SYMBOL = "A";
	
	Apple.prototype.replace = function () {
	  var x = Math.floor(Math.random() * this.board.size);
	  var y = Math.floor(Math.random() * this.board.size);
	
	  while (this.board.snake.isOccupying([x, y])) {
	    x = Math.floor(Math.random() * this.board.size);
	    y = Math.floor(Math.random() * this.board.size);
	  }
	
	  this.position = new Coordinate(x, y);
	};
	
	var Snake = function (board) {
	  this.direction = "N";
	  this.turning = false;
	  this.board = board;
	
	  var center =
	    new Coordinate(Math.floor(board.size/2), Math.floor(board.size/2));
	  this.segments = [center];
	};
	
	Snake.DIFFERENCE = {
	  "N": new Coordinate(-1, 0),
	  "S": new Coordinate(1, 0),
	  "E": new Coordinate(0, 1),
	  "W": new Coordinate(0, -1)
	};
	
	Snake.SYMBOL = "S";
	
	Snake.prototype.isOccupying = function (array) {
	  var result = false;
	  this.segments.forEach( function (segment) {
	    if (segment.a === array[0] && segment.b === array[1]) {
	      result = true;
	      return result;
	    }
	  });
	  return result;
	};
	
	Snake.prototype.head = function () {
	  var last = this.segments.length - 1;
	  return this.segments[last];
	};
	
	Snake.prototype.move = function () {
	  // Move snake forward by adding a new segment in the direction the snake
	  // is traveling in.
	  var newSegment = this.head().plus(Snake.DIFFERENCE[this.direction]);
	  this.segments.push(newSegment);
	
	  // Allow snake to turn again
	  this.turning = false;
	
	  // Remove a segment from the end of the snake
	  this.segments.shift();
	};
	
	Snake.prototype.turn = function (direction) {
	  if (
	    Snake.DIFFERENCE[this.direction].isOpposite(Snake.DIFFERENCE[direction]) ||
	    this.turning
	  ) {
	    return;
	  } else {
	    this.turning = true;
	    this.direction = direction;
	  }
	};
	
	var Board = function (size) {
	  this.size = size;
	
	  this.snake = new Snake(this);
	  this.apple = new Apple(this);
	};
	
	Board.BLANK_SYMBOL = ".";
	
	Board.blankGrid = function (size) {
	  var grid = [];
	
	  for (var i = 0; i < size; i++) {
	    var row = [];
	    for (var j = 0; j < size; j++) {
	      row.push(Board.BLANK_SYMBOL);
	    }
	    grid.push(row);
	  }
	
	  return grid;
	};
	
	Board.prototype.render = function () {
	  var grid = Board.blankGrid(this.size);
	
	  this.snake.segments.forEach( function (segment) {
	    grid[segment.a][segment.b] = Snake.SYMBOL;
	  });
	
	  grid[this.apple.position.a][this.apple.position.b] = Apple.SYMBOL;
	
	  var rowStrs = [];
	  grid.map( function (row) {
	    return row.join("");
	  }).join("\n");
	};
	
	module.exports = Board;


/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map