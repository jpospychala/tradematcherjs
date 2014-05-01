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
      var i =0;
      var neg_bucket = bucket[not(offer.is)];
      var opposite = neg_bucket[i];
      var opposite_amount = opposite.amount;
      while (i+1 < neg_bucket.length && opposite.amount <= offer.amount) {
        opposite = neg_bucket[++i];
        opposite_amount += opposite.amount;
      }
      var opposite_offers = neg_bucket.splice(0, i+1);

      if (opposite_amount < offer.amount) {
        this.availableOffers -= i + 1;
        bucket[offer.is].push(to_bucket(offer));
        this.emit('match', subtract(offer, opposite_amount), opposite_offers);
      } else if (opposite_amount === offer.amount) {
        this.availableOffers -= i + 2;
        this.emit('match', to_bucket(offer), opposite_offers);
      } else {
        this.availableOffers -= i + 1;
        neg_bucket.push(opposite_offers.pop());
        opposite_offers.push(subtract(opposite, offer.amount + opposite.amount - opposite_amount));
        this.emit('match', to_bucket(offer), opposite_offers);
      }

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
    return is === 'sell' ? 'buy': 'sell';
  }

  function subtract(from, amount) {
    from.amount -= amount;
    return {amount: amount, oid:from.oid};
  }
}

util.inherits(Matcher, events.EventEmitter);

module.exports = {
  Matcher: Matcher
}
