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

  it('should match buy, buy, sell, sell', function(done) {
    var m = new matcher.Matcher();
    expectDeals(m, [
      "3 buys 7: 2 from 1, 5 from 2",
      "4 buys 3: 3 from 2"
    ], done);

    var offers = [
      "1: sell 2 X for 1",
      "2: sell 8 X for 1",
      "3: buy 7 X for 1",
      "4: buy 3 X for 1"]
    offers.forEach(function(o) {
      m.send(offer(o));
    });

    expect(m.availableOffers).to.equal(0);
  })

  it('should match sequence of offers 2', function(done) {
    var m = new matcher.Matcher();
    expectDeals(m, [
        "3 sells 111: 111 from 5",
        "1 sells 110: 43 from 5, 67 from 4",
        "2 sells 70: 70 from 4",
        "6 buys 50: 50 from 2"
    ], done);

    var offers = [
      "5: buy 154 X for 1",
      "3: sell 111 X for 1",
      "4: buy 137 X for 1",
      "1: sell 110 X for 1",
      "2: sell 120 X for 1",
      "6: buy 50 X for 1"
    ]

    offers.forEach(function(o) {
      m.send(offer(o));
    });

    expect(m.availableOffers).to.equal(0, JSON.stringify(m.offers));
  });

  it('should match random offers', function() {
    var m = new matcher.Matcher();

    var offers = [];
    utils.generateOffers(offers, 1000, ['COOKIES'], [1, 2, 3], utils.random(100, 1000));
    offers.forEach(function(o) {
      m.send(o);
    });
    expect(m.availableOffers).to.equal(0, JSON.stringify(m.offers));
  });

  it('should discard an offer', function() {
    var m = new matcher.Matcher();

    m.send(offer("1: buy 2 X for 1"));
    m.discard(offer("1: buy 2 X for 1"));

    expect(m.availableOffers).to.equal(0, JSON.stringify(m.offers));
  });

  it('should discard existing offer', function() {
    var m = new matcher.Matcher();

    m.send(offer("2: buy 2 X for 1"));
    m.discard(offer("1: buy 2 X for 1"));

    expect(m.availableOffers).to.equal(1, JSON.stringify(m.offers));
  });

  it('should discard offer with different amount', function() {
    var m = new matcher.Matcher();

    m.send(offer("1: buy 10 X for 1"));
    m.send(offer("2: buy 10 X for 1"));
    m.send(offer("3: sell 13 X for 1"));
    m.send(offer("4: buy 10 X for 1"));
    m.discard(offer("2: buy 10 X for 1")); // 2 actually has 7 atm
    m.send(offer("5: sell 10 X for 1"));

    expect(m.availableOffers).to.equal(0, JSON.stringify(m.offers));
  });
});
