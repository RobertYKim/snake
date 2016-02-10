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
	  var el = $('.snake-game');
	  var rootEl = $('.root');
	  new SnakeView(el, rootEl);
	});


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var Board = __webpack_require__(2);
	
	var View = function ($el, $rootEl) {
	  this.$el = $el;
	  this.$rootEl = $rootEl;
	
	  this.board = new Board(20);
	  this.setupGrid();
	
	  this.paused = false;
	  this.interval = window.setInterval(this.step.bind(this), 100);
	  this.pause();
	
	  $(window).on("keydown", this.handleKeyEvent.bind(this));
	};
	
	View.KEYS = {
	  32: "P",
	  38: "N",
	  39: "E",
	  40: "S",
	  37: "W"
	};
	
	View.prototype.handleKeyEvent = function (event) {
	  var input = View.KEYS[event.keyCode];
	  if (input !== "P") {
	    this.board.snake.turn(input);
	  } else if (input === "P") {
	    this.pause();
	  }
	};
	
	View.prototype.pause = function () {
	  $(".paused").toggleClass("show");
	
	  // Toggle pause state
	  this.paused = (this.paused ? false : true);
	
	  if (this.paused) {
	    window.clearInterval(this.interval);
	  } else {
	    this.interval = window.setInterval(this.step.bind(this), 100);
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
	
	View.prototype.updateScore = function (score) {
	  $('.score').html( "Score: " + this.board.snake.score);
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
	  if (this.board.snake.segments.length > 0) {
	    this.board.snake.move();
	    this.render();
	    this.updateScore(this.board.snake.score);
	  } else {
	    alert("You lose!");
	    window.clearInterval(this.interval);
	  }
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
	
	Coordinate.prototype.equals = function (coordinate) {
	  return (this.a === coordinate.a) && (this.b === coordinate.b);
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
	
	  this.growTurns = 0;
	  this.score = 0;
	};
	
	Snake.DIFFERENCE = {
	  "N": new Coordinate(-1, 0),
	  "S": new Coordinate(1, 0),
	  "E": new Coordinate(0, 1),
	  "W": new Coordinate(0, -1)
	};
	
	Snake.SYMBOL = "S";
	Snake.GROW_TURNS = 3;
	Snake.APPLE_POINTS = 10;
	
	Snake.prototype.eatApple = function () {
	  if (this.head().equals(this.board.apple.position)) {
	    this.growTurns += Snake.GROW_TURNS;
	    this.score += Snake.APPLE_POINTS;
	    return true;
	  } else {
	    return false;
	  }
	};
	
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
	
	Snake.prototype.isValid = function () {
	  var head = this.head();
	
	  if (!this.board.validPosition(this.head())) {
	    return false;
	  }
	
	  for (var i = 0; i < this.segments.length - 1; i++) {
	    if (this.segments[i].equals(head)) {
	      return false;
	    }
	  }
	
	  return true;
	};
	
	Snake.prototype.move = function () {
	  // Move snake forward by adding a new segment in the direction the snake
	  // is traveling in.
	  var newSegment = this.head().plus(Snake.DIFFERENCE[this.direction]);
	  this.segments.push(newSegment);
	
	  // Allow snake to turn again
	  this.turning = false;
	
	  // Check for contact with apple
	  if (this.eatApple()) {
	    this.board.apple.replace();
	  }
	
	  // Remove tail segment if not growing
	  if (this.growTurns > 0) {
	    this.growTurns -= 1;
	  } else {
	    this.segments.shift();
	  }
	
	  // Destroy snake if collides with wall or self
	  if (!this.isValid()) {
	    this.segments = [];
	  }
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
	
	Board.prototype.validPosition = function (coordinate) {
	  return (
	    (coordinate.a >= 0) &&
	    (coordinate.a < this.size) &&
	    (coordinate.b >= 0) &&
	    (coordinate.b < this.size)
	  );
	};
	
	module.exports = Board;


/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map