var chai = require('chai'),
  expect = chai.expect,
  matcher = require('../lib/matcher');

describe('TradeMatcherJS', function() {

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

  it('should match offers of same price', function() {
    var m = new matcher.Matcher();

    m.send({ product: 'COOKIES', price: 1, is: 'sell', amount: 10, oid: 123 });
    m.send({ product: 'COOKIES', price: 1.5, is: 'buy', amount: 10, oid: 901 });

    expect(m.availableOffers).to.equal(2);
  })

  it('should match opposite offers', function(done) {
    var m = new matcher.Matcher();
    m.on('match', function(offer1, offer2) {
      expect(offer1.oid).to.equal(901);
      expect(offer2.oid).to.equal(123);
      done();
    });

    m.send({ product: 'COOKIES', price: 1, is: 'sell', amount: 10, oid: 123 });
    m.send({ product: 'COOKIES', price: 1, is: 'buy', amount: 10, oid: 901 });

    expect(m.availableOffers).to.equal(0);
  })

  it('should match up to amount available on opposite side', function(done) {
    var m = new matcher.Matcher();
    m.on('match', function(offer1, offer2) {
      expect(offer1.amount).to.equal(5);
      expect(offer1.oid).to.equal(901);
      expect(offer2.oid).to.equal(123);
      expect(offer2.amount).to.equal(5);
      done();
    });

    m.send({ product: 'COOKIES', price: 1, is: 'sell', amount: 10, oid: 123 });
    m.send({ product: 'COOKIES', price: 1, is: 'buy', amount: 5, oid: 901 });

    expect(m.availableOffers).to.equal(1);
  })

  it('should match up to amount available on this side', function(done) {
    var m = new matcher.Matcher();
    m.on('match', function(offer1, offer2) {
      expect(offer1.amount).to.equal(5);
      expect(offer1.oid).to.equal(901);
      expect(offer2.oid).to.equal(123);
      expect(offer2.amount).to.equal(5);
      done();
    });

    m.send({ product: 'COOKIES', price: 1, is: 'sell', amount: 5, oid: 123 });
    m.send({ product: 'COOKIES', price: 1, is: 'buy', amount: 10, oid: 901 });

    expect(m.availableOffers).to.equal(1);
  })

  it('should match until funds available', function(done) {
    var m = new matcher.Matcher();
    var counter = 0;
    m.on('match', function() {
      (++counter == 2) && done();
    });

    m.send({ product: 'COOKIES', price: 1, is: 'sell', amount: 10, oid: 123 });
    m.send({ product: 'COOKIES', price: 1, is: 'buy', amount: 5, oid: 901 });
    m.send({ product: 'COOKIES', price: 1, is: 'buy', amount: 5, oid: 902 });

    expect(m.availableOffers).to.equal(0);
  })

  it('should match up to amount available on this side', function(done) {
    var m = new matcher.Matcher();
    m.on('match', function(offer1, offers2) {
      expect(offers2.length).to.equal(2);
      done();
    });

    m.send({ product: 'COOKIES', price: 1, is: 'sell', amount: 5, oid: 123 });
    m.send({ product: 'COOKIES', price: 1, is: 'sell', amount: 5, oid: 124 });
    m.send({ product: 'COOKIES', price: 1, is: 'buy', amount: 10, oid: 901 });

    expect(m.availableOffers).to.equal(0);
  })

});
