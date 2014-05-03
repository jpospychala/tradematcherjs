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


  return isOpen.promise;
};

Storage.prototype.close = function() {
  var isClosed = Q.defer();
  this.mongoClient.close(function() {
    isClosed.resolve();
  })
  return isClosed.promise;
};

Storage.prototype.writeOffer = function(offer) {
  var selector = {
    product: offer.product,
    price: offer.price
  };
  var doc = {
    $setOnInsert: {
      product: offer.product,
      price: offer.price,
    },
    $push: {}
  };
  doc['$push'][offer.is] = {oid: offer.oid, amount: offer.amount};
  var options = {
    upsert: true
  };
  return Q.ninvoke(this.offers, "update", selector, doc, options);
}

Storage.prototype.writeDeal = function(deal) {
  var selector = {
    product: "COOKIES",
    price: 3
  };
  var doc = {
    $pop: {sell: -1, buy: -1}
  };
  return Q.ninvoke(this.offers, "update", selector, doc);
}

Storage.prototype.load = function() {
  var deferred = Q.defer();
  this.offers.find(function(err, result) {
    if (err) {
      deferred.reject(err);
    }
    var model = {};
    result.each(function(err, item) {
      if (item == null) {
        deferred.resolve(model);
        return;
      }
      model[item.product] = model[item.product] || {};
      model[item.product][item.price] = {
        sell: item.sell || [],
        buy: item.buy || []
      }
    });
  });
  return deferred.promise;
}

Storage.prototype.clear = function() {
  return Q.ninvoke(this.offers, "remove", {});
}

module.exports = {
  Storage: Storage
}
