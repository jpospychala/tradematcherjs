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

  it('should produce sell', function() {
    expect(deal("126 sells 10 BOOK for 3: 2 from 123, 8 from 125"))
    .to.deep.equal([
      {oid: 126, amount: 10, is: 'sell', product: 'BOOK', price: 3},
      [{oid: 123, amount: 2}, {oid: 125, amount: 8}]
    ]);
  });

  it('should produce buy', function() {
    expect(deal("126 buys 10 BOOK for 1: 2 from 123, 8 from 125"))
    .to.deep.equal([
      {oid: 126, amount: 10, is: 'buy', product: 'BOOK', price: 1},
      [{oid: 123, amount: 2}, {oid: 125, amount: 8}]
    ]);
  });

  it('should produce price', function() {
    expect(deal("126 sells 10 BOOKS for 3: 2 from 123, 8 from 125"))
    .to.deep.equal([
      {oid: 126, amount: 10, is: 'sell', product: 'BOOKS', price: 3},
      [{oid: 123, amount: 2}, {oid: 125, amount: 8}]
    ]);
  });
});
