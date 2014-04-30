var chai = require('chai'),
  expect = chai.expect,
  matcher = require('../lib/matcher');

describe('TradeMatcherJS', function() {
  it('should match equal opposite transactions', function(done) {
    var m = new matcher.Matcher();
    m.on('match', function(offer1, offer2) {
      expect(offer1.oid).to.equal(123);
      expect(offer2.oid).to.equal(901);
      done();
    });

    m.send({ product: 'COOKIES', price: 1, to_sell: 10, oid: 123 });
    m.send({ product: 'COOKIES', price: 1, to_buy: 10, oid: 901 });
  })
});
