var chai = require('chai'),
  expect = chai.expect,
  chaiAsPromised = require("chai-as-promised"),
  Q = require('q'),
  Storage = require('../lib/mongostorage').Storage,
  utils = require('./utils'),
  offer = utils.offer,
  deal = utils.deal;

chai.use(chaiAsPromised);

describe('Store', function() {
  var storage = new Storage();

  before(function(done) {
    storage.open().then(function(x) {done();}, done);
  })

  after(function(done) {
    storage.close().then(done, done);
  })

  beforeEach(function(done) {
    storage.clear().then(function() {done();}, done);
  });

  it('should store arriving offers and deals', function(done) {
    store(storage, [
      '1: sell 1 COOKIES for 3',
      '2: buy 1 COOKIES for 3',
      '2 buys 1 COOKIES for 3: 1 from 1'
    ])
    .then(function(store) {
      expect(store).to.deep.equal({});
    })
    .then(done, done);
  })

  it('should split offer in deal', function(done) {
    store(storage, [
        '1: sell 1 COOKIES for 3',
        '2: buy 2 COOKIES for 3',
        '2 buys 1 COOKIES for 3: 1 from 1'
      ])
    .then(function(store) {
      expect(store).to.deep.equal({
        COOKIES: {
          "3": {
            buy: [
              {oid: 2, amount: 1}
            ]
          }
        }
      });
    })
    .then(done, done);
  });

  it('should store multiple counter-offers in deal', function(done) {
    store(storage, [
       '1: sell 1 COOKIES for 3',
      '2: sell 1 COOKIES for 3',
      '3: buy 2 COOKIES for 3',
      '3 buys 2 COOKIES for 3: 1 from 1, 1 from 2'])
    .then(function(store) {
      expect(store).to.deep.equal({});
    })
    .then(done, done);
  });

  it('should split counter-offer in deal', function(done) {
    store(storage, [
      '1: sell 2 COOKIES for 3',
      '2: buy 1 COOKIES for 3',
      '2 buys 1 COOKIES for 3: 1 from 1'
    ])
    .then(function(store) {
      expect(store).to.deep.equal({
        COOKIES: {
          "3": {
            sell: [
              {oid: 1, amount: 1}
            ]
          }
        }
      });
    })
    .then(done, done);
  })

  it('should store arriving offers', function(done) {
    store(storage, ['1: sell 1 COOKIES for 3'])
    .then(function(store) {
      expect(store).to.deep.equal({
        COOKIES: {
          "3": {
            sell: [
              {oid: 1, amount: 1}
            ]
          }
        }
      });
    })
    .then(done, done);
  })
})

function store(storage, cmdsArray) {
  var promiseFns = cmdsArray.map(function(cmd) {
    if ((cmd.indexOf('buy ') >= 0) || (cmd.indexOf('sell ') >= 0)) {
      return storeOffer(storage, cmd);
    } else {
      return storeDeal(storage, cmd);
    }
  });
  return promiseFns.reduce(Q.when, Q(''))
    .then(function() {
      return storage.load();
    });
}

function storeOffer(storage, offerTxt) {
  return function() {
    return storage.writeOffer(offer(offerTxt));
  }
}

function storeDeal(storage, offerTxt) {
  return function() {
    return storage.writeDeal(deal(offerTxt));
  }
}
