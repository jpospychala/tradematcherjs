var chai = require('chai'),
  expect = chai.expect,
  utils = require('./utils'),
  deal = utils.deal,
  offer = utils.offer,
  expectDeals = utils.expectDeals;

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
