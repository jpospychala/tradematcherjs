var util = require('util'),
  events = require('events');

function Matcher() {
  var that = this;
  this.availableOffers = 0;
  this.offers = {};

  this.send = function(offer) {
    this.emit('offer', offer);
  };

  this.discard = function(offer) {
    this.emit('discard', offer);
  };

  this.on('discard', function(offer) {
    var bucket = get_bucket(offer);
    var bucket_side = bucket[offer.is];
    var idx = bucket_side.map(function(o){return o.oid==offer.oid}).indexOf(true);
    if (idx != -1) {
      bucket_side = bucket_side.splice(idx, 1);
      this.availableOffers--;
    }
  });

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
        bucket[offer.is].push(offer);
        this.emit('match', subtract(offer, opposite_amount), opposite_offers);
      } else if (opposite_amount === offer.amount) {
        this.availableOffers -= i + 2;
        this.emit('match', offer, opposite_offers);
      } else {
        this.availableOffers -= i + 1;
        neg_bucket.push(opposite_offers.pop());
        opposite_offers.push(subtract(opposite, offer.amount + opposite.amount - opposite_amount));
        this.emit('match', offer, opposite_offers);
      }

    } else {
      bucket[offer.is].push(offer);
    }
  });

  function get_bucket(offer) {
    if (that.offers[offer.product] === undefined) {
      that.offers[offer.product] = {};
    }
    if (that.offers[offer.product][offer.price] === undefined) {
      that.offers[offer.product][offer.price] = {
        sell: [], buy: []
      };
    }
    return that.offers[offer.product][offer.price];
  }

  function not(is) {
    return is === 'sell' ? 'buy': 'sell';
  }

  function subtract(from, amount) {
    from.amount -= amount;
    return {
      amount: amount,
      oid:from.oid,
      is: from.is,
      product: from.product,
      price: from.price
    };
  }
}

util.inherits(Matcher, events.EventEmitter);

module.exports = {
  Matcher: Matcher
}
