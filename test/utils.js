var chai = require('chai'),
  expect = chai.expect;

describe('Test utils', function() {

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

function toHuman(offer) {
  return offer.oid+": "
    +offer.is+" "+offer.amount+" "
    +offer.product+" for "+offer.price;
}

function dealToHuman(deal) {
  var ret = deal[0].oid + " deals "+deal[0].amount+": ";
  if (! (deal[1] instanceof Array)) {
    deal[1] = [deal[1]];
  }
  deal[1].forEach(function(d, idx, array) {
    ret += d.amount+" from "+d.oid;
    if (idx + 1 < array.length) {
      ret += ", ";
    }
  });
  return ret;
}

function deal(descr) {
  // "126 buys 10: 2 from 123, 8 from 125"
  var deal = descr.split(":");
  var args1 = deal[0].split(' ');
  var args2 = deal[1].split(',');
  var offers = [];
  args2.forEach(function(arg2) {
    var arg = arg2.trim().split(' ');
    offers.push({oid: parseInt(arg[2]), amount: parseFloat(arg[0])});
  })
  var offer1 = {oid: parseInt(args1[0]), amount: parseFloat(args1[2])};
  return [offer1, offers.length == 1? offers[0]: offers];
}

function expectDeals(matcher, expectedMatches, callback) {
  var actualMatches = [];
  expectedMatches.forEach(function(match, i) {
    expectedMatches[i] = match
      .replace('buys', 'deals')
      .replace('sells', 'deals');
  });

  matcher.on('match', function(offer1, offer2) {
    actualMatches.push(dealToHuman([offer1, offer2]));
    if (actualMatches.length === expectedMatches.length) {
      expect(actualMatches).to.deep.equal(expectedMatches);
      callback();
    }
  });
}

module.exports = {
  offer: offer,
  deal: deal,
  expectDeals: expectDeals,
  toHuman: toHuman
}
