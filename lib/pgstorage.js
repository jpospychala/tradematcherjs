var Q = require('q'),
  pg = require('pg');

function Storage() {

};

Storage.prototype.open = function() {
  var that = this;
  var isOpen = Q.defer();
  var connString = 'postgres://jacek@localhost/tradematcherjs';
  pg.connect(connString, function(err, client, done) {
    if (err) {
      isOpen.reject(new Error(err));
      return;
    }

    that.client = client;
    isOpen.resolve();
  });
  return isOpen.promise
  .then(that.migrate.bind(that));
};

Storage.prototype.close = function() {
  var isClosed = Q.defer();
  this.client.on('end', function(err, result) {
    if (err) {
      isClosed.reject(new Error(err));
      return;
    }
    isClosed.resolve();
  });
  this.client.end();
  return isClosed.promise;
};

Storage.prototype.writeOffer = function(offer) {
  return this.query('INSERT INTO offers (oid,product,price,amount) VALUES($1, $2, $3, $4)',
  [offer.oid, offer.product, offer.price, offer.amount]);
}

Storage.prototype.writeDeal = function(deal) {
  var that = this;
  var updates = deal[1].map(function(d,idx) {
    return that.query('UPDATE offers SET amount = amount - $1 WHERE oid IN ($2, $3)',
    [d.amount, deal[0].oid, d.oid]);
  });
  return Q.all(updates);
}

Storage.prototype.load = function() {
  return this.query("SELECT * FROM offers WHERE amount > 0")
  .then(function(result) {
    var model = {};
    result.rows.forEach(function(err, item) {
      var a = item.product;
      var b = item.price;
      var c = item.is;
      model[a] = model[a] || {};
      model[a][b] = model[a][b] || {};
      model[a][b][c] = model[a][b][c] || [];
      model[a][b][c].push({oid: item.oid, amount: item.amount});
    });
    return model;
  });
}

Storage.prototype.clear = function() {
  return this.query("DELETE FROM offers");
}

Storage.prototype.query = function(query, params) {
  return Q.ninvoke(this.client, "query", query, params);
}

Storage.prototype.migrate = function() {
  return this.query(
    "CREATE TABLE IF NOT EXISTS offers (oid int PRIMARY KEY, product VARCHAR(128), price NUMERIC(6), amount NUMERIC(6))");
}

function not(is) {
  return is === 'sell' ? 'buy': 'sell';
}

module.exports = {
  Storage: Storage
}
