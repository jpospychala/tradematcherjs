var Q = require('q');

function Storage() {

};

Storage.prototype.open = function() {
  var isOpen = Q.defer();
  isOpen.resolve();
  return isOpen.promise;
};

Storage.prototype.close = function() {
  var isClosed = Q.defer();
  isClosed.resolve();
  return isClosed.promise;
};

Storage.prototype.writeOffer = function() {
  var written = Q.defer();
  written.resolve();
  return written.promise;
}

Storage.prototype.writeDeal = function() {
  var written = Q.defer();
  written.resolve();
  return written.promise;
}

Storage.prototype.load = function() {
  var loaded = Q.defer();
  loaded.resolve();
  return loaded.promise;
}

module.exports = {
  Storage: Storage
}
