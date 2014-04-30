var chai = require('chai'),
  expect = chai.expect,
  matcher = require('../lib/matcher');

describe('TradeMatcherJS', function() {
  it('should match opposite offers', function(done) {
    var m = new matcher.Matcher();
    m.on('match', function(offer1, offer2) {
      expect(offer1.oid).to.equal(123);
      expect(offer2.oid).to.equal(901);
      done();
    });

    m.send({ product: 'COOKIES', price: 1, is: 'sell', amount: 10, oid: 123 });
    m.send({ product: 'COOKIES', price: 1, is: 'buy', amount: 10, oid: 901 });

    expect(m.availableOffers).to.equal(0);
  })

  it('should not match same direction offers', function() {
    var m = new matcher.Matcher();

    m.send({ product: 'COOKIES', price: 1, is: 'sell', amount: 10, oid: 123 });
    m.send({ product: 'COOKIES', price: 1, is: 'sell', amount: 10, oid: 901 });

    expect(m.availableOffers).to.equal(2);
  })

  it('should match offers of same product', function() {
    var m = new matcher.Matcher();

    m.send({ product: 'COOKIES', price: 1, is: 'sell', amount: 10, oid: 123 });
    m.send({ product: 'FLOWERS', price: 1, is: 'buy', amount: 10, oid: 901 });

    expect(m.availableOffers).to.equal(2);
  })
});
