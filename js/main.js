var SnakeView = require('./snake-view');

$(function () {
  var el = $('.snake-game');
  var rootEl = $('.root');
  new SnakeView(el, rootEl);
});
