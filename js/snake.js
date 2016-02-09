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

Snake.DIFFERENCE = {
  "N": new Coordinate(-1, 0),
  "S": new Coordinate(1, 0),
  "E": new Coordinate(0, 1),
  "W": new Coordinate(1, 0)
};

var Snake = function (board) {
  this.direction = "N";

  var center =
    new Coordinate(Math.floor(board.size/2), Math.floor(board.size/2));
  this.segments = [center];
};

Snake.prototype.head = function () {
  var last = this.segments.length - 1;
  return this.segments[last];
};

Snake.prototype.move = function () {
  // Move snake forward by adding a new segment in the direction the snake
  // is traveling in.
  var newSegment = this.head().plus(Snake.DIFFERENCE[this.direction]);
  this.segments.push();

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
};

module.exports = Board;
