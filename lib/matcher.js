var util = require('util'),
  events = require('events');

function Matcher() {
  var that = this;
  this.availableOffers = 0;
  this.offers = {};

  this.send = function(offer) {
    this.emit('offer', offer);
  };

  this.on('offer', function(offer) {
    this.availableOffers++;
    var bucket = get_bucket(offer);
    if (bucket[not(offer.is)].length > 0) {
      this.availableOffers -= 2;
      this.emit('match', bucket[not(offer.is)][0], offer);
    } else {
      bucket[offer.is].push(to_bucket(offer));
    }
  });

  function get_bucket(offer) {
    if (! that.offers[offer.product]) {
      that.offers[offer.product] = {};
      that.offers[offer.product][offer.price] = {
        sell: [], buy: []
      };
    }
    else if (! that.offers[offer.product][offer.price]) {
      that.offers[offer.product][offer.price] = {
        sell: [], buy: []
      };
    }
    return that.offers[offer.product][offer.price];
  }

  function to_bucket(offer) {
    return {amount: offer.amount, oid: offer.oid};
  }

  function not(is) {
    return is == 'sell' ? 'buy': 'sell';
  }
}

util.inherits(Matcher, events.EventEmitter);

module.exports = {
  Matcher: Matcher
}
