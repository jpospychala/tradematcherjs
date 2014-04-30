var util = require('util'),
  events = require('events');

function Matcher() {
  this.send = function(offer) {
    this.emit('offer', offer);
  };

  this.on('offer', function(offer) {
    if (this.offer1) {
      this.emit('match', this.offer1, offer);
    } else {
      this.offer1 = offer;
    }
  });
}

util.inherits(Matcher, events.EventEmitter);

module.exports = {
  Matcher: Matcher
}
