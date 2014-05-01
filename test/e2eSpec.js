var chai = require('chai'),
  expect = chai.expect,
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

  it('should produce offer', function() {
    expect(offer("901: buy 10 COOKIES for 1"))
    .to.deep.equal({
      product: 'COOKIES',
      price: 1,
      is: 'buy',
      amount: 10,
      oid: 901
    });
  });

  it('should produce deal', function() {
    expect(deal("126 buys 10: 2 from 123, 8 from 125"))
    .to.deep.equal([
      {oid: 126, amount: 10},
      [{oid: 123, amount: 2}, {oid: 125, amount: 8}]
    ]);
  })

});

function offer(descr) {
  // "123: sell 1 COOKIES for 3"
  var args = descr.split(' ');
  return {
    is: args[1],
    amount: parseFloat(args[2]),
    product: args[3],
    price: parseFloat(args[5]),
    oid: parseInt(args[0].replace(":", "")) };
}

function deal(descr) {
  // "126 buys 10: 2 from 123, 8 from 125"
  var deal = descr.split(":");
  var args1 = deal[0].split(' ');
  var args2 = deal[1].split(',');
  var offers = [];
  for (var i=0; i < args2.length; i++) {
    var arg = args2[i].trim().split(' ');
    offers.push({oid: parseInt(arg[2]), amount: parseFloat(arg[0])});
  }
  var offer1 = {oid: parseInt(args1[0]), amount: parseFloat(args1[2])};
  return [offer1, offers.length == 1? offers[0]: offers];
}

function expectDeals(matcher, expectedMatches, callback) {
  var actualMatches = [];
  for (var i=0; i < expectedMatches.length; i++) {
    expectedMatches[i] = deal(expectedMatches[i]);
  }

  matcher.on('match', function(offer1, offer2) {
    actualMatches.push([offer1, offer2]);
    if (actualMatches.length === expectedMatches.length) {
      expect(actualMatches).to.deep.equal(expectedMatches);
      callback();
    }
  });
}
