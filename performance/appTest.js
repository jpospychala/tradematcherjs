var utils = require('../test/utils'),
  toHuman = utils.toHuman,
  range = utils.range,
  shuffle = utils.shuffle,
  random = utils.random,
  generateOffers = utils.generateOffers,
  App = require('../lib/app').App;

app = new App();
app.start()
.then(function() {
  return app.storage.clear();
})
.then(function() {
    offersCount = 1000;
    perfTest(generateOffers(offersCount*=2, ['A'], range(1,1), random(100, 3000)), app);
});


function perfTest(offers, app) {
  shuffle(offers);
  var matchedAmount = 0;
  var totalAmount = offers
    .map(function(o) { return o.is == 'buy' ? o.amount : 0; })
    .reduce(function(a, b) { return a+b; });

  var listener = function(deal) {
    matchedAmount += deal[0].amount;
    if (matchedAmount === totalAmount) {
      finish();
    }
  }

  app.on('match', listener);

  var start = new Date().getTime();
  offers.forEach(function(offer) {
    app.offer(offer);
  });

  var finish = function() {
    var end = new Date().getTime();
    console.error(offers.length+' offers, '+((end-start)/1000).toFixed(2)+' secs, '+(offers.length*1000/(end-start)).toFixed()+' offers/sec');

    app.removeListener(listener);

    app.stop();
  }
}
