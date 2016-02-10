var Board = require('./snake.js');

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
