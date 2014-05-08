var Q = require('q'),
  utils = require('../test/utils'),
  toHuman = utils.toHuman,
  range = utils.range,
  shuffle = utils.shuffle,
  random = utils.random,
  time = utils.time,
  generateOffers = utils.generateOffers,
  Sequence = utils.Sequence,
  App = require('../lib/app').App;

app = new App();
app.start()
.then(function() {
  return app.storage.clear();
})
.then(perfTest);

var s = new Sequence();

function perfTest() {
  var offersCount = 1000;
  var offers = [];
  generateOffers(offers, offersCount, ['A'], range(1,1), random(100, 3000), s);
  return runPerfTest(offers, app).then(perfTest);
}

function runPerfTest(offers, app) {
  var deferred = Q.defer();

  var totalAmount = offers
  .map(function(o) {return o.is == 'buy' ? o.amount : 0})
  .reduce(function(a, b) {return a+b});

  var amount = 0;
  var listener = function(deal) {
    amount += deal[0].amount;

    if (amount === totalAmount) {
      app.removeListener('match', listener);
      deferred.resolve();
      report(offers.length);
    }
  }

  app.on('match', listener);

  var start = new Date().getTime();

  var result = Q(true);
  offers.forEach(function(offer) {
    result = result.then(function() {
      return app.offer(offer);
    });
  });

  var report = function(count) {
    var end = new Date().getTime();
    console.error('matched '+count+' offers in '+((end-start)/1000).toFixed(2)+' secs, '+(count*1000/(end-start)).toFixed()+' offers/sec');
    start = end;
  }
  return deferred.promise;
}
