var chai = require('chai'),
  expect = chai.expect,
  utils = require('./utils'),
  offer = utils.offer,
  dealToHuman = utils.dealToHuman,
  App = require('../lib/app').App;

describe('App', function() {
  var app = new App();

  before(function(done) {
    app.start()
    .then(function() {
      return app.clear();
    })
    .then(function() {done()}, done);
  });

  after(function(done) {
    app.stop().then(done, done);
  });

  it('should match offers to deals and persist them', function(done) {
    app.on('match', function(deal) {
      try {
        expect(dealToHuman(deal)).to.equal("2 buys 1: 1 from 1");
        done();
      } catch(ex) {
        done(ex);
      }
    });

    app.offer(offer('1: sell 1 COOKIES for 3'))
    .then(function() {
      app.offer(offer('2: buy 2 COOKIES for 3'))
    }, done)
  });
});
