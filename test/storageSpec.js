var chai = require('chai'),
  expect = chai.expect,
  chaiAsPromised = require("chai-as-promised"),
  Storage = require('../lib/storage').Storage,
  utils = require('./utils'),
  offer = utils.offer,
  deal = utils.deal;

chai.use(chaiAsPromised);

describe('Store', function() {
  var storage = new Storage();

  before(function(done) {
    storage.open().then(done, done);
  })

  after(function(done) {
    storage.close().then(done, done);
  })

  beforeEach(function(done) {
    storage.clear().then(function() {done();}, done);
  });

  it('should store arriving offers and deals', function(done) {
    promiseOffer(storage, '1: sell 1 COOKIES for 3')()
    .then(promiseOffer(storage, '2: buy 1 COOKIES for 3'))
    .then(promiseDeal(storage, '2 buys 1 COOKIES for 3: 1 from 1'))
    .then(function() {
      expect(storage.load()).to.eventually.deep.equal({
        COOKIES: {
          "3": {
            sell: [],
            buy: []
          }
        }
      }).notify(done);
    }, function(error) {
      done(error);
    })
  })

  it('should store arriving offers', function(done) {
    storage.writeOffer(offer('1: sell 1 COOKIES for 3'))
    .then(function() {
      expect(storage.load()).to.eventually.deep.equal({
        COOKIES: {
          "3": {
            sell: [{oid:1, amount: 1}],
            buy: []
          }
        }
      }).notify(done);
    }, function(error) {
      done(error);
    })
  })
})

function promiseOffer(storage, offerTxt) {
  return function() {
    return storage.writeOffer(offer(offerTxt));
  }
}

function promiseDeal(storage, offerTxt) {
  return function() {
    return storage.writeDeal(deal(offerTxt));
  }
}
