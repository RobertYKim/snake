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

  while (
    this.board.snake.isOccupying([x, y]) ||
    this.board.computer.isOccupying([x, y])
  ) {
    x = Math.floor(Math.random() * this.board.size);
    y = Math.floor(Math.random() * this.board.size);
  }

  this.position = new Coordinate(x, y);
};

var Snake = function (board, type) {
  this.direction = "N";
  this.turning = false;
  this.board = board;
  this.type = type;

  var center;
  if (this.type === "human") {
    center = new Coordinate(
      Math.floor(board.size * (3/4)), Math.floor(board.size * (1/4))
    );
  } else {
    center = new Coordinate(
      Math.floor(board.size * (3/4)), Math.floor(board.size * (3/4))
    );
  }
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

Snake.prototype.isValid = function (enemySegments) {
  var head = this.head();

  if (!this.board.validPosition(this.head())) {
    return false;
  }

  for (var i = 0; i < this.segments.length - 1; i++) {
    if (this.segments[i].equals(head)) {
      return false;
    }
  }

  for (var j = 0; j < enemySegments.length; j++) {
    if (enemySegments[j].equals(head)) {
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
  var enemySegments;
  if (this.type === "human") {
    enemySegments = this.board.computer.segments;
  } else {
    enemySegments = this.board.snake.segments;
  }
  if (!this.isValid(enemySegments)) {
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

Snake.prototype.pickDirection = function () {
  var board = this.board;
  var appleX = board.apple.position.b;
  var headX = board.computer.head().b;
  var currentDirection = board.computer.direction;


  // Compare apple X position with snake head X position
  var xComparison;
  if (headX < appleX) {
    xComparison = -1;
  } else if (headX === appleX) {
    xComparison = 0;
  } else if (headX > appleX) {
    xComparison = 1;
  }

  // Decision making logic for computer snake: Move towards X-Coordinate of
  // apple, unless that direction is opposite current direction,
  // in which snake should move towards Y-Coordinate of apple.
  switch (xComparison) {
    case -1:
      this.dueEast();
    break;
    case 0:
      this.dueNorthOrSouth();
    break;
    case 1:
      this.dueWest();
    break;
  }
};

Snake.prototype.dueEast = function () {
  var board = this.board;
  var currentDirection = board.computer.direction;
  var appleY = board.apple.position.a;
  var headY = board.computer.head().a;
  if (currentDirection === "W") {
    this.direction = (headY > appleY ? "S" : "N");
  } else {
    this.direction = "E";
  }
};

Snake.prototype.dueNorthOrSouth = function () {
  var board = this.board;
  var currentDirection = board.computer.direction;
  var appleY = board.apple.position.a;
  var headY = board.computer.head().a;
  if (headY > appleY && currentDirection !== "S") {
    this.direction = "N";
  } else if (headY < appleY && currentDirection !== "N") {
    this.direction = "S";
  } else {
    this.direction = "E";
  }
};

Snake.prototype.dueWest = function () {
  var board = this.board;
  var currentDirection = board.computer.direction;
  var appleY = board.apple.position.a;
  var headY = board.computer.head().a;
  if (currentDirection === "E") {
    this.direction = (headY > appleY ? "S" : "N");
  } else {
    this.direction = "W";
  }
};

var Board = function (size) {
  this.size = size;

  this.snake = new Snake(this, "human");
  this.computer = new Snake(this, "computer");
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
