var chai = require('chai'),
  expect = chai.expect;

function offer(descr) {
  // "123: sell 1 COOKIES for 3"
  var args = descr.split(' ');
  return {
    is: args[1],
    amount: parseFloat(args[2]),
    product: args[3],
    price: parseFloat(args[5]),
    oid: parseInt(args[0].replace(":", "")) };
}

function toHuman(offer) {
  return offer.oid+": "
    +offer.is+" "+offer.amount+" "
    +offer.product+" for "+offer.price;
}

function dealToHuman(deal) {
  var ret = deal[0].oid + " "+deal[0].is+"s "+deal[0].amount+": ";
  deal[1].forEach(function(d, idx, array) {
    ret += d.amount+" from "+d.oid;
    if (idx + 1 < array.length) {
      ret += ", ";
    }
  });
  return ret;
}

function deal(descr) {
  // "126 buys 10: 2 from 123, 8 from 125"
  var deal = descr.split(":");
  var args1 = deal[0].split(' ');
  var offer1 = {
    oid: parseInt(args1[0]),
    amount: parseFloat(args1[2]),
    is: args1[1] === 'buys' ? 'buy': 'sell',
    product: args1[3],
    price: parseFloat(args1[5])
  };

  var args2 = deal[1].split(',');
  var offers = [];
  args2.forEach(function(arg2) {
    var arg = arg2.trim().split(' ');
    var counter_offer = {
      oid: parseInt(arg[2])
    };
    if (arg[0].indexOf('/') != -1) {
      var amounts_split = arg[0].split('/');
      counter_offer.amount = parseFloat(amounts_split[0]);
      counter_offer.amount_before = parseFloat(amounts_split[1]);
    } else {
      counter_offer.amount = parseFloat(arg[0]);
    }
    offers.push(counter_offer);
  })

  return [offer1, offers];
}

function expectDeals(matcher, expectedMatches, callback) {
  var actualMatches = [];
  matcher.on('match', function(offer1, offer2) {
    actualMatches.push(dealToHuman([offer1, offer2]));
    if (actualMatches.length === expectedMatches.length) {
      expect(actualMatches).to.deep.equal(expectedMatches);
      callback();
    }
  });
}

function generateOffers(offers, offers_count, products, prices, amount_gen, idgen) {
  idgen = idgen || new Sequence();
  var start = new Date().getTime();
  products.forEach(function(product) {
    prices.forEach(function(price) {
      _generateOffers(offers, product, offers_count, amount_gen, price, idgen);
    });
  })
  var end = new Date().getTime();
}

function _generateOffers(offers, prod, offers_count, amount_gen, price, idgen) {
  var count = offers_count/2;
  var total = 0;
  while (count-- > 0) {
    var amount = amount_gen();
    total += amount;
    offers.push({oid:idgen.next(), amount: amount, product: prod, price: price,is:'sell'});
  }
  while (total > 0) {
    var amount = Math.min(amount_gen(), total);
    total -= amount;
    offers.push({oid:idgen.next(), amount: amount, product: prod, price: price,is:'buy'});
  }
}

function range(min, max) {
  var res = [];
  for (var i = min; i <= max; i++) {
    res.push(i);
  }
  return res;
}

function constant(val) {
  return function() { return val; }
}

function random(min, max) {
  return function() {
    return Math.floor(min + Math.random() * (max-min));
  }
}

function shuffle(array) {
  array.sort(function() {return Math.random() > 0.5 ? -1 : 1 })
}

function time(description, count, fn) {
  var start = new Date().getTime();
  var res = fn();
  var end = new Date().getTime();
  console.error(description+': '+((end-start)/1000).toFixed(2)+' secs, '+(count*1000/(end-start)).toFixed()+' /sec');
  return res;
}

function Sequence(startVal) {
  var i = startVal || 0;

  this.next = function() {
    return i++;
  }
}

module.exports = {
  offer: offer,
  deal: deal,
  expectDeals: expectDeals,
  toHuman: toHuman,
  dealToHuman: dealToHuman,
  range: range,
  generateOffers: generateOffers,
  shuffle: shuffle,
  constant: constant,
  random: random,
  time: time,
  Sequence: Sequence
}
