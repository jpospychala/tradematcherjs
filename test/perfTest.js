var utils = require('./utils'),
  toHuman = utils.toHuman,
  matcher = require('../lib/matcher');

m = new matcher.Matcher();
start = 100;
while (true) {
    perfTest(generateOffers(start*=2, ['A'], range(1,1), random(100, 3000)), m);
}


function generateOffers(offers_count, products, prices, amount_gen) {
  var start = new Date().getTime();
  offers = [];
  products.forEach(function(product) {
    prices.forEach(function(price) {
        offers = offers.concat(_generateOffers(product, offers_count, amount_gen));
    });
  })
  var end = new Date().getTime();
  console.error('gen: '+offers.length+' offers, '+((end-start)/1000).toFixed(2)+' secs, '+(offers.length/(end-start)).toFixed()+' offers/msec');
  return offers;
}
function _generateOffers(prod, offers_count, amount_gen, price) {
  var count = offers_count/2;
  var oid = 1;
  var offers = [];
  var total = 0;
  while (count-- > 0) {
    var amount = amount_gen();
    total += amount;
    offers.push({oid:oid++, amount: amount, product: prod, price: price,is:'sell'});
  }
  while (total > 0) {
    var amount = Math.min(amount_gen(), total);
    total -= amount;
    offers.push({oid:oid++, amount: amount, product: prod, price: price,is:'buy'});
  }
return offers;
}

function perfTest(offers, m) {
  shuffle(offers);

  var start = new Date().getTime();
  offers.forEach(function(offer) {
    m.send(offer);
  });
  var end = new Date().getTime();
  console.error(offers.length+' offers, '+((end-start)/1000).toFixed(2)+' secs, '+(offers.length/(end-start)).toFixed()+' offers/msec');

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
