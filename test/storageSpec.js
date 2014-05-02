var chai = require('chai'),
  expect = chai.expect,
  chaiAsPromised = require("chai-as-promised"),
  Storage = require('../lib/storage').Storage,
  utils = require('./utils'),
  offer = utils.offer;

chai.use(chaiAsPromised);

describe('Store', function() {
  var storage = new Storage();

  before(function(done) {
    storage.open().then(done);
  })

  after(function(done) {
    storage.close().then(done);
  })

  it('should store arriving offers and deals', function(done) {
    storage.writeOffer(offer('1: sell 1 COOKIES for 3'))
    .then(function() {
      return storage.writeOffer(offer('2: buy 1 COOKIES for 3'));
    })
    .then(function() {
      return storage.writeDeal('2 deals 3: 3 from 1');
    })
    .then(function() {
      expect(storage.load()).to.eventually.deep.equal([]);
      done();
    }, function(error) {
      done(error);
    })
  })
})
