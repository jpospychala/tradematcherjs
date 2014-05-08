var utils = require('../test/utils'),
  toHuman = utils.toHuman,
  range = utils.range,
  shuffle = utils.shuffle,
  random = utils.random,
  time = utils.time,
  generateOffers = utils.generateOffers,
  matcher = require('../lib/matcher');

m = new matcher.Matcher();
offersCount = 5000;
var offers = [];
while (true) {
    generateOffers(offers, offersCount, ['A'], range(1,1), random(100, 3000))
    perfTest(offers, m);
}

function perfTest(offers, m) {
  shuffle(offers);

  time('matching '+offers.length+' offers', offers.length, function() {
    offers.forEach(function(offer) {
      m.send(offer);
    });
  })
}
