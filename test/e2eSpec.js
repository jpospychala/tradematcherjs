var chai = require('chai'),
  expect = chai.expect,
  utils = require('./utils'),
  deal = utils.deal,
  offer = utils.offer,
  expectDeals = utils.expectDeals,
  matcher = require('../lib/matcher');

describe('TradeMatcherJS', function() {

  it('should not match same direction offers', function() {
    var m = new matcher.Matcher();

    m.send(offer("123: sell 10 COOKIES for 1"));
    m.send(offer("901: sell 10 COOKIES for 1"));

    expect(m.availableOffers).to.equal(2);
  })

  it('should match offers of same product', function() {
    var m = new matcher.Matcher();

    m.send(offer("123: sell 10 COOKIES for 1"));
    m.send(offer("901: buy 10 FLOWERS for 1"));

    expect(m.availableOffers).to.equal(2);
  })

  it('should match offers of same price', function() {
    var m = new matcher.Matcher();

    m.send(offer("123: sell 10 COOKIES for 1"));
    m.send(offer("901: buy 10 COOKIES for 1.5"));

    expect(m.availableOffers).to.equal(2);
  })

  it('should match opposite offers', function(done) {
    var m = new matcher.Matcher();
    expectDeals(m, ["901 buys 10: 10 from 123"], done);

    m.send(offer("123: sell 10 COOKIES for 1"));
    m.send(offer("901: buy 10 COOKIES for 1"));

    expect(m.availableOffers).to.equal(0);
  })

  it('should match up to amount available on opposite side', function(done) {
    var m = new matcher.Matcher();
    expectDeals(m, ["901 buys 5: 5 from 123"], done);

    m.send(offer("123: sell 10 COOKIES for 1"));
    m.send(offer("901: buy 5 COOKIES for 1"));

    expect(m.availableOffers).to.equal(1);
  })

  it('should match up to amount available on this side', function(done) {
    var m = new matcher.Matcher();
    expectDeals(m, ["901 buys 5: 5 from 123"], done);

    m.send(offer("123: sell 5 COOKIES for 1"));
    m.send(offer("901: buy 10 COOKIES for 1"));

    expect(m.availableOffers).to.equal(1);
  })

  it('should match until funds available', function(done) {
    var m = new matcher.Matcher();
    expectDeals(m, [
      "901 buys 5: 5 from 123",
      "921 buys 5: 5 from 123"
      ], done);

    m.send(offer("123: sell 10 COOKIES for 1"));
    m.send(offer("901: buy 5 COOKIES for 1"));
    m.send(offer("921: buy 5 COOKIES for 1"));

    expect(m.availableOffers).to.equal(0);
  })

  it('should match up to amount available on this side', function(done) {
    var m = new matcher.Matcher();
    expectDeals(m, ["901 buys 10: 5 from 123, 5 from 124"], done);

    m.send(offer("123: sell 5 COOKIES for 1"));
    m.send(offer("124: sell 5 COOKIES for 1"));
    m.send(offer("901: buy 10 COOKIES for 1"));

    expect(m.availableOffers).to.equal(0);
  })

  it('should match sequence of offers', function(done) {
    var m = new matcher.Matcher();
    expectDeals(m, [
      "124 buys 3: 3 from 123",
      "126 buys 10: 2 from 123, 8 from 125"
    ], done);

    m.send(offer("123: sell 5 COOKIES for 1"));
    m.send(offer("124: buy 3 COOKIES for 1"));
    m.send(offer("125: sell 8 COOKIES for 1"));
    m.send(offer("126: buy 10 COOKIES for 1"));

    expect(m.availableOffers).to.equal(0);
  })
});
