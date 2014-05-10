var Q = require('q'),
  mongodb = require('mongodb');

function Storage() {

};

Storage.prototype.open = function() {
  var that = this;
  var isOpen = Q.defer();
  this.mongoClient = new mongodb.MongoClient(
    new mongodb.Server('localhost', 27017),
    {native_parser: true});

  this.mongoClient.open(function(err, mongoclient) {
    if (err) {
      isOpen.reject(new Error(err));
    } else {
      that.offers = mongoclient.db('tradematcher').collection('offers');
      isOpen.resolve();
    }
  })


  return isOpen.promise
  .then(function() {
    return Q.ninvoke(that.offers, "ensureIndex", {"oid": 1}, {unique: true});
  });
};

Storage.prototype.close = function() {
  var isClosed = Q.defer();
  this.mongoClient.close(function() {
    isClosed.resolve();
  })
  return isClosed.promise;
};

Storage.prototype.writeOffer = function(offer) {
  return Q.ninvoke(this.offers, "insert", {
    product: offer.product,
    price: offer.price,
    oid: offer.oid,
    amount: offer.amount,
    is: offer.is
  });
}

Storage.prototype.writeDeal = function(deal) {
  var that = this;
  var updates = deal[1].map(function(d,idx) {
    var selector = {
      product: deal[0].product,
      price: deal[0].price,
      oid: {$in: [deal[0].oid, d.oid]}
    };
    var doc = {
      $inc: {amount: -d.amount}
    };
    return Q.ninvoke(that.offers, "update", selector, doc, {multi: true});
  });
  return Q.all(updates);
}

Storage.prototype.load = function() {
  var deferred = Q.defer();
  this.offers.find({
    amount: {$gt: 0}
  }, function(err, result) {
    if (err) {
      deferred.reject(err);
    }
    var model = {};
    result.each(function(err, item) {
      if (item == null) {
        deferred.resolve(model);
        return;
      }
      var a = item.product;
      var b = item.price;
      var c = item.is;
      model[a] = model[a] || {};
      model[a][b] = model[a][b] || {};
      model[a][b][c] = model[a][b][c] || [];
      model[a][b][c].push({oid: item.oid, amount: item.amount});
    });
  });
  return deferred.promise;
}

Storage.prototype.clear = function() {
  return Q.ninvoke(this.offers, "remove", {});
}

function not(is) {
  return is === 'sell' ? 'buy': 'sell';
}

module.exports = {
  Storage: Storage
}
