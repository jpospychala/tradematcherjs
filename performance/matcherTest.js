var utils = require('../test/utils'),
  toHuman = utils.toHuman,
  range = utils.range,
  shuffle = utils.shuffle,
  random = utils.random,
  generateOffers = utils.generateOffers,
  matcher = require('../lib/matcher');

m = new matcher.Matcher();
offersCount = 100;
while (true) {
    perfTest(generateOffers(offersCount*=2, ['A'], range(1,1), random(100, 3000)), m);
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
